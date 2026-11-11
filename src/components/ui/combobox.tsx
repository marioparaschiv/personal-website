import { Combobox as Kobalte, type ComboboxListboxOptions } from '@kobalte/core/combobox';
import { createMemo, createSignal, For, type JSX } from 'solid-js';
import { Check, ChevronDown } from 'lucide-solid';

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

type Items<T> = Parameters<NonNullable<ComboboxListboxOptions<T>['children']>>[0];

type OptionRowsProps<T> = {
	items: Items<T>;
	scrollTop: number;
	optionLabel: (option: T) => string;
};

// Rows are a fixed height so the list can be windowed without measuring. Keep in sync with `h-7`
// on the item and `p-1` / `max-h-72` on the listbox.
const ROW_HEIGHT = 28;
const LIST_PADDING = 4;
const LIST_HEIGHT = 288;
const OVERSCAN = 4;
const WINDOW_SIZE = Math.ceil(LIST_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;

// Mounting every Kobalte item (400+ time zones) costs a ~250ms frame on open and on each keystroke,
// so only the rows in view are rendered, positioned inside a spacer as tall as the full list.
function OptionRows<T>(props: OptionRowsProps<T>) {
	const nodes = createMemo(() => [...props.items()]);
	const first = createMemo(() =>
		Math.max(0, Math.floor((props.scrollTop - LIST_PADDING) / ROW_HEIGHT) - OVERSCAN),
	);
	const visible = createMemo(() => nodes().slice(first(), first() + WINDOW_SIZE));

	return (
		<div class='relative' style={{ height: `${nodes().length * ROW_HEIGHT}px` }}>
			<For each={visible()}>
				{(node) => (
					<Kobalte.Item
						item={node}
						style={{ transform: `translateY(${node.index * ROW_HEIGHT}px)` }}
						class='top-0 absolute inset-x-0 flex justify-between items-center gap-3 data-highlighted:bg-white/10 px-2.5 h-7 outline-hidden text-neutral-400 data-highlighted:text-white data-selected:text-white text-xs cursor-pointer select-none'
					>
						<Kobalte.ItemLabel class='truncate'>
							{props.optionLabel(node.rawValue)}
						</Kobalte.ItemLabel>
						<Kobalte.ItemIndicator class='shrink-0'>
							<Check size={12} />
						</Kobalte.ItemIndicator>
					</Kobalte.Item>
				)}
			</For>
		</div>
	);
}

// Square, monochrome wrapper over Kobalte's accessible combobox: type to filter, arrows to move,
// Enter to pick, Escape to close. Selection can't be cleared, so `value` is always an option.
function Combobox<T>(props: ComboboxProps<T>) {
	// Filters on what the visitor typed, not the input's value: Kobalte rewrites the input to the
	// picked label while the list is still fading out, which would swap in the full list mid-exit.
	const [query, setQuery] = createSignal('');
	const [open, setOpen] = createSignal(false);
	const [scrollTop, setScrollTop] = createSignal(0);

	let listbox: HTMLUListElement | undefined;
	let items: Items<T> | undefined;

	const filter = (option: T) => {
		const needle = query().trim().toLowerCase();

		if (!needle) return true;

		return props.optionLabel(option).toLowerCase().includes(needle);
	};

	// Kobalte can't scroll rows that aren't mounted, so a virtualized list scrolls the focused key
	// into view itself (on open and on arrow keys). Hovering also moves focus, but a row under the
	// pointer is left where it is so the list never scrolls on its own near the edges.
	const scrollToItem = (key: string) => {
		const index = items?.().getItem(key)?.index;

		if (!listbox || index === undefined) return;

		const row = listbox.querySelector(`[data-key="${CSS.escape(key)}"]`);

		if (row?.matches(':hover')) return;

		const top = LIST_PADDING + index * ROW_HEIGHT;
		const bottom = top + ROW_HEIGHT + LIST_PADDING;

		if (top - LIST_PADDING < listbox.scrollTop) {
			listbox.scrollTop = top - LIST_PADDING;
		} else if (bottom > listbox.scrollTop + listbox.clientHeight) {
			listbox.scrollTop = bottom - listbox.clientHeight;
		}

		// The scroll event lands a frame later; updating now keeps that frame from rendering blank rows.
		setScrollTop(listbox.scrollTop);
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
			onOpenChange={setOpen}
			triggerMode='focus'
			virtualized
			disallowEmptySelection
			placeholder={props.placeholder}
			gutter={6}
			placement='bottom-end'
			class={props.class}
		>
			<Kobalte.Control
				aria-label={props.label}
				class='group flex items-center gap-2 px-2.5 py-1.5 border border-white/10 focus-within:border-white/50 hover:border-white/30 text-neutral-400 focus-within:text-white hover:text-white transition-colors duration-300'
			>
				{props.icon}
				{/* These run before Kobalte's own handlers, which open the list on focus or click. */}
				<Kobalte.Input
					onFocus={(event) => {
						setQuery('');
						event.currentTarget.select();
					}}
					onClick={() => !open() && setQuery('')}
					onInput={(event) => setQuery(event.currentTarget.value)}
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
					// Pressing an option would blur the input; Kobalte then refocuses it after picking, and
					// focus-to-open reopens the list for a frame before closing it again.
					onMouseDown={(event) => event.preventDefault()}
					// `animation-duration-*`, not `duration-*`: the latter also sets a transition on every
					// property, so the transform origin Floating UI sets after mount slid across the zoom-in.
					class={cn(
						'z-50 bg-neutral-950 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.75)] border border-white/15 w-64 origin-(--kb-combobox-content-transform-origin)',
						'data-expanded:animate-in data-expanded:fade-in-0 data-expanded:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 animation-duration-150 motion-reduce:animate-none',
					)}
				>
					<Kobalte.Listbox<T>
						ref={(el) => {
							listbox = el;
							setScrollTop(0);
						}}
						scrollToItem={scrollToItem}
						onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
						class='p-1 max-h-72 overflow-y-auto overscroll-contain [scrollbar-width:thin]'
					>
						{(collection) => {
							items = collection;

							return (
								<OptionRows
									items={collection}
									scrollTop={scrollTop()}
									optionLabel={props.optionLabel}
								/>
							);
						}}
					</Kobalte.Listbox>
				</Kobalte.Content>
			</Kobalte.Portal>
		</Kobalte>
	);
}

export default Combobox;
