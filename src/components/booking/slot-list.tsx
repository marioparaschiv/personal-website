import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { CalendarX2 } from 'lucide-solid';

import { usePrefersReducedMotion } from '~/components/hooks/use-media-query';

import { formatDay, formatTime } from './dates';
import Segmented from './segmented';

type SlotListProps = {
	day: string | null;
	times: string[];
	timeZone: string;
	hour12: boolean;
	loading: boolean;
	scrollTop: number;
	onScrollTop: (value: number) => void;
	onHour12: (value: boolean) => void;
	onPick: (start: string) => void;
};

const CLOCKS = [
	{ value: true, label: '12h' },
	{ value: false, label: '24h' },
];

const FADE = '2.5rem';

const SCROLL_MS = 400;

const SKELETON_WIDTHS = ['w-10', 'w-12', 'w-11', 'w-12', 'w-10', 'w-12', 'w-11', 'w-12'];

function SlotSkeleton() {
	return (
		<For each={SKELETON_WIDTHS}>
			{(width, index) => (
				<span
					aria-hidden='true'
					class='flex justify-center items-center border border-white/5 h-[42px] shrink-0'
				>
					<span
						class={`bg-white/10 h-2 ${width} motion-safe:animate-pulse`}
						style={{ 'animation-delay': `${index() * 120}ms` }}
					/>
				</span>
			)}
		</For>
	);
}

type NoTimesProps = {
	day: string | null;
};

function NoTimes(props: NoTimesProps) {
	return (
		<div class='flex flex-col justify-center items-center gap-3 h-full text-center'>
			<span class='flex justify-center items-center bg-white/5 border border-white/10 w-9 h-9 text-neutral-400'>
				<CalendarX2 size={16} />
			</span>
			<span class='font-semibold text-white text-sm tracking-tight'>
				{props.day ? 'No times left' : 'Nothing open this month'}
			</span>
			<p class='max-w-52 text-neutral-500 text-xs leading-relaxed'>
				{props.day ? 'Pick another day' : 'Try next month'}, or email me and we'll find a
				time that works.
			</p>
		</div>
	);
}

function SlotList(props: SlotListProps) {
	const [fadeTop, setFadeTop] = createSignal(false);
	const [fadeBottom, setFadeBottom] = createSignal(false);

	const reducedMotion = usePrefersReducedMotion();

	let scroller!: HTMLDivElement;
	let spacer!: HTMLDivElement;
	let lastScroll = props.scrollTop;
	let frame = 0;

	function measure() {
		setFadeTop(scroller.scrollTop > 1);
		setFadeBottom(scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1);
	}

	function onScroll() {
		measure();
		lastScroll = scroller.scrollTop;
		props.onScrollTop(lastScroll);
	}

	// A shorter list clamps scrollTop instantly, so a spacer holds the old offset open while it eases to the top.
	function scrollToTop() {
		cancelAnimationFrame(frame);
		spacer.style.height = '0px';

		const from = lastScroll;

		if (from <= 0 || reducedMotion()) {
			scroller.scrollTop = 0;
			measure();

			return;
		}

		const max = scroller.scrollHeight - scroller.clientHeight;

		spacer.style.height = `${Math.max(from - max, 0)}px`;
		scroller.scrollTop = from;

		const started = performance.now();

		const tick = (now: number) => {
			// rAF timestamps mark the frame start, which can precede `started`.
			const t = Math.min(Math.max((now - started) / SCROLL_MS, 0), 1);
			const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t);

			scroller.scrollTop = from * (1 - eased);

			if (t < 1) {
				frame = requestAnimationFrame(tick);

				return;
			}

			spacer.style.height = '0px';
			measure();
		};

		frame = requestAnimationFrame(tick);
	}

	onMount(() => {
		// The list remounts when returning from the form, so restore where the visitor left it.
		scroller.scrollTop = props.scrollTop;

		const resize = new ResizeObserver(measure);

		resize.observe(scroller);
		onCleanup(() => {
			resize.disconnect();
			cancelAnimationFrame(frame);
		});
	});

	createEffect(on(() => [props.day, props.times], scrollToTop, { defer: true }));

	const mask = () =>
		`linear-gradient(to bottom, transparent, black ${fadeTop() ? FADE : '0px'}, black calc(100% - ${fadeBottom() ? FADE : '0px'}), transparent)`;

	return (
		<div class='flex flex-col gap-4 h-[26rem] md:h-auto min-h-0'>
			<div class='flex justify-between items-center gap-3'>
				<span class='font-semibold text-white truncate tracking-tight'>
					{props.day ? formatDay(props.day) : 'Pick a day'}
				</span>
				<Segmented
					label='Clock format'
					value={props.hour12}
					options={CLOCKS}
					onChange={props.onHour12}
				/>
			</div>

			{/* Absolutely positioned so the times never size the panel: the calendar sets the height. */}
			<div class='relative flex-1 min-h-0'>
				<div
					ref={(el) => (scroller = el)}
					onScroll={onScroll}
					class='absolute inset-0 flex flex-col gap-1.5 -mr-2 pr-2 overflow-y-auto [scrollbar-width:thin]'
					style={{ 'mask-image': mask(), '-webkit-mask-image': mask() }}
				>
					<Show
						when={props.times.length > 0}
						fallback={props.loading ? <SlotSkeleton /> : <NoTimes day={props.day} />}
					>
						<For each={props.times}>
							{(start) => (
								<button
									type='button'
									onClick={() => props.onPick(start)}
									class='group relative py-2.5 border border-white/10 hover:border-white/30 focus-visible:border-white/60 focus-visible:outline-hidden overflow-hidden text-sm tabular-nums transition-colors duration-300 cursor-pointer shrink-0'
								>
									<span class='absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out' />
									<span class='relative'>
										{formatTime(start, props.timeZone, props.hour12)}
									</span>
								</button>
							)}
						</For>
					</Show>

					{/* Negative margin cancels the flex gap so the spacer adds nothing when collapsed. */}
					<div ref={(el) => (spacer = el)} aria-hidden='true' class='-mt-1.5 shrink-0' />
				</div>
			</div>
		</div>
	);
}

export default SlotList;
