import { createSpring, type SpringOptions } from '@solid-primitives/spring';
import { For, onMount } from 'solid-js';

type Point = {
	x: number;
	y: number;
};

type Ping = {
	id: number;
	target: Point;
	count: number;
};

type PingProps = {
	ping: Ping;
};

type LabelProps = {
	at: Point;
	count: number;
};

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

function useEntrance(options: SpringOptions) {
	const [progress, setProgress] = createSpring(0, options);

	onMount(() => void setProgress(1));

	return progress;
}

/** Rings ripple out of the merged point. */
function SignalPing(props: PingProps) {
	const progress = useEntrance({ stiffness: 0.02, damping: 1 });

	return (
		<For each={[0, 0.25, 0.5]}>
			{(delay) => {
				const local = () => clamp((progress() - delay) / (1 - delay));

				return (
					<circle
						class='fill-none stroke-white'
						stroke-width='1'
						vector-effect='non-scaling-stroke'
						cx={props.ping.target.x}
						cy={props.ping.target.y}
						r={4 + local() * 34}
						opacity={local() > 0 ? 1 - local() : 0}
					/>
				);
			}}
		</For>
	);
}

/** Counts the events a signal was built from. */
function SignalLabel(props: LabelProps) {
	const progress = useEntrance({ stiffness: 0.02, damping: 1 });

	return (
		<text
			class='fill-white font-mono text-[7px] tracking-widest'
			x={props.at.x}
			y={props.at.y - 14 - progress() * 6}
			text-anchor='middle'
			opacity={clamp(progress() * 3) * (1 - progress())}
		>
			SIGNAL ×{props.count}
		</text>
	);
}

export { SignalLabel, SignalPing };
export type { Ping, Point };
