import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-solid';
import { Index } from 'solid-js';

import { cn } from '~/utils';

import { clamp } from './layout';

type RulerProps = {
	position: number;
	count: number;
	loop: boolean;
	dragging: boolean;
	selectLabel: string;
	onDragStart: (event: PointerEvent, unit: number) => void;
	onGoTo: (index: number) => void;
	onStep: (direction: number) => void;
	onSelect: () => void;
};

type Tick = {
	value: number;
	major: boolean;
};

const ITEM_GAP = 72;
const SUBDIVISIONS = 4;
const HALF_SPAN = 2.5;
const SLOTS = HALF_SPAN * 2 * SUBDIVISIONS + 2;

// The pseudo-element widens the hit area well past the 32px glyph box without moving the layout.
const arrow =
	'group/arrow relative flex justify-center items-center w-8 h-8 text-neutral-500 hover:text-white focus-visible:text-white focus-visible:outline-hidden transition-colors duration-300 cursor-pointer before:absolute before:-inset-3';

const arrowIcon = 'transition-[translate] duration-300 ease-out group-active/arrow:duration-100';

function Ruler(props: RulerProps) {
	const ticks = () => {
		const first = Math.ceil((props.position - HALF_SPAN) * SUBDIVISIONS);

		return Array.from({ length: SLOTS }, (_, slot): Tick => {
			const step = first + slot;

			return { value: step / SUBDIVISIONS, major: step % SUBDIVISIONS === 0 };
		});
	};

	function inRange(value: number) {
		return props.loop || (value >= 0 && value <= props.count - 1);
	}

	function wrap(value: number) {
		return ((Math.round(value) % props.count) + props.count) % props.count;
	}

	return (
		<div class='flex justify-center items-center gap-2'>
			<button
				type='button'
				aria-label='Previous project'
				class={arrow}
				onClick={() => props.onStep(-1)}
			>
				<ChevronLeft
					class={cn(
						arrowIcon,
						'group-hover/arrow:-translate-x-0.5 group-active/arrow:-translate-x-1',
					)}
					size={16}
				/>
			</button>

			<div
				class={cn(
					'relative h-8 overflow-hidden touch-pan-y',
					props.dragging ? 'cursor-grabbing' : 'cursor-grab',
				)}
				onPointerDown={(event) => props.onDragStart(event, ITEM_GAP)}
				style={{
					width: `${HALF_SPAN * 2 * ITEM_GAP}px`,
					'mask-image':
						'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
				}}
			>
				<Index each={ticks()}>
					{(tick) => {
						const offset = () => tick().value - props.position;

						return (
							<button
								type='button'
								tabIndex={-1}
								aria-hidden='true'
								disabled={!tick().major || !inRange(tick().value)}
								class='top-0 left-1/2 absolute flex justify-center items-center w-4 h-full -translate-x-1/2 cursor-pointer disabled:cursor-[inherit]'
								style={{
									translate: `${offset() * ITEM_GAP}px 0`,
									visibility: inRange(tick().value) ? 'visible' : 'hidden',
								}}
								onClick={() => props.onGoTo(wrap(tick().value))}
							>
								<span
									class={cn('bg-white w-px', tick().major ? 'h-3' : 'h-1.5')}
									style={{
										opacity: tick().major
											? 0.25 + 0.5 * clamp(1 - Math.abs(offset()), 0, 1)
											: 0.15,
									}}
								/>
							</button>
						);
					}}
				</Index>

				<button
					type='button'
					aria-label={props.selectLabel}
					class='group/select top-0 left-1/2 absolute flex justify-center items-center bg-neutral-950 border border-white/30 hover:border-white/60 focus-visible:border-white focus-visible:outline-hidden w-8 h-8 text-white -translate-x-1/2 transition-colors duration-300 cursor-pointer'
					onClick={() => props.onSelect()}
				>
					<ArrowUpRight
						class='transition-[translate] group-hover/select:-translate-y-px group-hover/select:translate-x-px duration-300'
						size={14}
					/>
				</button>
			</div>

			<button
				type='button'
				aria-label='Next project'
				class={arrow}
				onClick={() => props.onStep(1)}
			>
				<ChevronRight
					class={cn(
						arrowIcon,
						'group-hover/arrow:translate-x-0.5 group-active/arrow:translate-x-1',
					)}
					size={16}
				/>
			</button>
		</div>
	);
}

export default Ruler;
