import { site } from '~/content/site';

import HeroBackground, { type HeroBackgroundVariant } from './hero-backgrounds';
import ScrollHint from './scroll-hint';

interface HeroSectionProps {
	contentRef: (el: HTMLDivElement) => void;
	onScrollDown: () => void;
	background: HeroBackgroundVariant;
}

function HeroSection(props: HeroSectionProps) {
	return (
		<section class='relative bg-black h-full shrink-0'>
			<HeroBackground variant={props.background} />
			<div
				ref={props.contentRef}
				class='z-10 relative flex flex-col justify-center items-center gap-4 drop-shadow-2xl drop-shadow-black w-full h-full overflow-x-clip'
			>
				<div class='slide-in-from-bottom-8 bg-clip-text bg-linear-to-br from-white to-neutral-500 font-black text-transparent text-5xl sm:text-6xl text-center uppercase tracking-widest animate-in duration-500 zoom-in-105 fade-in-0'>
					{site.name}
				</div>
				<div class='slide-in-from-bottom-8 px-8 sm:px-0 font-bold text-neutral-400 text-sm sm:text-base text-center animate-in duration-700 zoom-in-105 fade-in'>
					{site.subtext}
				</div>
			</div>
			<div class='bottom-0 z-20 absolute inset-x-0 bg-linear-to-t from-background to-transparent h-32 pointer-events-none' />
			<ScrollHint label='Featured Work' onClick={props.onScrollDown} />
		</section>
	);
}

export default HeroSection;
