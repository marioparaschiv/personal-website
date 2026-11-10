import { createEffect, createSignal, For, Show } from 'solid-js';
import { ArrowUpRight, Lock, Star } from 'lucide-solid';
import { Dynamic } from 'solid-js/web';

import { otherWork, type OtherWork } from '~/content/other-work';
import { site } from '~/content/site';
import { cn } from '~/utils';

import { visuals } from './other-work-visuals';
import ScrollHint from './scroll-hint';

type OtherWorkSectionProps = {
	contentRef: (el: HTMLDivElement) => void;
	active: boolean;
	onScrollTop: () => void;
};

const corner =
	'absolute w-3 h-3 border-white/0 group-hover:border-white/50 transition-[border-color,translate] duration-300';

type TileProps = OtherWork & {
	index: number;
	shown: boolean;
	/** Bumped on every visit to the section; a new value restarts the visual from its first frame. */
	run: number;
};

function Tile(props: TileProps) {
	const visual = visuals[props.name];
	const Icon = props.icon;

	return (
		<Dynamic
			component={props.url ? 'a' : 'div'}
			href={props.url}
			target={props.url && '_blank'}
			rel={props.url && 'noopener noreferrer'}
			class={cn(
				'group relative flex flex-col gap-1 bg-neutral-950/60 backdrop-blur-sm p-3.5 sm:p-4 border border-white/10 hover:border-white/30 focus-visible:border-white/60 focus-visible:outline-hidden min-h-0 overflow-hidden transition-colors duration-300',
				props.span,
				props.shown ? 'stagger' : 'opacity-0',
			)}
			style={{ '--stagger': String(props.index + 1) }}
		>
			<span class='absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out' />

			<span
				class={cn(
					corner,
					'top-1.5 left-1.5 border-t border-l translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
			<span
				class={cn(
					corner,
					'top-1.5 right-1.5 border-t border-r -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
			<span
				class={cn(
					corner,
					'bottom-1.5 left-1.5 border-b border-l translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
			<span
				class={cn(
					corner,
					'right-1.5 bottom-1.5 border-r border-b -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>

			<div
				class={cn(
					'relative flex h-full min-h-0',
					visual?.direction === 'row'
						? 'flex-col sm:flex-row gap-4 sm:gap-6'
						: 'flex-col gap-3',
				)}
			>
				<div class='flex flex-col flex-1 gap-1 min-w-0'>
					<div class='flex items-center gap-3 mb-1 font-light text-[10px] text-neutral-500 sm:text-xs uppercase tracking-widest'>
						<span class='flex justify-center items-center bg-white/5 border border-white/10 group-hover:border-white/30 w-7 h-7 text-neutral-300 group-hover:text-white transition-colors duration-300 shrink-0'>
							<Icon size={14} />
						</span>
						<span>{props.language}</span>
						<Show when={props.stars}>
							<span class='flex items-center gap-1 tabular-nums'>
								<Star size={10} />
								{props.stars}
							</span>
						</Show>
						<Show when={!props.url}>
							<span class='bg-white/15 w-px h-3' aria-hidden='true' />
							<span class='flex items-center gap-1'>
								<Lock size={10} />
								Private
							</span>
						</Show>
					</div>

					<span class='flex items-center gap-1.5 min-w-0 font-semibold text-white sm:text-base tracking-tight'>
						<span class='truncate'>{props.name}</span>
						<Show when={props.url}>
							<ArrowUpRight
								class='text-neutral-500 group-hover:text-white transition-[color,translate] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-300 shrink-0'
								size={14}
							/>
						</Show>
					</span>

					<p
						class={cn(
							'text-neutral-400 text-xs sm:text-sm line-clamp-2 leading-relaxed',
							visual?.direction === 'column' && 'sm:line-clamp-4',
						)}
					>
						{props.description}
					</p>
				</div>

				<Show when={visual}>
					{(shown) => {
						const Visual = shown().component;

						return (
							<div
								class={cn(
									'hidden sm:flex items-center min-w-0',
									shown().direction === 'row' ? 'sm:w-2/5 shrink-0' : 'flex-1',
								)}
							>
								<For each={[props.run]}>{() => <Visual />}</For>
							</div>
						);
					}}
				</Show>
			</div>
		</Dynamic>
	);
}

function OtherWorkSection(props: OtherWorkSectionProps) {
	const [shown, setShown] = createSignal(false);
	const [run, setRun] = createSignal(0);

	// Tiles cascade in the first time the section is reached, not on every revisit.
	// Visuals restart on every visit so nobody arrives mid-animation.
	createEffect(() => {
		if (!props.active) return;

		setShown(true);
		setRun((count) => count + 1);
	});

	return (
		<section class='relative flex justify-center items-center h-full overflow-hidden shrink-0'>
			<div
				class='z-0 absolute inset-0 opacity-40 pointer-events-none select-none'
				style={{
					'background-image': 'url(/img/grid-pattern.svg)',
					'background-repeat': 'repeat',
					'background-size': '48px 48px',
					'mask-image': 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
					'-webkit-mask-image':
						'radial-gradient(ellipse at center, black 50%, transparent 90%)',
				}}
			/>
			<div
				ref={props.contentRef}
				class='z-10 relative flex flex-col justify-center gap-5 px-6 sm:px-12 pt-24 pb-28 w-full max-w-5xl 2xl:max-w-6xl h-full'
				style={{ opacity: 0 }}
			>
				<div class='flex justify-between items-end gap-4'>
					<h2 class='font-semibold text-white text-2xl sm:text-3xl tracking-tight'>
						Other Work
					</h2>
					<a
						href={site.links.github.href}
						target='_blank'
						rel='noopener noreferrer'
						class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-xs sm:text-sm uppercase tracking-widest transition-all duration-300'
					>
						<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
						<span class='relative'>All on GitHub</span>
						<ArrowUpRight class='relative' size={12} />
					</a>
				</div>

				<div class='gap-2 sm:gap-3 grid grid-cols-2 sm:grid-cols-4'>
					<For each={otherWork}>
						{(item, index) => (
							<Tile {...item} index={index()} shown={shown()} run={run()} />
						)}
					</For>
				</div>
			</div>
			<ScrollHint label='Back to top' direction='up' onClick={props.onScrollTop} />
		</section>
	);
}

export default OtherWorkSection;
