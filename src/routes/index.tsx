import { createFileRoute, Link } from '@tanstack/solid-router';
import { For, onCleanup, onMount } from 'solid-js';
import { ArrowRight } from 'lucide-solid';
import { Title } from '@solidjs/meta';

import useScrollSnap from '~/components/hooks/use-scroll-snap';
import { prefetchSlots } from '~/components/booking/defaults';
import { site } from '~/content/site';
import { cn } from '~/utils';

import OtherWorkSection from './-components/home/other-work-section';
import ProjectsSection from './-components/home/projects-section';
import HeroSection from './-components/home/hero-section';

const SECTIONS = ['Intro', 'Featured Work', 'Other Work'] as const;

const corner =
	'absolute w-2 h-2 border-white/0 group-hover:border-white/60 group-focus-visible:border-white/60 transition-[border-color,translate] duration-300';

function HireMe() {
	return (
		<div class='top-6 right-6 z-30 fixed flex items-center gap-4'>
			<Link
				to='/contact'
				preload='intent'
				onPointerEnter={prefetchSlots}
				onFocus={prefetchSlots}
				onTouchStart={prefetchSlots}
				class='group relative flex items-stretch focus-visible:outline-hidden font-medium text-black text-sm uppercase tracking-widest'
			>
				<span
					class={cn(
						corner,
						'-top-1.5 -left-1.5 border-t border-l translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
				<span
					class={cn(
						corner,
						'-top-1.5 -right-1.5 border-t border-r -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
				<span
					class={cn(
						corner,
						'-bottom-1.5 -left-1.5 border-b border-l translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>
				<span
					class={cn(
						corner,
						'-right-1.5 -bottom-1.5 border-r border-b -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
					)}
				/>

				<span class='bg-white group-hover:bg-neutral-100 px-4 py-2 transition-colors duration-300'>
					Hire me
				</span>
				<span class='relative flex justify-center items-center bg-white group-hover:bg-neutral-200 border-black/10 border-l w-9 overflow-hidden transition-colors duration-300'>
					<ArrowRight
						class='transition-transform group-hover:translate-x-6 duration-300 ease-out'
						size={14}
					/>
					<ArrowRight
						class='absolute transition-transform -translate-x-6 group-hover:translate-x-0 duration-300 ease-out'
						size={14}
					/>
				</span>
			</Link>
		</div>
	);
}

function Home() {
	let containerRef!: HTMLDivElement;
	let heroContentRef!: HTMLDivElement;
	let projectsContentRef!: HTMLDivElement;
	let otherContentRef!: HTMLDivElement;

	function onScrollProgress(ratio: number) {
		if (heroContentRef) {
			heroContentRef.style.opacity = String(1 - Math.min(ratio / 0.3, 1));
		}

		if (projectsContentRef) {
			const fadeIn = Math.min(Math.max((ratio - 0.2) / 0.3, 0), 1);
			const fadeOut = 1 - Math.min(Math.max((ratio - 1) / 0.3, 0), 1);

			projectsContentRef.style.opacity = String(Math.min(fadeIn, fadeOut));
		}

		if (otherContentRef) {
			otherContentRef.style.opacity = String(Math.min(Math.max((ratio - 1.2) / 0.3, 0), 1));
		}
	}

	const { snapTo, activeSection, showLabel } = useScrollSnap({
		container: () => containerRef,
		sectionCount: SECTIONS.length,
		onScrollProgress,
	});

	onMount(() => {
		const timer = setTimeout(() => {
			// Skip if the visitor already scrolled or the browser restored a scroll position.
			if (activeSection() === 0 && containerRef.scrollTop === 0) snapTo(1);
		}, 1000);

		onCleanup(() => clearTimeout(timer));
	});

	return (
		<div
			ref={(el) => (containerRef = el)}
			class='[&::-webkit-scrollbar]:hidden relative h-dvh overflow-y-scroll [scrollbar-width:none]'
		>
			<Title>{site.name}</Title>

			<HireMe />

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
			<ProjectsSection
				contentRef={(el: HTMLDivElement) => (projectsContentRef = el)}
				onScrollDown={() => snapTo(2)}
			/>
			<OtherWorkSection
				contentRef={(el: HTMLDivElement) => (otherContentRef = el)}
				active={activeSection() === 2}
				onScrollTop={() => snapTo(0)}
			/>
		</div>
	);
}

export const Route = createFileRoute('/')({
	component: Home,
});
