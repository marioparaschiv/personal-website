import { useEffect, useMemo, useState } from 'react';

import { useCarousel } from '~/components/carousel';
import { cn } from '~/utils';

function CarouselDots() {
	const carousel = useCarousel();

	const [idx, setIndex] = useState(Math.round(carousel.api?.selectedScrollSnap() ?? 0));

	const nodes = useMemo(() => carousel.api?.slideNodes() ?? [], [carousel.api]);

	useEffect(() => {
		function onSlideChange() {
			setIndex(carousel.api?.selectedScrollSnap() ?? 0);
		}

		onSlideChange();

		carousel.api?.on('reInit', onSlideChange);
		carousel.api?.on('scroll', onSlideChange);

		return () => {
			carousel.api?.off('reInit', onSlideChange);
			carousel.api?.off('scroll', onSlideChange);
		};
	}, [carousel]);

	return (
		<div className='flex justify-center items-center gap-3'>
			{nodes.map((_, index) => (
				<div
					key={index}
					className={cn(
						'bg-transparent border border-neutral-500 w-2 h-2 transition-all duration-300 cursor-pointer',
						idx === index && 'bg-white border-white scale-110',
					)}
					onClick={() => carousel.api?.scrollTo(index)}
				/>
			))}
		</div>
	);
}

export default CarouselDots;
