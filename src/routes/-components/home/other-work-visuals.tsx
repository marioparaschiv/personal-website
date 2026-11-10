import { type Component, For } from 'solid-js';
import { Undo2 } from 'lucide-solid';

import RecallField from './recall-field';
import LoadChain from './load-chain';
import Pipeline from './pipeline';

type Visual = {
	direction: 'row' | 'column';
	component: Component;
};

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

const visuals: Partial<Record<string, Visual>> = {
	possess: { direction: 'row', component: PatchHooks },
	enmity: { direction: 'row', component: LoadChain },
	hivemind: { direction: 'column', component: Pipeline },
	trove: { direction: 'row', component: RecallField },
};

export { type Visual, visuals };
