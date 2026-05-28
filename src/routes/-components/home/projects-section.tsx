import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { For } from 'solid-js';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '~/components/carousel';
import { projects } from '~/content/projects';

import CarouselDots from './carousel-dots';
import ProjectCard from './project-card';

interface ProjectsSectionProps {
	contentRef: (el: HTMLDivElement) => void;
}

function ProjectsSection(props: ProjectsSectionProps) {
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
				class='z-10 relative flex flex-col justify-center items-center w-full h-full'
				style={{ opacity: 0 }}
			>
				<div class='relative flex flex-col items-center gap-16 w-full h-full'>
					<Carousel
						plugins={[WheelGesturesPlugin({ active: true })]}
						class='flex flex-col justify-center items-center h-full'
						opts={{
							align: 'center',
							startIndex: Math.floor(projects.length / 2),
							skipSnaps: true,
							loop: true,
						}}
					>
						<div class='flex flex-col'>
							<CarouselContent class='[&>div]:flex [&>div]:justify-center [&>div]:items-center'>
								<For each={projects}>
									{(project) => (
										<CarouselItem>
											<ProjectCard {...project} />
										</CarouselItem>
									)}
								</For>
							</CarouselContent>
						</div>
						<div class='bottom-0 absolute flex justify-center my-12! mb-24 px-12 w-full'>
							<CarouselDots />
							<div class='flex justify-center items-center gap-2 ml-auto'>
								<CarouselPrevious />
								<CarouselNext />
							</div>
						</div>
					</Carousel>
				</div>
			</div>
		</section>
	);
}

export default ProjectsSection;
