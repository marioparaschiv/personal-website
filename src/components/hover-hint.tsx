import { type Component, Show } from 'solid-js';

import { cn } from '~/utils';

type HoverHintProps = {
	icon: Component<{ size?: number; class?: string }>;
	label: string;
	/** Plays the hint once on its own, pulsing, to show the target is clickable. */
	intro?: boolean;
};

/** Centered hint that blurs in when its `group` parent is hovered or focused. */
function HoverHint(props: HoverHintProps) {
	return (
		<span
			class={cn(
				'absolute inset-0 flex flex-col justify-center items-center gap-2.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 blur-[6px] group-hover:blur-none group-focus-visible:blur-none scale-75 group-hover:scale-100 group-focus-visible:scale-100 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none',
				props.intro && 'hint-intro',
			)}
		>
			<span class='relative flex justify-center items-center bg-black/70 backdrop-blur-md border border-white/30 size-11 text-white'>
				<Show when={props.intro}>
					<span class='absolute inset-0 border border-white/70 hint-ping' />
				</Show>
				<props.icon size={16} />
			</span>
			<span class='bg-black/70 backdrop-blur-md px-2 py-1 font-light text-[10px] text-white uppercase tracking-widest'>
				{props.label}
			</span>
		</span>
	);
}

export default HoverHint;
