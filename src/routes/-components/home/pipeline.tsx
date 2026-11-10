import { createDerivedSpring, createSpring } from '@solid-primitives/spring';
import { createSignal, For, Index, Show } from 'solid-js';

import useAmbientFrame from '~/components/hooks/use-ambient-frame';

import { type Ping, type Point, SignalLabel, SignalPing } from './pipeline-signal';
import { type GateState, RejectedSignal, VerifyGate } from './verify-gate';

type Lane = {
	label: string;
	from: Point;
	c1: Point;
	c2: Point;
	to: Point;
};

type Rejection = {
	id: number;
	at: Point;
};

type Packet = {
	lane: number;
	t: number;
	speed: number;
	relevant: boolean;
};

const HUB: Point = { x: 214, y: 70 };
const OUT: Point = { x: 340, y: 70 };
const SOURCES = ['In-01', 'In-02', 'In-03', 'In-04'];
const BATCH = 5;
const SPAWN_EVERY = 0.12;
const RELEVANT_SHARE = 0.22;
const GATES = [0.3, 0.52, 0.74];
// Gate each signal fails at, or -1 to pass. Two passes per rejection, and every gate gets a turn.
const OUTCOMES = [-1, -1, 1, -1, -1, 2, -1, -1, 0];
const IDLE: GateState[] = GATES.map(() => 'idle');

const LANES: Lane[] = SOURCES.map((label, index) => {
	const y = 16 + index * 36;

	return {
		label,
		from: { x: 52, y },
		c1: { x: 125, y },
		c2: { x: 155, y: HUB.y },
		to: { x: HUB.x - 12, y: HUB.y },
	};
});

const EXIT: Lane = {
	label: 'Signal',
	from: { x: HUB.x + 12, y: HUB.y },
	c1: { x: 260, y: HUB.y },
	c2: { x: 290, y: HUB.y },
	to: { x: OUT.x - 8, y: OUT.y },
};

function bezier(lane: Lane, t: number): Point {
	const u = 1 - t;
	const a = u * u * u;
	const b = 3 * u * u * t;
	const c = 3 * u * t * t;
	const d = t * t * t;

	return {
		x: a * lane.from.x + b * lane.c1.x + c * lane.c2.x + d * lane.to.x,
		y: a * lane.from.y + b * lane.c1.y + c * lane.c2.y + d * lane.to.y,
	};
}

const pathOf = (lane: Lane) =>
	`M ${lane.from.x} ${lane.from.y} C ${lane.c1.x} ${lane.c1.y} ${lane.c2.x} ${lane.c2.y} ${lane.to.x} ${lane.to.y}`;

function arcPath(progress: number, radius: number) {
	const angle = Math.min(progress, 0.999) * Math.PI * 2 - Math.PI / 2;
	const x = HUB.x + Math.cos(angle) * radius;
	const y = HUB.y + Math.sin(angle) * radius;

	return `M ${HUB.x} ${HUB.y - radius} A ${radius} ${radius} 0 ${progress > 0.5 ? 1 : 0} 1 ${x} ${y}`;
}

function Pipeline() {
	const [packets, setPackets] = createSignal<Packet[]>([]);
	const [exit, setExit] = createSignal<number>();
	const [ping, setPing] = createSignal<Ping>();
	const [events, setEvents] = createSignal(0);
	const [signals, setSignals] = createSignal(0);
	const [batch, setBatch] = createSignal(0);
	const fill = createDerivedSpring(() => batch() / BATCH, { stiffness: 0.1, damping: 0.8 });
	const [pulse, setPulse] = createSpring(0, { stiffness: 0.08, damping: 0.6 });
	const [checks, setChecks] = createSignal<GateState[]>(IDLE);
	const [rejected, setRejected] = createSignal<Rejection>();
	const [dropped, setDropped] = createSignal(0);

	let spawnIn = 0;
	let id = 0;
	let failAt = -1;
	let outcome = 0;

	useAmbientFrame((delta) => {
		spawnIn -= delta;

		const next: Packet[] = [];
		let arrived = 0;

		for (const packet of packets()) {
			const t = packet.t + packet.speed * delta;

			if (t < 1) {
				next.push({ ...packet, t });
				continue;
			}

			setEvents((count) => count + 1);

			if (packet.relevant) arrived += 1;
		}

		if (spawnIn <= 0) {
			spawnIn = SPAWN_EVERY * (0.5 + Math.random());
			next.push({
				lane: Math.floor(Math.random() * LANES.length),
				t: 0,
				speed: 0.55 + Math.random() * 0.35,
				relevant: Math.random() < RELEVANT_SHARE,
			});
		}

		setPackets(next);

		// Relevant events fill the hub; a full batch is aggregated into one outgoing signal.
		if (arrived > 0) {
			const total = batch() + arrived;

			if (total >= BATCH && exit() === undefined) {
				setBatch(0);
				setExit(0);
				setPulse(1);
				setChecks(IDLE);
				failAt = OUTCOMES[outcome];
				outcome = (outcome + 1) % OUTCOMES.length;
			} else {
				setBatch(Math.min(total, BATCH));
			}
		}

		const out = exit();

		if (out === undefined) return;

		const t = out + delta * 1.4;

		if (t > 0.15) setPulse(0);

		const gate = checks().findIndex((state, index) => state === 'idle' && t >= GATES[index]);

		if (gate !== -1) {
			setChecks((states) =>
				states.map((state, index) =>
					index === gate ? (gate === failAt ? 'fail' : 'pass') : state,
				),
			);

			if (gate === failAt) {
				setExit(undefined);
				setRejected({ id: (id += 1), at: bezier(EXIT, GATES[gate]) });
				setDropped((count) => count + 1);

				return;
			}
		}

		if (t < 1) {
			setExit(t);

			return;
		}

		setExit(undefined);
		setPing({ id: (id += 1), target: OUT, count: BATCH });
		setSignals((count) => count + 1);
	});

	return (
		<div class='flex flex-col self-stretch gap-2 w-full'>
			<svg
				class='flex-1 w-full min-h-20 short-phone:max-h-20'
				viewBox='0 0 400 140'
				aria-hidden='true'
			>
				<For each={LANES}>
					{(lane) => (
						<>
							<path
								class='fill-none stroke-white/10'
								stroke-width='1'
								d={pathOf(lane)}
							/>
							<text
								class='fill-neutral-500 font-mono text-[6.5px] uppercase tracking-widest'
								x={lane.from.x - 6}
								y={lane.from.y + 2}
								text-anchor='end'
							>
								{lane.label}
							</text>
							<circle
								class='fill-white/30'
								cx={lane.from.x}
								cy={lane.from.y}
								r='1.5'
							/>
						</>
					)}
				</For>
				<path class='fill-none stroke-white/20' stroke-width='1' d={pathOf(EXIT)} />

				<Index each={packets()}>
					{(packet) => {
						const point = () => bezier(LANES[packet().lane], packet().t);

						return (
							<circle
								class={packet().relevant ? 'fill-white' : 'fill-white/35'}
								cx={point().x}
								cy={point().y}
								r={packet().relevant ? 1.8 : 1.1}
							/>
						);
					}}
				</Index>

				<circle
					class='fill-neutral-950 stroke-white/30'
					stroke-width='1'
					cx={HUB.x}
					cy={HUB.y}
					r={12 + pulse() * 3}
				/>
				<path
					class='fill-none stroke-white'
					stroke-width='1.5'
					stroke-linecap='round'
					d={arcPath(fill(), 12 + pulse() * 3)}
					opacity={fill() > 0.01 ? 1 : 0}
				/>
				<text
					class='fill-white font-mono text-[7px] tabular-nums'
					x={HUB.x}
					y={HUB.y + 2.5}
					text-anchor='middle'
				>
					{batch()}/{BATCH}
				</text>

				<text
					class='fill-neutral-600 font-mono text-[6px] uppercase tracking-widest'
					x={bezier(EXIT, GATES[1]).x}
					y={HUB.y + 16}
					text-anchor='middle'
				>
					Verify
				</text>
				<Index each={checks()}>
					{(state, index) => (
						<VerifyGate at={bezier(EXIT, GATES[index])} state={state()} />
					)}
				</Index>
				<Show when={rejected()} keyed>
					{(current) => <RejectedSignal at={current.at} />}
				</Show>

				<Show when={exit()}>
					{(t) => {
						const point = () => bezier(EXIT, t());

						return <circle class='fill-white' cx={point().x} cy={point().y} r='2.6' />;
					}}
				</Show>

				<circle
					class='fill-none stroke-white/40'
					stroke-width='1'
					cx={OUT.x}
					cy={OUT.y}
					r='8'
				/>
				<circle class='fill-white' cx={OUT.x} cy={OUT.y} r='2' />
				<Show when={ping()} keyed>
					{(current) => (
						<>
							<SignalPing ping={current} />
							<SignalLabel at={current.target} count={current.count} />
						</>
					)}
				</Show>
			</svg>
			<div class='flex justify-between font-light text-[10px] text-neutral-600 uppercase tabular-nums tracking-widest'>
				<span>{events().toLocaleString('en-US')} events</span>
				<span>
					<span class='text-white'>{signals()} verified</span> · {dropped()} rejected
				</span>
			</div>
		</div>
	);
}

export default Pipeline;
