import { useNavigate } from '@tanstack/solid-router';

import AlbumRail, { type AlbumRailItem } from '~/components/album-rail/album-rail';
import { projects } from '~/content/projects';

import ScrollHint from './scroll-hint';

type ProjectsSectionProps = {
	contentRef: (el: HTMLDivElement) => void;
	onScrollDown: () => void;
};

const items: AlbumRailItem[] = projects.map((project) => ({
	src: project.thumbnail,
	alt: project.name,
	title: project.name,
	subtitle: `${project.type} · ${project.timeFrame}`,
}));

function ProjectsSection(props: ProjectsSectionProps) {
	const navigate = useNavigate();

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
				class='z-10 relative flex flex-col justify-center items-center pt-28 pb-36 w-full h-full'
				style={{ opacity: 0 }}
			>
				<AlbumRail
					items={items}
					onSelect={(_, index) =>
						navigate({ to: '/projects/$id', params: { id: projects[index].id } })
					}
				/>
			</div>
			<ScrollHint label='Other Work' onClick={props.onScrollDown} />
		</section>
	);
}

export default ProjectsSection;
