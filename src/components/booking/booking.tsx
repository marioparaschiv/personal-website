import {
	batch,
	createEffect,
	createMemo,
	createSignal,
	Match,
	onCleanup,
	Show,
	Switch,
} from 'solid-js';
import { CalendarDays, Check, Globe } from 'lucide-solid';

import Combobox from '~/components/ui/combobox';
import { site } from '~/content/site';

import { formatDay, formatTime, monthOf, monthRange, shiftMonth, todayIn } from './dates';
import { type Booking as Booked, fetchSlots, type Slots } from './api';
import CalendarGrid, { FLICK, type Flick } from './calendar-grid';
import { DEFAULT_EVENT, DETECTED_ZONE, EVENTS } from './defaults';
import BookingForm, { type BookingEvent } from './booking-form';
import AutoHeight from './auto-height';
import Segmented from './segmented';
import SlotList from './slot-list';

type Confirmed = {
	booking: Booked;
	email: string;
};

const SUPPORTED_ZONES = Intl.supportedValuesOf('timeZone');

// The detected zone can be an alias (e.g. `UTC`) that the canonical list leaves out.
const ZONES = SUPPORTED_ZONES.includes(DETECTED_ZONE)
	? SUPPORTED_ZONES
	: [DETECTED_ZONE, ...SUPPORTED_ZONES];

const zoneLabel = (zone: string) => zone.replaceAll('_', ' ');

const DURATIONS = EVENTS.map((event) => ({ value: event, label: `${event.minutes} min` }));

function Booking() {
	const [timeZone, setTimeZone] = createSignal(DETECTED_ZONE);
	const [event, setEvent] = createSignal<BookingEvent>(DEFAULT_EVENT);
	const today = createMemo(() => todayIn(timeZone()));

	const [month, setMonth] = createSignal(monthOf(today()));
	const [selected, setSelected] = createSignal<string | null>(null);
	const [start, setStart] = createSignal<string | null>(null);
	const [hour12, setHour12] = createSignal(false);
	const [confirmed, setConfirmed] = createSignal<Confirmed | null>(null);
	const [timesScroll, setTimesScroll] = createSignal(0);

	// Starts null so the first view doesn't flick on top of the page's own enter animation.
	const [flick, setFlick] = createSignal<Flick | null>(null);
	const flickClass = () => FLICK[flick() ?? 'none'];

	const [available, setAvailable] = createSignal<Slots>();
	const [loading, setLoading] = createSignal(true);
	const [failed, setFailed] = createSignal(false);

	const times = () => available()?.[selected() ?? ''] ?? [];

	// A plain effect instead of createResource so loading never suspends the whole route.
	createEffect(() => {
		const query = { ...monthRange(month()), timeZone: timeZone(), event: event().slug };
		let stale = false;

		setLoading(true);
		setFailed(false);

		fetchSlots(query)
			.then((slots) => !stale && setAvailable(slots))
			.catch(() => !stale && setFailed(true))
			.finally(() => !stale && setLoading(false));

		onCleanup(() => (stale = true));
	});

	// Jump straight to the first open day so a visitor sees bookable times without hunting.
	createEffect(() => {
		const open = available();

		if (loading() || !open || (selected() && open[selected() ?? ''])) return;

		setSelected(Object.keys(open).sort()[0] ?? null);
	});

	function changeMonth(by: number) {
		batch(() => {
			setSelected(null);
			setMonth(shiftMonth(month(), by));
		});
	}

	return (
		<section class='flex flex-col bg-neutral-950/60 backdrop-blur-sm border border-white/10'>
			<div class='flex flex-wrap justify-between items-center gap-3 p-5 sm:px-6 border-white/10 border-b font-light text-[10px] text-neutral-500 sm:text-xs uppercase tracking-widest'>
				<span class='flex items-center gap-3'>
					<span class='flex justify-center items-center bg-white/5 border border-white/10 w-7 h-7 text-neutral-300'>
						<CalendarDays size={14} />
					</span>
					Book a call
					<Show when={!start() && !confirmed()} fallback={<>· {event().minutes} min</>}>
						<Segmented
							label='Call length'
							value={event()}
							options={DURATIONS}
							onChange={setEvent}
						/>
					</Show>
				</span>

				<Combobox
					label='Time zone'
					value={timeZone()}
					options={ZONES}
					optionValue={(zone) => zone}
					optionLabel={zoneLabel}
					onChange={setTimeZone}
					icon={<Globe class='shrink-0' size={12} />}
					placeholder='Search time zones'
					class='w-full sm:w-56'
				/>
			</div>

			<AutoHeight>
				<div class='p-5 sm:p-6'>
					<Switch>
						<Match when={confirmed()}>
							{(done) => (
								<div
									class={`flex flex-col items-center gap-4 py-10 text-center ${flickClass()}`}
								>
									<span class='flex justify-center items-center bg-white w-10 h-10 text-black'>
										<Check size={18} />
									</span>
									<span class='font-semibold text-white text-2xl tracking-tight'>
										You're booked
									</span>
									<p class='max-w-sm text-neutral-400 text-sm leading-relaxed'>
										{formatDay(selected() ?? '')} at{' '}
										{formatTime(done().booking.start, timeZone(), hour12())}. A
										calendar invite with the {site.booking.location} link is on
										its way to {done().email}.
									</p>
								</div>
							)}
						</Match>

						<Match when={start()}>
							{(picked) => (
								<div class={flickClass()}>
									<BookingForm
										event={event()}
										start={picked()}
										day={selected() ?? ''}
										timeZone={timeZone()}
										hour12={hour12()}
										onBack={() => {
											setFlick('back');
											setStart(null);
										}}
										onBooked={(booking, email) => {
											setFlick('next');
											setConfirmed({ booking, email });
										}}
									/>
								</div>
							)}
						</Match>

						<Match when={failed()}>
							<p class='py-16 font-light text-neutral-500 text-xs text-center uppercase tracking-widest'>
								Couldn't load availability. Email me instead.
							</p>
						</Match>

						<Match when={true}>
							<div
								class={`gap-6 sm:gap-8 grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] ${flickClass()}`}
							>
								<CalendarGrid
									month={month()}
									today={today()}
									slots={available()}
									loading={loading()}
									selected={selected()}
									onSelect={setSelected}
									onMonth={changeMonth}
								/>
								<SlotList
									day={selected()}
									times={times()}
									timeZone={timeZone()}
									hour12={hour12()}
									loading={loading()}
									scrollTop={timesScroll()}
									onScrollTop={setTimesScroll}
									onHour12={setHour12}
									onPick={(picked) => {
										setFlick('next');
										setStart(picked);
									}}
								/>
							</div>
						</Match>
					</Switch>
				</div>
			</AutoHeight>
		</section>
	);
}

export default Booking;
