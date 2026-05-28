import { For, createEffect, createSignal, onCleanup } from 'solid-js';

import { useCarousel } from '~/components/carousel';
import { cn } from '~/utils';

function CarouselDots() {
	const carousel = useCarousel();

	const [idx, setIndex] = createSignal(0);
	const [nodes, setNodes] = createSignal<Node[]>([]);

	createEffect(() => {
		const api = carousel.api();
		if (!api) return;

		function onSlideChange() {
			setIndex(api!.selectedScrollSnap());
			setNodes([...api!.slideNodes()]);
		}

		onSlideChange();

		api.on('reInit', onSlideChange);
		api.on('scroll', onSlideChange);

		onCleanup(() => {
			api.off('reInit', onSlideChange);
			api.off('scroll', onSlideChange);
		});
	});

	return (
		<div class='flex justify-center items-center gap-3'>
			<For each={nodes()}>
				{(_, index) => (
					<div
						class={cn(
							'bg-transparent border border-neutral-500 w-2 h-2 transition-all duration-300 cursor-pointer',
							idx() === index() && 'bg-white border-white scale-110',
						)}
						onClick={() => carousel.api()?.scrollTo(index())}
					/>
				)}
			</For>
		</div>
	);
}

export default CarouselDots;
