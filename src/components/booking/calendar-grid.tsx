import { ChevronLeft, ChevronRight } from 'lucide-solid';
import { createSignal, For, Show } from 'solid-js';

import { cn } from '~/utils';

import type { Slots } from './api';

import { formatMonth, type Month, monthGrid, monthOf } from './dates';

type CalendarGridProps = {
	month: Month;
	today: string;
	slots?: Slots;
	loading: boolean;
	selected: string | null;
	onSelect: (day: string) => void;
	onMonth: (by: number) => void;
};

export type Flick = 'next' | 'back';

export const FLICK: Record<Flick | 'none', string> = {
	next: 'flick-next',
	back: 'flick-back',
	none: '',
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const nav =
	'flex justify-center items-center border border-white/10 hover:border-white/30 disabled:hover:border-white/10 focus-visible:border-white/60 focus-visible:outline-hidden w-8 h-8 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors duration-300 cursor-pointer disabled:cursor-default';

function CalendarGrid(props: CalendarGridProps) {
	const atCurrentMonth = () => {
		const current = monthOf(props.today);

		return props.month.year === current.year && props.month.month === current.month;
	};

	const available = (day: string) => (props.slots?.[day]?.length ?? 0) > 0;

	const [flick, setFlick] = createSignal<Flick | null>(null);

	function changeMonth(by: number) {
		setFlick(by > 0 ? 'next' : 'back');
		props.onMonth(by);
	}

	return (
		<div class='flex flex-col gap-4'>
			<div class='flex justify-between items-center'>
				<span class='font-semibold text-white tracking-tight'>
					{formatMonth(props.month)}
				</span>
				<div class='flex gap-1.5'>
					<button
						type='button'
						aria-label='Previous month'
						disabled={atCurrentMonth()}
						onClick={() => changeMonth(-1)}
						class={nav}
					>
						<ChevronLeft size={14} />
					</button>
					<button
						type='button'
						aria-label='Next month'
						onClick={() => changeMonth(1)}
						class={nav}
					>
						<ChevronRight size={14} />
					</button>
				</div>
			</div>

			<div class='flex flex-col gap-1'>
				<div class='gap-1 grid grid-cols-7'>
					<For each={WEEKDAYS}>
						{(weekday) => (
							<span class='pb-1 font-light text-[10px] text-neutral-500 text-center uppercase tracking-widest'>
								{weekday}
							</span>
						)}
					</For>
				</div>

				{/* Keyed on the month so the new grid remounts and replays the flick. */}
				<Show when={props.month} keyed>
					{(month) => (
						<div class={cn('gap-1 grid grid-cols-7', FLICK[flick() ?? 'none'])}>
							<For each={monthGrid(month)}>
								{(cell) => (
									<Show when={cell} fallback={<span />}>
										{(day) => {
											const isSelected = () => props.selected === day().key;
											const isOpen = () => available(day().key);

											return (
												<button
													type='button'
													disabled={!isOpen()}
													aria-pressed={isSelected()}
													aria-label={day().key}
													onClick={() => props.onSelect(day().key)}
													class={cn(
														'relative flex justify-center items-center border focus-visible:outline-hidden h-10 sm:h-12 text-sm tabular-nums transition-colors duration-300',
														isSelected()
															? 'bg-white border-white text-black font-medium'
															: isOpen()
																? 'bg-white/[0.03] border-white/10 hover:border-white/40 focus-visible:border-white/60 text-white cursor-pointer'
																: 'border-transparent text-neutral-700',
														props.loading &&
															'motion-safe:animate-pulse',
													)}
												>
													{day().day}
													<Show when={day().key === props.today}>
														<span
															class={cn(
																'bottom-1.5 absolute w-1 h-1',
																isSelected()
																	? 'bg-black'
																	: 'bg-white/60',
															)}
														/>
													</Show>
												</button>
											);
										}}
									</Show>
								)}
							</For>
						</div>
					)}
				</Show>
			</div>
		</div>
	);
}

export default CalendarGrid;
