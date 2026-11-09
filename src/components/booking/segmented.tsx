import { For } from 'solid-js';

import { cn } from '~/utils';

type SegmentedOption<T> = {
	value: T;
	label: string;
};

type SegmentedProps<T> = {
	label: string;
	value: T;
	options: SegmentedOption<T>[];
	onChange: (value: T) => void;
};

function Segmented<T>(props: SegmentedProps<T>) {
	return (
		<div
			role='radiogroup'
			aria-label={props.label}
			class='flex border border-white/10 shrink-0'
		>
			<For each={props.options}>
				{(option) => (
					<button
						type='button'
						role='radio'
						aria-checked={option.value === props.value}
						onClick={() => props.onChange(option.value)}
						class={cn(
							'px-2 py-1 focus-visible:outline-hidden font-light text-[10px] uppercase tracking-widest transition-colors duration-300 cursor-pointer',
							option.value === props.value
								? 'bg-white text-black'
								: 'text-neutral-400 hover:text-white focus-visible:text-white',
						)}
					>
						{option.label}
					</button>
				)}
			</For>
		</div>
	);
}

export { type SegmentedOption };
export default Segmented;
