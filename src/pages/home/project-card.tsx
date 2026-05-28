import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import config from '@config.json';

import Typography from '~/components/typography';
import { cn } from '~/utils';

function ProjectCard(props: ArrayToTuple<typeof config.projects>) {
	const [width, setWidth] = useState<number>(
		window.innerWidth >= 1080 ? 1080 : window.innerWidth - 100,
	);

	const navigate = useNavigate();

	const onResize = useCallback(() => {
		setWidth(window.innerWidth >= 1080 ? 1080 : window.innerWidth - 100);
	}, []);

	useEffect(() => {
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [onResize]);

	return (
		<div className='relative flex justify-center items-center rounded'>
			<img
				loading='eager'
				decoding='async'
				className='z-1 rounded-[inherit] h-120 md:h-140 object-cover select-none'
				alt={props.name}
				style={{ width }}
				src={props.thumbnail}
				onError={(event) =>
					((event.target as HTMLImageElement).src = '/img/projects/fallback.png')
				}
			/>
			<div className='z-10 absolute bg-linear-to-t from-black/80 to-black/20 w-full h-full'>
				<div className='relative flex flex-col justify-center items-center rounded-sm h-full'>
					<img
						loading='eager'
						decoding='async'
						className={cn('mb-4 rounded-md h-12', props.icon.styles)}
						src={props.icon.path}
					/>
					<div className='flex flex-col justify-center items-center mb-2'>
						<Typography tag='h3' margin={false} padding={false} border={false}>
							{props.name}
						</Typography>
						<Typography tag='h5' className='font-normal text-foreground/80 text-lg'>
							{props.type}
						</Typography>
						<Typography
							tag='h6'
							border={false}
							className='font-normal text-foreground/70 text-xs'
						>
							{props.timeFrame}
						</Typography>
					</div>
					<button
						type='button'
						onClick={() => navigate('/projects/' + props.id)}
						className='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-2 py-1 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
					>
						<span className='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
						<span className='relative'>View project</span>
						<ArrowRight className='relative' size={12} />
					</button>
				</div>
			</div>
			<div
				className='top-0 left-0 z-0 absolute border-white/40 border-t-2 border-l-2 w-6 h-6 pointer-events-none'
				style={{ translate: 'var(--bracket-offset) var(--bracket-offset)' }}
			/>
			<div
				className='top-0 right-0 z-0 absolute border-white/40 border-t-2 border-r-2 w-6 h-6 pointer-events-none'
				style={{ translate: 'calc(var(--bracket-offset) * -1) var(--bracket-offset)' }}
			/>
			<div
				className='bottom-0 left-0 z-0 absolute border-white/40 border-b-2 border-l-2 w-6 h-6 pointer-events-none'
				style={{ translate: 'var(--bracket-offset) calc(var(--bracket-offset) * -1)' }}
			/>
			<div
				className='right-0 bottom-0 z-0 absolute border-white/40 border-r-2 border-b-2 w-6 h-6 pointer-events-none'
				style={{
					translate: 'calc(var(--bracket-offset) * -1) calc(var(--bracket-offset) * -1)',
				}}
			/>
		</div>
	);
}

export default ProjectCard;
