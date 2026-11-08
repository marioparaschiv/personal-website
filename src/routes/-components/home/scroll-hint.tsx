import { ArrowDown, ArrowUp } from 'lucide-solid';
import { Show } from 'solid-js';

type ScrollHintProps = {
	label: string;
	direction?: 'up' | 'down';
	onClick: () => void;
};

function ScrollHint(props: ScrollHintProps) {
	const up = () => props.direction === 'up';

	return (
		<button
			type='button'
			onClick={props.onClick}
			class='bottom-15 left-1/2 z-20 absolute flex flex-col justify-center items-center gap-2 opacity-60 text-muted-foreground hover:text-foreground transition-[color,translate] -translate-x-1/2 duration-250 ease-in-out cursor-pointer'
			classList={{ 'hover:-translate-y-1': up(), 'hover:translate-y-1': !up() }}
		>
			<Show when={up()}>
				<ArrowUp class='text-lg' size={18} />
			</Show>
			<span class='text-xs uppercase bold'>{props.label}</span>
			<Show when={!up()}>
				<ArrowDown class='text-lg' size={18} />
			</Show>
		</button>
	);
}

export default ScrollHint;
