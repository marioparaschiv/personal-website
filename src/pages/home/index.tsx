import { MdArrowDownward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import config from '@config.json';

import useScrollSnap from '~/components/hooks/use-scroll-snap';
import { cn } from '~/utils';

import ProjectsSection from './projects-section';
import HeroSection from './hero-section';

export const path = '/';
export const element = Home;

export const showInHeader = true;
export const headerOrder = 1;

const SECTIONS = ['Intro', 'My Work'] as const;

function Home() {
	const navigate = useNavigate();
	const containerRef = useRef<HTMLDivElement>(null);
	const heroContentRef = useRef<HTMLDivElement>(null);
	const projectsContentRef = useRef<HTMLDivElement>(null);

	const onScrollProgress = useCallback((ratio: number) => {
		if (heroContentRef.current) {
			heroContentRef.current.style.opacity = String(1 - Math.min(ratio / 0.3, 1));
		}

		if (projectsContentRef.current) {
			projectsContentRef.current.style.opacity = String(
				Math.min(Math.max((ratio - 0.2) / 0.3, 0), 1),
			);
		}
	}, []);

	const { snapTo, activeSection, showLabel } = useScrollSnap({
		containerRef,
		sectionCount: SECTIONS.length,
		onScrollProgress,
	});

	return (
		<div
			ref={containerRef}
			className='[&::-webkit-scrollbar]:hidden relative h-dvh overflow-y-scroll [scrollbar-width:none]'
		>
			<Helmet>
				<title>{config.name}</title>
			</Helmet>

			<button
				type='button'
				onClick={() => navigate('/contact')}
				className='group top-6 right-6 z-30 fixed flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
			>
				<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
				<MdArrowDownward className='relative text-sm -rotate-90' />
				<span className='relative'>Hire me</span>
			</button>

			<div className='group/nav top-6 left-6 z-30 fixed flex flex-col items-start gap-3 p-3'>
				<div className='left-0 absolute inset-0 opacity-0 group-hover/nav:opacity-100 backdrop-blur-xs border border-white/10 w-8 group-hover/nav:w-full transition-all duration-300 pointer-events-none' />
				{SECTIONS.map((label, i) => (
					<button
						key={label}
						type='button'
						onClick={() => snapTo(i)}
						className='relative flex items-center gap-2.5 cursor-pointer'
					>
						<span
							className={cn(
								'block border border-neutral-500 w-2 h-2 transition-all duration-300',
								activeSection === i
									? 'bg-white border-white scale-110'
									: 'bg-transparent',
							)}
						/>
						<span
							className={cn(
								'opacity-0 font-light text-xs uppercase tracking-widest transition-all -translate-x-2 group-hover/nav:translate-x-0 duration-300',
								showLabel && activeSection === i ? 'opacity-70 translate-x-0' : '',
								activeSection === i
									? 'group-hover/nav:opacity-70'
									: 'group-hover/nav:opacity-40',
							)}
							style={{ transitionDelay: `${i * 50}ms` }}
						>
							{label}
						</span>
					</button>
				))}
			</div>

			<HeroSection contentRef={heroContentRef} onScrollDown={() => snapTo(1)} />
			<ProjectsSection contentRef={projectsContentRef} />
		</div>
	);
}

export default Home;
