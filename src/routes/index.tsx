import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { ArrowDown } from 'lucide-solid';
import { Title } from '@solidjs/meta';
import { For } from 'solid-js';

import useScrollSnap from '~/components/hooks/use-scroll-snap';
import { site } from '~/content/site';
import { cn } from '~/utils';

import ProjectsSection from './-components/home/projects-section';
import HeroSection from './-components/home/hero-section';

const SECTIONS = ['Intro', 'My Work'] as const;

function Home() {
	const navigate = useNavigate();
	let containerRef!: HTMLDivElement;
	let heroContentRef!: HTMLDivElement;
	let projectsContentRef!: HTMLDivElement;

	function onScrollProgress(ratio: number) {
		if (heroContentRef) {
			heroContentRef.style.opacity = String(1 - Math.min(ratio / 0.3, 1));
		}

		if (projectsContentRef) {
			projectsContentRef.style.opacity = String(
				Math.min(Math.max((ratio - 0.2) / 0.3, 0), 1),
			);
		}
	}

	const { snapTo, activeSection, showLabel } = useScrollSnap({
		container: () => containerRef,
		sectionCount: SECTIONS.length,
		onScrollProgress,
	});

	return (
		<div
			ref={containerRef}
			class='[&::-webkit-scrollbar]:hidden relative h-dvh overflow-y-scroll [scrollbar-width:none]'
		>
			<Title>{site.name}</Title>

			<button
				type='button'
				onClick={() => navigate({ to: '/contact' })}
				class='group top-6 right-6 z-30 fixed flex items-center gap-2 bg-white px-4 py-2 font-medium text-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all duration-300 cursor-pointer'
			>
				<span class='relative'>Hire me</span>
				<ArrowDown class='relative text-sm -rotate-90' size={14} />
			</button>

			<div class='group/nav top-6 left-6 z-30 fixed flex flex-col items-start gap-3 p-3'>
				<div class='left-0 absolute inset-0 opacity-0 group-hover/nav:opacity-100 backdrop-blur-xs border border-white/10 w-8 group-hover/nav:w-full transition-all duration-300 pointer-events-none' />
				<For each={[...SECTIONS]}>
					{(label, i) => (
						<button
							type='button'
							onClick={() => snapTo(i())}
							class='relative flex items-center gap-2.5 cursor-pointer'
						>
							<span
								class={cn(
									'block border border-neutral-500 w-2 h-2 transition-all duration-300',
									activeSection() === i()
										? 'bg-white border-white scale-110'
										: 'bg-transparent',
								)}
							/>
							<span
								class={cn(
									'opacity-0 font-light text-xs uppercase tracking-widest transition-all -translate-x-2 group-hover/nav:translate-x-0 duration-300',
									showLabel() && activeSection() === i()
										? 'opacity-70 translate-x-0'
										: '',
									activeSection() === i()
										? 'group-hover/nav:opacity-70'
										: 'group-hover/nav:opacity-40',
								)}
								style={{ 'transition-delay': `${i() * 50}ms` }}
							>
								{label}
							</span>
						</button>
					)}
				</For>
			</div>

			<HeroSection
				contentRef={(el: HTMLDivElement) => (heroContentRef = el)}
				onScrollDown={() => snapTo(1)}
			/>
			<ProjectsSection contentRef={(el: HTMLDivElement) => (projectsContentRef = el)} />
		</div>
	);
}

export const Route = createFileRoute('/')({
	component: Home,
});
