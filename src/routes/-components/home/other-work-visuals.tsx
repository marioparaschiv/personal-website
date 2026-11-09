import { type Component, For } from 'solid-js';
import { Check, Undo2 } from 'lucide-solid';

import { cn } from '~/utils';

type Visual = {
	direction: 'row' | 'column';
	component: Component;
};

type Slot = {
	width: string;
	open: boolean;
};

const chip =
	'flex items-center gap-1.5 px-2 py-1 border border-white/10 group-hover:border-white/20 font-light text-[10px] uppercase tracking-widest transition-colors duration-300';

const SLOTS: Slot[] = [
	{ width: 'w-16', open: false },
	{ width: 'w-24', open: true },
	{ width: 'w-12', open: false },
];

function BetaSlots() {
	return (
		<div class='flex flex-col gap-1.5 w-full'>
			<For each={SLOTS}>
				{(slot) => (
					<div
						class={cn(
							'flex items-center gap-2.5 px-2.5 py-1.5 border transition-colors duration-300',
							slot.open
								? 'border-white/20 group-hover:border-white/40 bg-white/5'
								: 'border-white/5',
						)}
					>
						<span class='bg-white/10 w-4 h-4 shrink-0' />
						<span class={cn('bg-white/15 h-1.5', slot.width)} />
						<span
							class={cn(
								'flex items-center gap-1.5 ml-auto font-light text-[10px] uppercase tracking-widest',
								slot.open ? 'text-white' : 'text-neutral-600',
							)}
						>
							{slot.open && (
								<span class='bg-white rounded-full w-1.5 h-1.5 motion-safe:animate-pulse' />
							)}
							{slot.open ? 'Open' : 'Full'}
						</span>
					</div>
				)}
			</For>
		</div>
	);
}

function PatchHooks() {
	return (
		<div class='flex flex-col gap-1 w-full font-mono text-[11px]'>
			<For each={['before', 'instead', 'after']}>
				{(hook) => (
					<div class='flex items-center gap-2'>
						<span class='w-14 text-neutral-500 group-hover:text-neutral-300 transition-colors duration-300'>
							.{hook}
						</span>
						<span class='flex-1 bg-white/10 h-px' />
						<span class='text-neutral-400'>fn()</span>
					</div>
				)}
			</For>
			<div class='flex items-center gap-2 text-neutral-400'>
				<span class='w-14'>
					<Undo2 size={11} />
				</span>
				<span class='flex-1 bg-white/10 h-px' />
				<span>unpatch()</span>
			</div>
		</div>
	);
}

function FixChecklist() {
	return (
		<div class='flex flex-wrap gap-1.5 w-full'>
			<For each={['Keychain', 'App groups', 'CloudKit', 'App icons']}>
				{(label) => (
					<span class={cn(chip, 'text-neutral-400 whitespace-nowrap')}>
						<Check class='text-white' size={10} />
						{label}
					</span>
				)}
			</For>
		</div>
	);
}

const visuals: Partial<Record<string, Visual>> = {
	'testflight-sniper': { direction: 'row', component: BetaSlots },
	possess: { direction: 'column', component: PatchHooks },
	'sideload-fix': { direction: 'row', component: FixChecklist },
};

export { type Visual, visuals };
