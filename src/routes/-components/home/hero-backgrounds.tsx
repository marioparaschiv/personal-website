import { Match, Show, Switch } from 'solid-js';

import DarkVeil from '~/components/effects/dark-veil';
import Beams from '~/components/effects/beams';

export type HeroBackgroundVariant =
	| 'beams'
	| 'veil-gray'
	| 'veil-tint'
	| 'grain-glow'
	| 'eclipse'
	| 'beams-quiet';

type HeroBackgroundProps = {
	variant: HeroBackgroundVariant;
};

type BeamsLayerProps = {
	speed: number;
};

export const HERO_BACKGROUND_VARIANTS: HeroBackgroundVariant[] = [
	'beams',
	'veil-gray',
	'veil-tint',
	'grain-glow',
	'eclipse',
	'beams-quiet',
];

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

// The project pages default to hue 0, so the tinted variant matches them exactly.
const projectHue = () => 0;

function BeamsLayer(props: BeamsLayerProps) {
	return (
		<Beams
			beamWidth={3}
			beamHeight={30}
			beamNumber={12}
			lightColor='#ffffff'
			speed={props.speed}
			noiseIntensity={1.75}
			scale={0.2}
			rotation={35}
		/>
	);
}

function Veil() {
	return <DarkVeil target={projectHue} speed={0.3} warpAmount={0.5} />;
}

function Grain() {
	return (
		<div
			class='absolute -inset-20 opacity-[0.07] motion-safe:animate-[hero-grain_1s_steps(6)_infinite] pointer-events-none'
			style={{ 'background-image': GRAIN }}
		/>
	);
}

function HeroBackground(props: HeroBackgroundProps) {
	return (
		<div class='z-0 absolute inset-0 overflow-hidden animate-in duration-1000 ease-out fade-in'>
			<Switch>
				<Match when={props.variant === 'beams'}>
					<div class='absolute inset-0 opacity-50'>
						<BeamsLayer speed={2} />
					</div>
				</Match>

				<Match when={props.variant === 'veil-gray'}>
					<div class='absolute inset-0 opacity-60 grayscale'>
						<Veil />
					</div>
				</Match>

				<Match when={props.variant === 'veil-tint'}>
					<div class='absolute inset-0 opacity-40'>
						<Veil />
					</div>
				</Match>

				<Match when={props.variant === 'grain-glow'}>
					<div class='top-1/2 left-1/2 absolute bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)] w-[70vmax] h-[45vmax] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[hero-breathe_8s_ease-in-out_infinite_alternate]' />
					<Grain />
				</Match>

				<Match when={props.variant === 'eclipse'}>
					<div class='-bottom-[60vmax] left-1/2 absolute bg-black shadow-[0_-2px_0_rgba(255,255,255,0.35),0_-40px_120px_rgba(255,255,255,0.12)] rounded-[50%] w-[120vmax] h-[80vmax] -translate-x-1/2' />
					<Grain />
				</Match>

				<Match when={props.variant === 'beams-quiet'}>
					<div class='absolute inset-0 opacity-25'>
						<BeamsLayer speed={1} />
					</div>
				</Match>
			</Switch>

			{/* Keeps the name readable when a bright patch drifts behind it. */}
			<Show when={props.variant !== 'beams'}>
				<div class='absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_center,rgba(0,0,0,0.7),transparent)] pointer-events-none' />
			</Show>
		</div>
	);
}

export default HeroBackground;
