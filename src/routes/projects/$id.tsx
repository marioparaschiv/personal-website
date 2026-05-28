import { createFileRoute, useNavigate, useParams } from '@tanstack/solid-router';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-solid';
import { Title } from '@solidjs/meta';
import { Show } from 'solid-js';

import { useDarkVeil } from '~/components/effects/dark-veil';
import { projects, getContent } from '~/content/projects';
import mdxComponents from '~/components/mdx';
import Media from '~/components/media';
import { site } from '~/content/site';

function Project() {
	const params = useParams({ from: '/projects/$id' });
	const navigate = useNavigate();

	const id = () => params().id;
	const projectIndex = () => projects.findIndex((p) => p.id === id());
	const project = () => projects[projectIndex()];

	const prevProject = () => projects.at(projectIndex() - 1)!;
	const nextProject = () => projects[(projectIndex() + 1) % projects.length];

	const Content = () => getContent(id()) ?? null;

	const goBack = () => navigate({ to: '/' });

	useDarkVeil(() => project()?.hueShift ?? null);

	return (
		<Show
			when={project()}
			fallback={
				<div class='flex flex-col justify-center items-center h-dvh'>
					<Title>Not Found - {site.name}</Title>
					<p class='mb-6 text-neutral-400 text-lg'>Project not found.</p>
					<button
						type='button'
						onClick={goBack}
						class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
					>
						<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
						<ArrowLeft class='relative' size={12} />
						<span class='relative'>Back home</span>
					</button>
				</div>
			}
		>
			{(p) => {
				return (
					<div class='relative min-h-dvh'>
						<Title>
							{p().name} - {site.name}
						</Title>

						<div class='top-6 left-6 z-30 fixed'>
							<button
								type='button'
								onClick={goBack}
								class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
							>
								<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
								<ArrowLeft class='relative' size={12} />
								<span class='relative'>Back</span>
							</button>
						</div>

						<div class='top-6 right-6 z-30 fixed flex gap-2'>
							<button
								type='button'
								onClick={() =>
									navigate({
										to: '/projects/$id',
										params: { id: prevProject().id },
									})
								}
								class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
							>
								<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
								<ArrowLeft class='relative' size={12} />
								<span class='relative hidden sm:inline'>{prevProject().name}</span>
							</button>
							<button
								type='button'
								onClick={() =>
									navigate({
										to: '/projects/$id',
										params: { id: nextProject().id },
									})
								}
								class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
							>
								<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
								<span class='relative hidden sm:inline'>{nextProject().name}</span>
								<ArrowRight class='relative' size={12} />
							</button>
						</div>

						<div class='relative z-10 mx-auto px-6 pt-28 pb-20 max-w-225'>
							<header class='flex flex-col items-center mb-12 text-center'>
								<img
									src={p().icon.path}
									alt={p().name}
									class={`mb-5 rounded-lg h-16 drop-shadow-xl ${p().icon.styles}`}
								/>
								<h1 class='mb-1 font-semibold text-4xl text-white tracking-tight'>
									{p().name}
								</h1>
								<p class='mb-1 text-lg text-neutral-400'>{p().type}</p>
								<p class='mb-3 text-neutral-500 text-sm'>{p().timeFrame}</p>

								<Show when={p().badge}>
									{(badge) => (
										<span
											class={`inline-block px-3 py-1 border text-xs font-medium mb-5 ${badge().styles}`}
										>
											{badge().text}
										</span>
									)}
								</Show>

								<Show when={p().repository || p().url}>
									<div class='flex gap-3 mt-5'>
										<Show when={p().repository}>
											{(repo) => (
												<a
													href={repo()}
													target='_blank'
													rel='noopener noreferrer'
													class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300'
												>
													<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
													<span class='relative'>Source</span>
												</a>
											)}
										</Show>
										<Show when={p().url}>
											{(url) => (
												<a
													href={url()}
													target='_blank'
													rel='noopener noreferrer'
													class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300'
												>
													<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
													<ExternalLink class='relative' size={14} />
													<span class='relative'>Website</span>
												</a>
											)}
										</Show>
									</div>
								</Show>
							</header>

							<div class='mx-auto mb-12 border-neutral-800 border-t w-16' />

							<section class='mb-12'>
								<Show
									when={Content()}
									fallback={
										<p class='text-center text-neutral-500'>Coming soon.</p>
									}
								>
									{(Mdx) => {
										const C = Mdx();
										return <C components={mdxComponents} />;
									}}
								</Show>
							</section>

							<Show when={p().images.length > 0}>
								<section>
									<h2 class='mb-4 font-semibold text-white text-2xl tracking-tight'>
										Gallery
									</h2>
									<Media
										images={p().images}
										footer={{
											subtitle: `${p().images.length} items`,
										}}
									/>
								</section>
							</Show>
						</div>
					</div>
				);
			}}
		</Show>
	);
}

export const Route = createFileRoute('/projects/$id')({
	component: Project,
});
