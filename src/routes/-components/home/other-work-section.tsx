import { ArrowUpRight, Star } from 'lucide-solid';
import { For, Show } from 'solid-js';

import { otherWork, type OtherWork } from '~/content/other-work';
import { site } from '~/content/site';
import { cn } from '~/utils';

import ScrollHint from './scroll-hint';

type OtherWorkSectionProps = {
	contentRef: (el: HTMLDivElement) => void;
	onScrollTop: () => void;
};

const corner =
	'absolute w-3 h-3 border-white/0 group-hover:border-white/50 transition-[border-color,translate] duration-300';

function Tile(props: OtherWork) {
	return (
		<a
			href={props.url}
			target='_blank'
			rel='noopener noreferrer'
			class={cn(
				'group relative flex flex-col gap-1 bg-neutral-950/60 backdrop-blur-sm p-3.5 sm:p-4 border border-white/10 hover:border-white/30 focus-visible:border-white/60 focus-visible:outline-hidden min-h-0 overflow-hidden transition-colors duration-300',
				props.span,
			)}
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

			<div class='relative flex items-center gap-3 font-light text-[10px] text-neutral-500 sm:text-xs uppercase tracking-widest'>
				<span>{props.language}</span>
				<Show when={props.stars}>
					<span class='flex items-center gap-1 tabular-nums'>
						<Star size={10} />
						{props.stars}
					</span>
				</Show>
				<ArrowUpRight
					class='ml-auto text-neutral-500 group-hover:text-white transition-[color,translate] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-300'
					size={14}
				/>
			</div>

			<span class='relative font-semibold text-white sm:text-base truncate tracking-tight'>
				{props.name}
			</span>

			<p class='relative text-neutral-400 text-xs sm:text-sm line-clamp-2 leading-relaxed'>
				{props.description}
			</p>
		</a>
	);
}

function OtherWorkSection(props: OtherWorkSectionProps) {
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
				class='z-10 relative flex flex-col justify-center gap-6 px-6 sm:px-12 pt-28 pb-32 w-full max-w-5xl h-full'
				style={{ opacity: 0 }}
			>
				<div class='flex justify-between items-end gap-4'>
					<div class='flex flex-col gap-1'>
						<span class='font-light text-neutral-500 text-xs uppercase tracking-widest'>
							Open source
						</span>
						<h2 class='font-semibold text-white text-2xl sm:text-3xl tracking-tight'>
							Other Work
						</h2>
					</div>
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
					<For each={otherWork}>{(item) => <Tile {...item} />}</For>
				</div>
			</div>
			<ScrollHint label='Back to top' direction='up' onClick={props.onScrollTop} />
		</section>
	);
}

export default OtherWorkSection;
