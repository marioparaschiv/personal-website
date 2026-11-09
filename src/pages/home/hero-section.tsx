import { MdArrowDownward } from 'react-icons/md';
import config from '@config.json';

import Beams from '~/components/effects/beams';

interface HeroSectionProps {
	contentRef: React.RefObject<HTMLDivElement | null>;
	onScrollDown: () => void;
}

function HeroSection({ contentRef, onScrollDown }: HeroSectionProps) {
	return (
		<section className='relative h-full shrink-0'>
			<div className='z-0 absolute inset-0 bg-black opacity-50 animate-in duration-1000 ease-out fade-in'>
				<Beams
					beamWidth={3}
					beamHeight={30}
					beamNumber={12}
					lightColor='#ffffff'
					speed={2}
					noiseIntensity={1.75}
					scale={0.2}
					rotation={35}
					/* enableMouseInteraction={false} colorNum={5} waveSpeed={0.03} */
				/>
			</div>
			<div
				ref={contentRef}
				className='z-10 relative flex flex-col justify-center items-center gap-4 drop-shadow-2xl drop-shadow-black w-full h-full overflow-x-clip'
			>
				<div className='slide-in-from-bottom-8 bg-clip-text bg-linear-to-br from-white to-neutral-500 font-black text-transparent text-5xl sm:text-6xl text-center uppercase tracking-widest animate-in duration-500 zoom-in-105 fade-in-0'>
					{config.name}
				</div>
				<div className='slide-in-from-bottom-8 px-8 sm:px-0 font-bold text-neutral-400 text-sm sm:text-base text-center animate-in duration-700 zoom-in-105 fade-in'>
					{config.subtext}
				</div>
			</div>
			<div className='bottom-0 z-20 absolute inset-x-0 bg-linear-to-t from-background to-transparent h-32 pointer-events-none' />
			<button
				type='button'
				onClick={onScrollDown}
				className='bottom-15 z-20 absolute inset-x-0 flex flex-col justify-center items-center gap-2 opacity-60 text-muted-foreground hover:text-foreground transition-[color,translate] hover:translate-y-1 duration-250 ease-in-out cursor-pointer'
			>
				<span className='text-xs uppercase bold'>My Work</span>
				<MdArrowDownward className='text-lg' />
			</button>
		</section>
	);
}

export default HeroSection;
