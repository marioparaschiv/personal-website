import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import type { EmblaCarouselType } from 'embla-carousel';
import { useCallback, useRef } from 'react';
import * as React from 'react';

import Button from '~/components/button';
import { cn } from '~/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: 'horizontal' | 'vertical';
	setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error('useCarousel must be used within a <Carousel />');
	}

	return context;
}

const TWEEN_FACTOR_BASE = 0.2;

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

const Carousel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = 'horizontal', opts, setApi, plugins, className, children, ...props }, ref) => {
	const [carouselRef, api] = useEmblaCarousel(
		{
			...opts,
			axis: orientation === 'horizontal' ? 'x' : 'y',
		},
		plugins,
	);
	const [canScrollPrev, setCanScrollPrev] = React.useState(false);
	const [canScrollNext, setCanScrollNext] = React.useState(false);

	const tweenFactor = useRef(0);

	const animate = useCallback((api: EmblaCarouselType) => {
		const scrollProgress = api.scrollProgress();
		const engine = api.internalEngine();
		const list = api.scrollSnapList();

		for (let index = 0; index < list.length; index++) {
			const snap = list[index];

			let diffToTarget = snap - scrollProgress;

			const slidesInSnap = engine.slideRegistry[index];
			for (const slideIndex of slidesInSnap) {
				// Fix looping
				if (engine.options.loop) {
					for (const point of engine.slideLooper.loopPoints) {
						const target = point.target();

						if (slideIndex === point.index && target !== 0) {
							const sign = Math.sign(target);

							if (sign === -1) {
								diffToTarget = snap - (1 + scrollProgress);
							}

							if (sign === 1) {
								diffToTarget = snap + (1 - scrollProgress);
							}
						}
					}
				}

				const value = 1 - Math.abs(diffToTarget * tweenFactor.current);
				const opacity = numberWithinRange(value, 0.6, 1).toString();
				const scale = numberWithinRange(value, 0.85, 1).toString();

				const nodes = api.slideNodes();

				const container = nodes[slideIndex];
				const node = container?.firstChild as HTMLElement;
				if (!node || container?.getAttribute('data-carousel-item') !== 'true') return;

				// Override scale with our own while still keeping all other transforms.
				const modifiers = [`scale(${scale})`];
				const prev = node.attributeStyleMap.get('transform');
				if (prev) {
					const transform = prev as CSSStyleValue & {
						values: typeof Map.prototype.values;
					};

					for (const declaration of transform.values()) {
						if (declaration[Symbol.toStringTag] === 'CSSScale') {
							continue;
						}

						modifiers.push(declaration.toString());
					}
				}

				node.style.opacity = opacity;
				node.style.transform = modifiers.join(' ');
			}
		}
	}, []);

	const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
		tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
	}, []);

	const onSelect = React.useCallback((api: CarouselApi) => {
		if (!api) {
			return;
		}

		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);

	const scrollPrev = React.useCallback(() => {
		api?.scrollPrev();
	}, [api]);

	const scrollNext = React.useCallback(() => {
		api?.scrollNext();
	}, [api]);

	React.useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				scrollPrev();
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				scrollNext();
			}
		}

		document.addEventListener('keydown', onKeyDown);

		return () => document.removeEventListener('keydown', onKeyDown);
	}, [scrollPrev, scrollNext]);

	React.useEffect(() => {
		if (!api || !setApi) {
			return;
		}

		setApi(api);
	}, [api, setApi]);

	React.useEffect(() => {
		if (!api) return;

		setTweenFactor(api);
		animate(api);

		api.on('reInit', setTweenFactor);
		api.on('reInit', animate);
		api.on('scroll', animate);
	}, [api, animate, setTweenFactor]);

	React.useEffect(() => {
		if (!api) {
			return;
		}

		onSelect(api);
		api.on('reInit', onSelect);
		api.on('select', onSelect);

		return () => {
			api?.off('select', onSelect);
		};
	}, [api, onSelect]);

	return (
		<CarouselContext.Provider
			value={{
				carouselRef,
				api: api,
				opts,
				orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
				scrollPrev,
				scrollNext,
				canScrollPrev,
				canScrollNext,
			}}
		>
			<div
				ref={ref}
				className={cn('relative', className)}
				role='region'
				aria-roledescription='carousel'
				{...props}
			>
				{children}
			</div>
		</CarouselContext.Provider>
	);
});
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const { carouselRef, orientation } = useCarousel();

		return (
			<div ref={carouselRef} className='overflow-hidden'>
				<div
					ref={ref}
					className={cn(
						'flex',
						orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
						className,
					)}
					{...props}
				/>
			</div>
		);
	},
);

CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const { orientation } = useCarousel();

		return (
			<div
				ref={ref}
				data-carousel-item={true}
				role='group'
				aria-roledescription='slide'
				className={cn(
					'min-w-0 shrink-0 grow-0',
					orientation === 'horizontal' ? 'pl-4' : 'pt-4',
					className,
				)}
				{...props}
			/>
		);
	},
);
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
	({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
		const { scrollPrev, canScrollPrev } = useCarousel();

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				className={cn('h-10 w-10 rounded-full', className)}
				disabled={!canScrollPrev}
				onClick={scrollPrev}
				{...props}
			>
				<ArrowLeftIcon className='w-1/2 h-1/2' />
				<span className='sr-only'>Previous slide</span>
			</Button>
		);
	},
);
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
	({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
		const { scrollNext, canScrollNext } = useCarousel();

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				className={cn('h-10 w-10 rounded-full', className)}
				disabled={!canScrollNext}
				onClick={scrollNext}
				{...props}
			>
				<ArrowRightIcon className='w-1/2 h-1/2' />
				<span className='sr-only'>Next slide</span>
			</Button>
		);
	},
);

CarouselNext.displayName = 'CarouselNext';

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
};
