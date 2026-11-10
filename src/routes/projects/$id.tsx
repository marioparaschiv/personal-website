import { createFileRoute, useNavigate, useParams } from '@tanstack/solid-router';
import { createEffect, onCleanup, Show } from 'solid-js';
import { ArrowLeft, ArrowRight } from 'lucide-solid';

import { useDarkVeil } from '~/components/effects/dark-veil';
import { projects } from '~/content/projects';
import HireMe from '~/components/hire-me';
import { site } from '~/content/site';
import { swooshSwap } from '~/utils';

import ProjectDetail from './-components/project-detail';

const navButton =
	'group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer';

function Project() {
	const params = useParams({ from: '/projects/$id' });
	const navigate = useNavigate();

	const id = () => params().id;
	const projectIndex = () => projects.findIndex((p) => p.id === id());
	const project = () => projects[projectIndex()];

	const prevProject = () => projects.at(projectIndex() - 1)!;
	const nextProject = () => projects[(projectIndex() + 1) % projects.length];

	const goBack = () => navigate({ to: '/' });

	let detailRef!: HTMLDivElement;

	function go(target: string, direction: number) {
		void swooshSwap(detailRef, direction, async () => {
			await navigate({ to: '/projects/$id', params: { id: target } });
			window.scrollTo({ top: 0 });
		});
	}

	useDarkVeil(() => project()?.hueShift ?? null);

	// Not @solidjs/meta's Title: disposing it inside the router's view transition made Solid throw,
	// so the next route never rendered and Back did nothing. Its tag also lost to index.html's
	// <title>, so the tab never showed the project name anyway.
	createEffect(() => {
		document.title = `${project()?.name ?? 'Not Found'} - ${site.name}`;
	});

	onCleanup(() => {
		document.title = site.name;
	});

	return (
		<Show
			when={project()}
			fallback={
				<div class='flex flex-col justify-center items-center h-dvh'>
					<p class='mb-6 text-neutral-400 text-lg'>Project not found.</p>
					<button type='button' onClick={goBack} class={navButton}>
						<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
						<ArrowLeft class='relative' size={12} />
						<span class='relative'>Back home</span>
					</button>
				</div>
			}
		>
			{(p) => (
				<div class='relative min-h-dvh'>
					<div class='top-6 left-6 z-30 fixed'>
						<button type='button' onClick={goBack} class={navButton}>
							<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
							<ArrowLeft class='relative' size={12} />
							<span class='relative'>Back</span>
						</button>
					</div>

					<div class='top-6 right-6 z-30 fixed flex items-center gap-2'>
						<button
							type='button'
							onClick={() => go(prevProject().id, -1)}
							class={navButton}
						>
							<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
							<ArrowLeft class='relative' size={12} />
							<span class='relative hidden sm:inline'>{prevProject().name}</span>
						</button>
						<button
							type='button'
							onClick={() => go(nextProject().id, 1)}
							class={navButton}
						>
							<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
							<span class='relative hidden sm:inline'>{nextProject().name}</span>
							<ArrowRight class='relative' size={12} />
						</button>
						<div class='ml-4'>
							<HireMe />
						</div>
					</div>

					<div ref={detailRef}>
						<ProjectDetail project={p()} />
					</div>
				</div>
			)}
		</Show>
	);
}

export const Route = createFileRoute('/projects/$id')({
	component: Project,
});
