import { createSignal, onCleanup, onMount } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';
import { ArrowRight } from 'lucide-solid';

import type { Project } from '~/content/projects';
import Typography from '~/components/typography';
import { cn } from '~/utils';

function ProjectCard(props: Project) {
	const [width, setWidth] = createSignal(
		window.innerWidth >= 1080 ? 1080 : window.innerWidth - 100,
	);

	const navigate = useNavigate();

	function onResize() {
		setWidth(window.innerWidth >= 1080 ? 1080 : window.innerWidth - 100);
	}

	onMount(() => window.addEventListener('resize', onResize));
	onCleanup(() => window.removeEventListener('resize', onResize));

	return (
		<div class='relative flex justify-center items-center rounded'>
			<img
				loading='eager'
				decoding='async'
				class='z-1 rounded-[inherit] h-120 md:h-140 object-cover select-none'
				alt={props.name}
				style={{ width: `${width()}px` }}
				src={props.thumbnail}
				onError={(event) =>
					((event.currentTarget as HTMLImageElement).src = '/img/projects/fallback.png')
				}
			/>
			<div class='z-10 absolute bg-linear-to-t from-black/80 to-black/20 w-full h-full'>
				<div class='relative flex flex-col justify-center items-center rounded-sm h-full'>
					<img
						loading='eager'
						decoding='async'
						class={cn('mb-4 rounded-md h-12', props.icon.styles)}
						src={props.icon.path}
					/>
					<div class='flex flex-col justify-center items-center mb-2'>
						<Typography tag='h3' margin={false} padding={false} border={false}>
							{props.name}
						</Typography>
						<Typography tag='h5' class='font-normal text-foreground/80 text-lg'>
							{props.type}
						</Typography>
						<Typography
							tag='h6'
							border={false}
							class='font-normal text-foreground/70 text-xs'
						>
							{props.timeFrame}
						</Typography>
					</div>
					<button
						type='button'
						onClick={() => navigate({ to: '/projects/$id', params: { id: props.id } })}
						class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-2 py-1 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
					>
						<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
						<span class='relative'>View project</span>
						<ArrowRight class='relative' size={12} />
					</button>
				</div>
			</div>
			<div
				class='top-0 left-0 z-0 absolute border-white/40 border-t-2 border-l-2 w-6 h-6 pointer-events-none'
				style={{ translate: 'var(--bracket-offset) var(--bracket-offset)' }}
			/>
			<div
				class='top-0 right-0 z-0 absolute border-white/40 border-t-2 border-r-2 w-6 h-6 pointer-events-none'
				style={{ translate: 'calc(var(--bracket-offset) * -1) var(--bracket-offset)' }}
			/>
			<div
				class='bottom-0 left-0 z-0 absolute border-white/40 border-b-2 border-l-2 w-6 h-6 pointer-events-none'
				style={{ translate: 'var(--bracket-offset) calc(var(--bracket-offset) * -1)' }}
			/>
			<div
				class='right-0 bottom-0 z-0 absolute border-white/40 border-r-2 border-b-2 w-6 h-6 pointer-events-none'
				style={{
					translate: 'calc(var(--bracket-offset) * -1) calc(var(--bracket-offset) * -1)',
				}}
			/>
		</div>
	);
}

export default ProjectCard;
