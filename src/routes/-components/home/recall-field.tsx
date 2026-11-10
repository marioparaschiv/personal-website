import { createMemo, createSignal, For, Index } from 'solid-js';
import { createSpring } from '@solid-primitives/spring';

import useAmbientLoop from '~/components/hooks/use-ambient-loop';
import { cn } from '~/utils';

type Point = {
	x: number;
	y: number;
};

const WIDTH = 200;
const HEIGHT = 80;
const RECALLED = 3;

const NOTES: Point[] = [
	{ x: 14, y: 18 },
	{ x: 38, y: 52 },
	{ x: 52, y: 14 },
	{ x: 66, y: 66 },
	{ x: 78, y: 34 },
	{ x: 96, y: 12 },
	{ x: 104, y: 56 },
	{ x: 118, y: 30 },
	{ x: 132, y: 70 },
	{ x: 146, y: 20 },
	{ x: 158, y: 48 },
	{ x: 172, y: 10 },
	{ x: 182, y: 64 },
	{ x: 190, y: 36 },
	{ x: 24, y: 72 },
	{ x: 88, y: 76 },
];

const QUERIES: Point[] = [
	{ x: 60, y: 40 },
	{ x: 150, y: 38 },
	{ x: 110, y: 22 },
	{ x: 40, y: 30 },
	{ x: 170, y: 58 },
	{ x: 96, y: 62 },
];

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function RecallField() {
	const [step, setStep] = createSignal(0);
	const [query, setQuery] = createSpring(QUERIES[0], { stiffness: 0.05, damping: 0.6 });

	const recalled = createMemo(() => {
		const target = QUERIES[step()];

		return NOTES.map((note, index) => ({ index, gap: distance(note, target) }))
			.sort((a, b) => a.gap - b.gap)
			.slice(0, RECALLED)
			.map((entry) => entry.index);
	});

	useAmbientLoop(() => {
		const next = (step() + 1) % QUERIES.length;

		setStep(next);
		setQuery(QUERIES[next]);
	}, 2600);

	return (
		<div class='flex flex-col gap-2 w-full'>
			<svg
				class='w-full h-auto overflow-visible'
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				aria-hidden='true'
			>
				<For each={recalled()}>
					{(index) => (
						<line
							class='stroke-white/50 animate-in duration-700 fade-in'
							stroke-width='1'
							x1={query().x}
							y1={query().y}
							x2={NOTES[index].x}
							y2={NOTES[index].y}
						/>
					)}
				</For>
				<Index each={NOTES}>
					{(note, index) => (
						<circle
							class={cn(
								'transition-[fill,scale] duration-500 [transform-box:fill-box] origin-center',
								recalled().includes(index)
									? 'fill-white scale-150'
									: 'fill-white/20 group-hover:fill-white/35',
							)}
							cx={note().x}
							cy={note().y}
							r='2'
						/>
					)}
				</Index>
				<circle
					class='fill-none stroke-white'
					stroke-width='1'
					cx={query().x}
					cy={query().y}
					r='5'
				/>
				<circle class='fill-white' cx={query().x} cy={query().y} r='1.25' />
			</svg>
			<div class='flex justify-between font-light text-[10px] text-neutral-600 uppercase tracking-widest'>
				<span>Half a thought</span>
				<span class='text-white'>{RECALLED} recalled</span>
			</div>
		</div>
	);
}

export default RecallField;
