import { Link } from '@tanstack/solid-router';
import { ArrowRight } from 'lucide-solid';

import { prefetchSlots } from '~/components/booking/defaults';
import { cn } from '~/utils';

const corner =
	'absolute w-2 h-2 border-white/0 group-hover:border-white/60 group-focus-visible:border-white/60 transition-[border-color,translate] duration-300';

function HireMe() {
	return (
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
	);
}

export default HireMe;
