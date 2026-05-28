import {
	type JSX,
	createContext,
	createSignal,
	onCleanup,
	onMount,
	splitProps,
	useContext,
} from 'solid-js';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-solid';
import EmblaCarousel from 'embla-carousel';

import Button from '~/components/button';
import { cn } from '~/utils';

type CarouselApi = EmblaCarouselType | undefined;

type CarouselProps = {
	opts?: EmblaOptionsType;
	plugins?: EmblaPluginType[];
	orientation?: 'horizontal' | 'vertical';
	setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
	containerRef: (el: HTMLDivElement) => void;
	api: () => CarouselApi;
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: () => boolean;
	canScrollNext: () => boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps>();

export function useCarousel() {
	const context = useContext(CarouselContext);

	if (!context) {
		throw new Error('useCarousel must be used within a <Carousel />');
	}

	return context;
}

const TWEEN_FACTOR_BASE = 0.2;

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

function Carousel(
	props: JSX.HTMLAttributes<HTMLDivElement> &
		CarouselProps & { ref?: HTMLDivElement | ((el: HTMLDivElement) => void) },
) {
	const [local, rest] = splitProps(props, [
		'orientation',
		'opts',
		'setApi',
		'plugins',
		'class',
		'children',
		'ref',
	]);

	const [api, setApiSignal] = createSignal<CarouselApi>(undefined);
	const [canScrollPrev, setCanScrollPrev] = createSignal(false);
	const [canScrollNext, setCanScrollNext] = createSignal(false);

	let tweenFactor = 0;
	let containerEl: HTMLDivElement | undefined;

	const orientation = () => local.orientation ?? 'horizontal';

	function animate(emblaApi: EmblaCarouselType) {
		const scrollProgress = emblaApi.scrollProgress();
		const engine = emblaApi.internalEngine();
		const list = emblaApi.scrollSnapList();

		for (let index = 0; index < list.length; index++) {
			const snap = list[index];

			let diffToTarget = snap - scrollProgress;

			const slidesInSnap = engine.slideRegistry[index];
			for (const slideIndex of slidesInSnap) {
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

				const value = 1 - Math.abs(diffToTarget * tweenFactor);
				const opacity = numberWithinRange(value, 0.6, 1).toString();
				const scale = numberWithinRange(value, 0.85, 1).toString();
				const bracketOffset = numberWithinRange(1 - (value - 0.85) / 0.15, 0, 1);

				const nodes = emblaApi.slideNodes();

				const container = nodes[slideIndex];
				const node = container?.firstElementChild as HTMLElement;
				if (!node || container?.getAttribute('data-carousel-item') !== 'true') continue;

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
				node.style.setProperty('--bracket-offset', `${(bracketOffset - 1) * 24}px`);
			}
		}
	}

	function setTweenFactor(emblaApi: EmblaCarouselType) {
		tweenFactor = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
	}

	function onSelect(emblaApi: EmblaCarouselType) {
		setCanScrollPrev(emblaApi.canScrollPrev());
		setCanScrollNext(emblaApi.canScrollNext());
	}

	function scrollPrev() {
		api()?.scrollPrev();
	}

	function scrollNext() {
		api()?.scrollNext();
	}

	function containerRef(el: HTMLDivElement) {
		containerEl = el;
	}

	onMount(() => {
		if (!containerEl) return;

		const emblaApi = EmblaCarousel(
			containerEl,
			{
				...local.opts,
				axis: orientation() === 'horizontal' ? 'x' : 'y',
			},
			local.plugins ?? [],
		);

		setApiSignal(emblaApi);

		if (local.setApi) {
			local.setApi(emblaApi);
		}

		setTweenFactor(emblaApi);
		animate(emblaApi);
		onSelect(emblaApi);

		emblaApi.on('reInit', setTweenFactor);
		emblaApi.on('reInit', animate);
		emblaApi.on('scroll', animate);
		emblaApi.on('reInit', onSelect);
		emblaApi.on('select', onSelect);

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

		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			emblaApi.destroy();
		});
	});

	return (
		<CarouselContext.Provider
			value={{
				containerRef,
				api,
				opts: local.opts,
				orientation: orientation(),
				scrollPrev,
				scrollNext,
				canScrollPrev,
				canScrollNext,
			}}
		>
			<div
				ref={local.ref}
				class={cn('relative', local.class)}
				role='region'
				aria-roledescription='carousel'
				{...rest}
			>
				{local.children}
			</div>
		</CarouselContext.Provider>
	);
}

function CarouselContent(
	props: JSX.HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
	},
) {
	const [local, rest] = splitProps(props, ['class', 'ref']);
	const { containerRef, orientation } = useCarousel();

	return (
		<div ref={containerRef}>
			<div
				ref={local.ref}
				class={cn(
					'flex',
					orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
					local.class,
				)}
				{...rest}
			/>
		</div>
	);
}

function CarouselItem(
	props: JSX.HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
	},
) {
	const [local, rest] = splitProps(props, ['class', 'ref']);
	const { orientation } = useCarousel();

	return (
		<div
			ref={local.ref}
			data-carousel-item={true}
			role='group'
			aria-roledescription='slide'
			class={cn(
				'min-w-0 shrink-0 grow-0',
				orientation === 'horizontal' ? 'pl-4' : 'pt-4',
				local.class,
			)}
			{...rest}
		/>
	);
}

function CarouselPrevious(props: Parameters<typeof Button>[0]) {
	const [local, rest] = splitProps(props, ['class', 'variant', 'size']);
	const { scrollPrev, canScrollPrev } = useCarousel();

	return (
		<Button
			variant={local.variant ?? 'outline'}
			size={local.size ?? 'icon'}
			class={cn(
				'bg-transparent hover:bg-white/10 border-white/30 rounded-none w-10 h-10',
				local.class,
			)}
			disabled={!canScrollPrev()}
			onClick={scrollPrev}
			{...rest}
		>
			<ArrowLeftIcon class='w-1/2 h-1/2' />
			<span class='sr-only'>Previous slide</span>
		</Button>
	);
}

function CarouselNext(props: Parameters<typeof Button>[0]) {
	const [local, rest] = splitProps(props, ['class', 'variant', 'size']);
	const { scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			variant={local.variant ?? 'outline'}
			size={local.size ?? 'icon'}
			class={cn(
				'bg-transparent hover:bg-white/10 border-white/30 rounded-none w-10 h-10',
				local.class,
			)}
			disabled={!canScrollNext()}
			onClick={scrollNext}
			{...rest}
		>
			<ArrowRightIcon class='w-1/2 h-1/2' />
			<span class='sr-only'>Next slide</span>
		</Button>
	);
}

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
};
