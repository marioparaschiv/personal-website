import { cn } from '~/utils';

import { clamp, type SlotLayout } from './layout';

type AlbumRailItem = {
	src: string;
	alt: string;
	title: string;
	subtitle?: string;
};

type SleeveProps = {
	item: AlbumRailItem;
	layout: SlotLayout;
	width: number;
	height: number;
	focused: boolean;
	onClick: () => void;
};

const corner =
	'absolute w-3 h-3 border-white/0 group-hover:border-white/50 group-focus-visible:border-white/50 transition-[border-color,translate] duration-300 pointer-events-none';

function onImageError(event: Event) {
	(event.currentTarget as HTMLImageElement).src = '/img/projects/fallback.png';
}

function Sleeve(props: SleeveProps) {
	// Fading the whole sleeve lets the section's grid show through the cover, so most of the fade
	// is a darkening overlay instead; real transparency only kicks in once it is nearly black.
	const opacity = () => clamp(props.layout.opacity * 2, 0, 1);
	const shade = () => 1 - (1 - props.layout.dim) * props.layout.opacity;

	return (
		<div
			class='top-1/2 left-1/2 absolute'
			style={{
				width: `${props.width}px`,
				height: `${props.height}px`,
				'z-index': props.layout.zIndex,
				opacity: opacity(),
				visibility: props.layout.opacity === 0 ? 'hidden' : 'visible',
				transform: `translate(-50%, -50%) translate3d(${props.layout.x}px, 0, ${props.layout.z}px) rotateY(${props.layout.rotateY}deg) rotateZ(${props.layout.rotateZ}deg)`,
			}}
		>
			<button
				type='button'
				tabIndex={props.focused ? 0 : -1}
				aria-label={props.focused ? `Open ${props.item.title}` : `Show ${props.item.title}`}
				class={cn(
					'relative bg-neutral-950 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.75)] border border-white/10 focus-visible:border-white/60 focus-visible:outline-hidden w-full h-full overflow-hidden transition-colors duration-300',
					props.focused ? 'group hover:border-white/30 cursor-pointer' : 'cursor-default',
				)}
				onClick={() => props.onClick()}
			>
				<img
					src={props.item.src}
					alt={props.item.alt}
					draggable={false}
					onError={onImageError}
					class='absolute inset-0 w-full h-full object-cover'
				/>
				<span
					class='absolute inset-0 bg-neutral-950 pointer-events-none'
					style={{ opacity: shade() }}
				/>

				<span
					class={cn(
						corner,
						'top-2 left-2 border-t border-l translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
				<span
					class={cn(
						corner,
						'top-2 right-2 border-t border-r -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
				<span
					class={cn(
						corner,
						'bottom-2 left-2 border-b border-l translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
				<span
					class={cn(
						corner,
						'right-2 bottom-2 border-r border-b -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
			</button>
		</div>
	);
}

export { type AlbumRailItem, Sleeve };
