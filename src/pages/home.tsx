import { Helmet } from 'react-helmet-async';
import { Locate } from 'lucide-react';
import config from '@config.json';

import { useBreakpoint } from '~/components/hooks';
import Tag from '~/components/tag';

export const path = '/';
export const element = Home;

export const showInHeader = true;
export const headerOrder = 1;

function Home() {
	const isMedium = useBreakpoint('md');

	return (
		<div className='flex min-h-[calc(100dvh-10dvh)] justify-center items-center p-0 overflow-hidden'>
			<Helmet>
				<title>{config.name}</title>
			</Helmet>
			<div className='relative flex flex-col justify-center items-center gap-4 w-full h-full overflow-x-clip'>
				<div
					className='z-0 absolute opacity-30 zoom-in-0 w-[1000px] h-[1000px] animate-in duration-1000 ease-out fade-in'
					style={{
						background: `radial-gradient(${isMedium ? 50 : 30}% ${isMedium ? 50 : 30}% at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(0, 0, 0, 0) 100%)`,
					}}
				/>
				<div className='slide-in-from-bottom-8 bg-clip-text bg-gradient-to-br from-white to-neutral-500 zoom-in-105 font-bold text-5xl text-center text-transparent sm:text-6xl animate-in duration-500 fade-in-0'>
					{config.name}
				</div>
				<div className='slide-in-from-bottom-8 zoom-in-105 px-8 sm:px-0 font-medium text-center text-neutral-400 text-sm sm:text-base animate-in duration-700 fade-in'>
					{config.subtext}
				</div>
				<Tag
					href='https://www.google.com/maps/place/London/'
					className='slide-in-from-bottom-8 zoom-in-105 animate-in duration-700 fade-in flex gap-2 items-center'
				>
					<Locate size={12} /> {config.location}
				</Tag>
			</div>
		</div>
	);
}
