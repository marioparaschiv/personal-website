import { Combobox as Kobalte } from '@kobalte/core/combobox';
import { Check, ChevronDown } from 'lucide-solid';
import type { JSX } from 'solid-js';

import { cn } from '~/utils';

type ComboboxProps<T> = {
	label: string;
	value: T;
	options: T[];
	optionValue: (option: T) => string;
	optionLabel: (option: T) => string;
	onChange: (value: T) => void;
	icon?: JSX.Element;
	placeholder?: string;
	class?: string;
};

// Square, monochrome wrapper over Kobalte's accessible combobox: type to filter, arrows to move,
// Enter to pick, Escape to close. Selection can't be cleared, so `value` is always an option.
function Combobox<T>(props: ComboboxProps<T>) {
	// The input keeps showing the selected label, so an unchanged input means "browse everything".
	const filter = (option: T, input: string) => {
		const query = input.trim().toLowerCase();

		if (!query || input === props.optionLabel(props.value)) return true;

		return props.optionLabel(option).toLowerCase().includes(query);
	};

	return (
		<Kobalte<T>
			options={props.options}
			value={props.value}
			onChange={(next) => next !== null && props.onChange(next)}
			optionValue={props.optionValue}
			optionTextValue={props.optionLabel}
			optionLabel={props.optionLabel}
			defaultFilter={filter}
			triggerMode='focus'
			disallowEmptySelection
			placeholder={props.placeholder}
			gutter={6}
			placement='bottom-end'
			class={props.class}
			itemComponent={(item) => (
				<Kobalte.Item
					item={item.item}
					class='flex justify-between items-center gap-3 data-highlighted:bg-white/10 px-2.5 py-1.5 outline-hidden text-neutral-400 data-highlighted:text-white data-selected:text-white text-xs cursor-pointer select-none'
				>
					<Kobalte.ItemLabel class='truncate'>
						{props.optionLabel(item.item.rawValue)}
					</Kobalte.ItemLabel>
					<Kobalte.ItemIndicator class='shrink-0'>
						<Check size={12} />
					</Kobalte.ItemIndicator>
				</Kobalte.Item>
			)}
		>
			<Kobalte.Control
				aria-label={props.label}
				class='group flex items-center gap-2 px-2.5 py-1.5 border border-white/10 focus-within:border-white/50 hover:border-white/30 text-neutral-400 focus-within:text-white hover:text-white transition-colors duration-300'
			>
				{props.icon}
				<Kobalte.Input
					onFocus={(event) => event.currentTarget.select()}
					class='bg-transparent outline-hidden w-full min-w-0 font-light text-[10px] sm:text-xs placeholder:text-neutral-600 uppercase tracking-widest selection:bg-white selection:text-black'
				/>
				<Kobalte.Trigger
					aria-label={`Show ${props.label.toLowerCase()} options`}
					class='shrink-0 cursor-pointer'
				>
					<Kobalte.Icon class='flex transition-transform group-data-expanded:rotate-180 duration-300'>
						<ChevronDown size={12} />
					</Kobalte.Icon>
				</Kobalte.Trigger>
			</Kobalte.Control>

			<Kobalte.Portal>
				<Kobalte.Content
					// Kobalte refocuses the input on close, which re-runs select-on-focus after a click outside.
					// Keyboard use keeps focus in the input anyway, so skipping the refocus loses nothing.
					onCloseAutoFocus={(event) => event.preventDefault()}
					class={cn(
						'z-50 bg-neutral-950 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.75)] border border-white/15 w-64 origin-(--kb-combobox-content-transform-origin)',
						'data-expanded:animate-in data-expanded:fade-in-0 data-expanded:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150 motion-reduce:animate-none',
					)}
				>
					<Kobalte.Listbox class='p-1 max-h-72 overflow-y-auto [scrollbar-width:thin]' />
				</Kobalte.Content>
			</Kobalte.Portal>
		</Kobalte>
	);
}

export default Combobox;
