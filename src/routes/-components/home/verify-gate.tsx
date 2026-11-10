import { createDerivedSpring, createSpring } from '@solid-primitives/spring';
import { Show } from 'solid-js';

import type { Point } from './pipeline-signal';

type GateState = 'idle' | 'pass' | 'fail';

type VerifyGateProps = {
	at: Point;
	state: GateState;
};

type RejectedProps = {
	at: Point;
};

/** One verification check on the outgoing line: ticks when the signal clears it, crosses when it is dropped. */
function VerifyGate(props: VerifyGateProps) {
	const pop = createDerivedSpring(() => (props.state === 'idle' ? 0 : 1), {
		stiffness: 0.12,
		damping: 0.55,
	});

	return (
		<g style={{ transform: `translate(${props.at.x}px, ${props.at.y}px)` }}>
			<rect
				class='fill-neutral-950 transition-colors duration-300'
				classList={{
					'stroke-white/30': props.state === 'idle',
					'stroke-white': props.state === 'pass',
					'stroke-white/50': props.state === 'fail',
				}}
				stroke-width='1'
				x='-3.5'
				y='-3.5'
				width='7'
				height='7'
				transform='rotate(45)'
			/>
			<g
				class='stroke-white'
				stroke-width='1.2'
				stroke-linecap='round'
				fill='none'
				opacity={Math.min(pop(), 1)}
				style={{ transform: `translateY(-11px) scale(${pop()})` }}
			>
				<Show
					when={props.state === 'fail'}
					fallback={<path d='M -2.5 0 L -0.75 1.75 L 2.5 -1.75' />}
				>
					<path class='stroke-white/60' d='M -2 -2 L 2 2 M 2 -2 L -2 2' />
				</Show>
			</g>
		</g>
	);
}

/** A signal that failed a check drops off the line and fades. */
function RejectedSignal(props: RejectedProps) {
	const [fade, setFade] = createSpring(0, { stiffness: 0.03, damping: 1 });

	void setFade(1);

	return (
		<circle
			class='fill-white'
			cx={props.at.x}
			cy={props.at.y + fade() * 10}
			r='2.6'
			opacity={1 - fade()}
		/>
	);
}

export { RejectedSignal, VerifyGate };
export type { GateState };
