import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import config from '@config.json';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '~/components/carousel';
import { median } from '~/utils';

import CarouselDots from './carousel-dots';
import ProjectCard from './project-card';

interface ProjectsSectionProps {
	contentRef: React.RefObject<HTMLDivElement | null>;
}

function ProjectsSection({ contentRef }: ProjectsSectionProps) {
	const projects = config.projects;

	return (
		<section className='relative flex justify-center items-center h-full overflow-hidden shrink-0'>
			<div
				className='z-0 absolute inset-0 opacity-40 pointer-events-none select-none'
				style={{
					backgroundImage: 'url(/img/grid-pattern.svg)',
					backgroundRepeat: 'repeat',
					backgroundSize: '48px 48px',
					maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
					WebkitMaskImage:
						'radial-gradient(ellipse at center, black 50%, transparent 90%)',
				}}
			/>
			<div
				ref={contentRef}
				className='z-10 relative flex flex-col justify-center items-center w-full h-full'
				style={{ opacity: 0 }}
			>
				<div className='relative flex flex-col items-center gap-16 w-full h-full'>
					<Carousel
						plugins={[WheelGesturesPlugin({ active: true })]}
						className='flex flex-col justify-center items-center h-full'
						opts={{
							align: 'center',
							startIndex:
								projects.length % 2 === 0
									? projects.length / 2
									: median(Array.from({ length: projects.length })),
							skipSnaps: true,
							loop: true,
						}}
					>
						<div className='flex flex-col'>
							<CarouselContent className='[&>div]:flex [&>div]:justify-center [&>div]:items-center'>
								{projects.map((project, index) => (
									<CarouselItem key={index}>
										<ProjectCard {...project} />
									</CarouselItem>
								))}
							</CarouselContent>
						</div>
						<div className='bottom-0 absolute flex justify-center my-12! mb-24 px-12 w-full'>
							<CarouselDots />
							<div className='flex justify-center items-center gap-2 ml-auto'>
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
