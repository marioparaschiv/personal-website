import { ExternalLink } from 'lucide-solid';
import { Show } from 'solid-js';

import { getContent, type Project } from '~/content/projects';
import mdxComponents from '~/components/mdx';
import Media from '~/components/media';

import IngestWires from './ingest-wires';

type ProjectDetailProps = {
	project: Project;
};

const linkClass =
	'group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300';

/** The project's header, media and write-up. Shared by the project page and the home overlay. */
function ProjectDetail(props: ProjectDetailProps) {
	const Content = () => getContent(props.project.id) ?? null;

	return (
		<div class='relative'>
			<Show when={props.project.id === 'telecord'}>
				<IngestWires />
			</Show>

			<div class='relative z-10 mx-auto px-6 pt-28 pb-20 max-w-225'>
				<header class='flex flex-col items-center mb-12 text-center'>
					{/* The inset ring darkens the icon's own edge, so icons ship clean and share one rim. */}
					<span
						class={`relative block mb-5 size-16 overflow-hidden drop-shadow-xl stagger after:absolute after:inset-0 after:rounded-[inherit] after:ring-2 after:ring-inset after:ring-black/35 ${props.project.icon.styles || 'rounded-[24%]'}`}
					>
						<img
							src={props.project.icon.path}
							alt={props.project.name}
							class='size-full'
						/>
					</span>
					<h1
						class='mb-1 font-semibold text-4xl text-white tracking-tight stagger'
						style={{ '--stagger': '1' }}
					>
						{props.project.name}
					</h1>
					<p class='mb-4 text-lg text-neutral-400 stagger' style={{ '--stagger': '2' }}>
						{props.project.type}
					</p>

					<Show when={props.project.badge}>
						{(badge) => (
							<span
								class={`inline-block px-3 py-1 border text-xs font-medium mb-5 stagger ${badge().styles}`}
								style={{ '--stagger': '3' }}
							>
								{badge().text}
							</span>
						)}
					</Show>

					<Show when={props.project.repository || props.project.url}>
						<div class='flex gap-3 mt-5 stagger' style={{ '--stagger': '3' }}>
							<Show when={props.project.repository}>
								{(repo) => (
									<a
										href={repo()}
										target='_blank'
										rel='noopener noreferrer'
										class={linkClass}
									>
										<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
										<span class='relative'>Source</span>
									</a>
								)}
							</Show>
							<Show when={props.project.url}>
								{(url) => (
									<a
										href={url()}
										target='_blank'
										rel='noopener noreferrer'
										class={linkClass}
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

				<div
					class='mx-auto mb-12 border-neutral-800 border-t w-16 stagger'
					style={{ '--stagger': '4' }}
				/>

				<Show when={props.project.images.length > 0}>
					<section class='mb-12 stagger' style={{ '--stagger': '5' }}>
						<Media images={props.project.images} />
					</section>
				</Show>

				<section class='stagger' style={{ '--stagger': '6' }}>
					<Show
						when={Content()}
						keyed
						fallback={<p class='text-center text-neutral-500'>Coming soon.</p>}
					>
						{(C) => <C components={mdxComponents} />}
					</Show>
				</section>
			</div>
		</div>
	);
}

export default ProjectDetail;
