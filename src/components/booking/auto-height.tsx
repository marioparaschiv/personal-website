import { createSignal, type JSX, onCleanup, onMount } from 'solid-js';

type AutoHeightProps = {
	children: JSX.Element;
};

// CSS can't transition to `height: auto`, so the outer box tracks the measured inner height.
function AutoHeight(props: AutoHeightProps) {
	const [height, setHeight] = createSignal<number>();

	let inner!: HTMLDivElement;

	onMount(() => {
		const resize = new ResizeObserver(() => setHeight(inner.offsetHeight));

		resize.observe(inner);
		onCleanup(() => resize.disconnect());
	});

	return (
		<div
			class='overflow-hidden transition-[height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none'
			style={{ height: height() === undefined ? undefined : `${height()}px` }}
		>
			<div ref={(el) => (inner = el)}>{props.children}</div>
		</div>
	);
}

export default AutoHeight;
