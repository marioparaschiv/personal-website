import { type ComponentType, useCallback, useMemo } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { MDXComponents } from 'mdx/types';
import { Helmet } from 'react-helmet';
import config from '@config.json';

import { useDarkVeil } from '~/components/effects/dark-veil';
import mdxComponents from '~/components/mdx';
import { Technologies } from '~/constants';
import Media from '~/components/media';

export const path = '/projects/:id';
export const element = Project;

const modules = import.meta.glob<{ default: ComponentType<{ components?: MDXComponents }> }>(
	'/src/content/projects/*.mdx',
	{ eager: true },
);

function Project() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const projectIndex = config.projects.findIndex((p) => p.id === id);
	const project = config.projects[projectIndex];

	const prevProject = config.projects.at(projectIndex - 1)!;
	const nextProject = config.projects[(projectIndex + 1) % config.projects.length];

	const technologies = useMemo(() => {
		if (!project) return [];

		return project.technologies
			.map((name) => Technologies.find((t) => t.name === name))
			.filter(Boolean);
	}, [project]);

	const Content = useMemo(() => {
		const key = `/src/content/projects/${id}.mdx`;
		const mod = modules[key];
		if (!mod) return null;

		return mod.default;
	}, [id]);

	const goBack = useCallback(() => navigate('/'), [navigate]);
	useDarkVeil(project?.hueShift ?? null);

	if (!project) {
		return (
			<div className='flex flex-col justify-center items-center h-dvh'>
				<Helmet>
					<title>Not Found - {config.name}</title>
				</Helmet>
				<p className='mb-6 text-neutral-400 text-lg'>Project not found.</p>
				<button
					type='button'
					onClick={goBack}
					className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
				>
					<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
					<ArrowLeft className='relative' size={12} />
					<span className='relative'>Back home</span>
				</button>
			</div>
		);
	}

	return (
		<div key={id} className='relative min-h-dvh'>
			<Helmet>
				<title>
					{project.name} - {config.name}
				</title>
			</Helmet>

			<div className='top-6 left-6 z-30 fixed'>
				<button
					type='button'
					onClick={goBack}
					className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
				>
					<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
					<ArrowLeft className='relative' size={12} />
					<span className='relative'>Back</span>
				</button>
			</div>

			<div className='top-6 right-6 z-30 fixed flex gap-2'>
				<button
					type='button'
					onClick={() => navigate('/projects/' + prevProject.id)}
					className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
				>
					<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
					<ArrowLeft className='relative' size={12} />
					<span className='relative hidden sm:inline'>{prevProject.name}</span>
				</button>
				<button
					type='button'
					onClick={() => navigate('/projects/' + nextProject.id)}
					className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
				>
					<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
					<span className='relative hidden sm:inline'>{nextProject.name}</span>
					<ArrowRight className='relative' size={12} />
				</button>
			</div>

			<div className='relative z-10 mx-auto px-6 pt-28 pb-20 max-w-[900px]'>
				<header className='flex flex-col items-center mb-12 text-center'>
					<img
						src={project.icon.path}
						alt={project.name}
						className={`mb-5 rounded-lg h-16 drop-shadow-xl ${project.icon.styles}`}
					/>
					<h1 className='mb-1 font-semibold text-4xl text-white tracking-tight'>
						{project.name}
					</h1>
					<p className='mb-1 text-lg text-neutral-400'>{project.type}</p>
					<p className='mb-3 text-neutral-500 text-sm'>{project.timeFrame}</p>

					{project.badge && (
						<span
							className={`inline-block px-3 py-1 border text-xs font-medium mb-5 ${project.badge.styles}`}
						>
							{project.badge.text}
						</span>
					)}

					{(project.repository || project.url) && (
						<div className='flex gap-3 mt-5'>
							{project.repository && (
								<a
									href={project.repository}
									target='_blank'
									rel='noopener noreferrer'
									className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300'
								>
									<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
									{/* <Github className='relative' size={14} /> */}
									<span className='relative'>Source</span>
								</a>
							)}
							{project.url && (
								<a
									href={project.url}
									target='_blank'
									rel='noopener noreferrer'
									className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300'
								>
									<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
									<ExternalLink className='relative' size={14} />
									<span className='relative'>Website</span>
								</a>
							)}
						</div>
					)}
				</header>

				<div className='mx-auto mb-12 border-neutral-800 border-t w-16' />

				{technologies.length > 0 && (
					<section className='mb-12'>
						<h2 className='mb-4 font-semibold text-white text-2xl tracking-tight'>
							Built With
						</h2>
						<div className='flex flex-wrap gap-2'>
							{technologies.map((tech) => (
								<span
									key={tech.name}
									className='flex items-center gap-1.5 bg-white/5 px-2.5 py-1 border border-white/10 text-neutral-300 text-sm'
								>
									<tech.icon className='w-3.5 h-3.5' />
									{tech.name}
								</span>
							))}
						</div>
					</section>
				)}

				<section className='mb-12'>
					{Content ? (
						<Content components={mdxComponents} />
					) : (
						<p className='text-center text-neutral-500'>Coming soon.</p>
					)}
				</section>
				{project.images.length > 0 && (
					<section>
						<h2 className='mb-4 font-semibold text-white text-2xl tracking-tight'>
							Gallery
						</h2>
						<Media
							images={project.images}
							footer={{ subtitle: `${project.images.length} items` }}
						/>
					</section>
				)}
			</div>
		</div>
	);
}

export default Project;
