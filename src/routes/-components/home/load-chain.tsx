import { createSpring } from '@solid-primitives/spring';
import { createSignal, For, Show } from 'solid-js';

import { usePrefersReducedMotion } from '~/components/hooks/use-media-query';
import useAmbientLoop from '~/components/hooks/use-ambient-loop';
import { cn } from '~/utils';

import PhoneToast from './phone-toast';

type LoadStep = {
	label: string;
	done: string;
};

const STEPS: LoadStep[] = [
	{ label: 'Tweak', done: 'Injected' },
	{ label: 'Bundle', done: 'Loaded' },
	{ label: 'Discord', done: 'Patched' },
];

type Frame = {
	stage: number;
	phone: number;
	toast: number;
};

// One frame per tick: light each step, cut to the phone, drop the toast in, lift it out, then
// return to a chain that was cleared while the phone still covered it.
const SEQUENCE: Frame[] = [
	{ stage: 1, phone: 0, toast: 0 },
	{ stage: 2, phone: 0, toast: 0 },
	{ stage: 3, phone: 0, toast: 0 },
	{ stage: 3, phone: 0, toast: 0 },
	{ stage: 3, phone: 1, toast: 0 },
	{ stage: 3, phone: 1, toast: 1 },
	{ stage: 3, phone: 1, toast: 1 },
	{ stage: 3, phone: 1, toast: 1 },
	{ stage: 3, phone: 1, toast: 0 },
	{ stage: 0, phone: 0, toast: 0 },
];

// The cleared chain, so the first tick lights the first step.
const FIRST = SEQUENCE.length - 1;

// Reduced motion never ticks, so it rests on the finished chain instead.
const FINISHED = 3;

function LoadChain() {
	const start = usePrefersReducedMotion()() ? FINISHED : FIRST;
	const [tick, setTick] = createSignal(start);
	const [progress, setProgress] = createSpring(SEQUENCE[start].stage, {
		stiffness: 0.07,
		damping: 0.85,
	});
	const [phone, setPhone] = createSpring(0, { stiffness: 0.08, damping: 0.9 });
	const [toast, setToast] = createSpring(0, { stiffness: 0.1, damping: 0.6 });

	const lit = (index: number) => progress() > index + 0.85;
	const fill = (index: number) => Math.min(Math.max(progress() - index - 1, 0), 1);

	useAmbientLoop(() => {
		const next = (tick() + 1) % SEQUENCE.length;
		const frame = SEQUENCE[next];

		setTick(next);
		setProgress(frame.stage, { hard: frame.stage === 0 });
		setPhone(frame.phone);
		setToast(frame.toast);
	}, 650);

	return (
		<div class='grid grid-cols-[minmax(0,1fr)] w-full'>
			<div
				class='flex flex-col col-start-1 row-start-1'
				style={{
					opacity: 1 - phone(),
					transform: `translateY(${phone() * -10}px) scale(${1 - phone() * 0.04})`,
				}}
			>
				<For each={STEPS}>
					{(step, index) => (
						<>
							<Show when={index() > 0}>
								<span class='relative bg-white/10 ml-4 w-px h-2'>
									<span
										class='absolute inset-0 bg-white origin-top'
										style={{ transform: `scaleY(${fill(index() - 1)})` }}
									/>
								</span>
							</Show>
							<div
								class={cn(
									'flex items-center gap-2.5 px-2.5 py-1.5 border font-light text-[10px] uppercase tracking-widest transition-colors duration-500',
									lit(index())
										? 'border-white/25 group-hover:border-white/40 bg-white/5 text-white'
										: 'border-white/5 text-neutral-500',
								)}
							>
								<span class='font-mono text-neutral-600 tabular-nums tracking-normal'>
									0{index() + 1}
								</span>
								{step.label}
								<span
									class={cn(
										'flex items-center gap-1.5 ml-auto transition-colors duration-500',
										lit(index()) ? 'text-neutral-300' : 'text-neutral-700',
									)}
								>
									<Show when={lit(index()) && index() === STEPS.length - 1}>
										<span class='bg-white rounded-full w-1.5 h-1.5 motion-safe:animate-pulse' />
									</Show>
									{lit(index()) ? step.done : 'Waiting'}
								</span>
							</div>
						</>
					)}
				</For>
			</div>
			<div
				class='col-start-1 row-start-1 pointer-events-none'
				style={{
					opacity: phone(),
					transform: `translateY(${(1 - phone()) * 16}px)`,
					visibility: phone() < 0.01 ? 'hidden' : 'visible',
				}}
			>
				<PhoneToast toast={toast()} />
			</div>
		</div>
	);
}

export default LoadChain;
