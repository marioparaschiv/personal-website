import { For, Show, createEffect, createSignal, on } from 'solid-js';
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-solid';

import Lightbox from '~/components/lightbox';
import { cn } from '~/utils';

type Image = {
	src: string;
	title: string;
	subtitle: string;
};

type MediaProps = {
	images: Image[];
};

const FALLBACK = '/img/projects/fallback.png';

const navButton =
	'group/nav relative flex items-center justify-center opacity-70 hover:opacity-100 p-2 border border-transparent hover:border-white/30 overflow-hidden transition-all duration-300 cursor-pointer';

function onImageError(event: Event) {
	const img = event.currentTarget as HTMLImageElement;

	if (!img.src.endsWith(FALLBACK)) img.src = FALLBACK;
}

function pad(value: number) {
	return String(value).padStart(2, '0');
}

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const SWOOSH_MS = 460;

// The blur is the motion streak: it peaks while the image is moving fastest and clears as it settles.
function swoosh(
	incoming: HTMLElement | undefined,
	outgoing: HTMLElement | undefined,
	direction: number,
) {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const shift = reduced ? 0 : 14 * direction;
	const blur = reduced ? 0 : 10;
	const timing = { duration: reduced ? 200 : SWOOSH_MS, easing: EASE_OUT };

	incoming?.animate(
		[
			{ opacity: 0, translate: `${shift}% 0`, filter: `blur(${blur}px)` },
			{ opacity: 1, translate: '0 0', filter: 'blur(0px)' },
		],
		timing,
	);

	outgoing?.animate(
		[
			{ opacity: 1, translate: '0 0', filter: 'blur(0px)' },
			{ opacity: 0, translate: `${-shift}% 0`, filter: `blur(${blur}px)` },
		],
		timing,
	);
}

function Media(props: MediaProps) {
	const [selected, setSelected] = createSignal(0);
	const [lightboxOpen, setLightboxOpen] = createSignal(false);
	const [sourceRect, setSourceRect] = createSignal<DOMRect | null>(null);

	let frameRef!: HTMLButtonElement;
	let stripRef: HTMLDivElement | undefined;
	const slides: HTMLImageElement[] = [];

	const count = () => props.images.length;
	const current = () => props.images[selected()];

	createEffect(
		on(
			() => props.images,
			() => setSelected(0),
			{ defer: true },
		),
	);

	function select(index: number, direction = Math.sign(index - selected())) {
		const previous = selected();
		const next = (index + count()) % count();

		if (next === previous) return;

		swoosh(slides[next], slides[previous], direction || 1);
		setSelected(next);
		stripRef?.children[next]?.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		});
	}

	function openLightbox() {
		setSourceRect(frameRef.getBoundingClientRect());
		setLightboxOpen(true);
	}

	return (
		<Show when={count() > 0}>
			<div class='flex flex-col gap-3'>
				<button
					ref={frameRef}
					type='button'
					aria-label={`Expand ${current()?.title}`}
					class='group relative bg-neutral-900 border border-neutral-800 hover:border-white/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white w-full aspect-video overflow-hidden transition-colors duration-300 cursor-zoom-in'
					onClick={openLightbox}
				>
					<For each={props.images}>
						{(image, index) => (
							<img
								ref={(el) => (slides[index()] = el)}
								loading={index() === 0 ? 'eager' : 'lazy'}
								decoding='async'
								alt={image.title}
								src={image.src}
								onError={onImageError}
								draggable={false}
								class={cn(
									'absolute inset-0 w-full h-full object-cover transition-[scale] duration-500 ease-out group-hover:scale-[1.02]',
									index() === selected() ? 'opacity-100' : 'opacity-0',
								)}
							/>
						)}
					</For>

					<span class='right-4 bottom-4 absolute flex items-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 backdrop-blur-sm px-3 py-1.5 font-light text-white text-xs uppercase tracking-widest transition-[opacity,translate] translate-y-1 group-hover:translate-y-0 duration-300'>
						<Maximize2 size={12} />
						Expand
					</span>

					<span class='top-2 left-2 absolute border-white/0 group-hover:border-white/50 border-t-2 border-l-2 w-5 h-5 transition-[border-color,translate] translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300' />
					<span class='top-2 right-2 absolute border-white/0 group-hover:border-white/50 border-t-2 border-r-2 w-5 h-5 transition-[border-color,translate] -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300' />
					<span class='bottom-2 left-2 absolute border-white/0 group-hover:border-white/50 border-b-2 border-l-2 w-5 h-5 transition-[border-color,translate] translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300' />
					<span class='right-2 bottom-2 absolute border-white/0 group-hover:border-white/50 border-r-2 border-b-2 w-5 h-5 transition-[border-color,translate] -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300' />
				</button>

				<div class='flex items-center gap-4'>
					<div class='flex flex-col flex-1 gap-0.5 min-w-0'>
						<span class='font-medium text-white sm:text-lg truncate'>
							{current()?.title}
						</span>
						<span class='text-neutral-400 text-sm truncate'>{current()?.subtitle}</span>
					</div>

					<Show when={count() > 1}>
						<div class='flex items-center gap-1 shrink-0'>
							<span class='mr-2 font-light text-neutral-400 text-xs tabular-nums uppercase tracking-widest'>
								<span class='text-white'>{pad(selected() + 1)}</span> /{' '}
								{pad(count())}
							</span>
							<button
								type='button'
								aria-label='Previous image'
								class={navButton}
								onClick={() => select(selected() - 1, -1)}
							>
								<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover/nav:scale-x-100 origin-left transition-transform duration-300' />
								<ArrowLeft class='relative' size={14} />
							</button>
							<button
								type='button'
								aria-label='Next image'
								class={navButton}
								onClick={() => select(selected() + 1, 1)}
							>
								<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover/nav:scale-x-100 origin-left transition-transform duration-300' />
								<ArrowRight class='relative' size={14} />
							</button>
						</div>
					</Show>
				</div>

				<Show when={count() > 1}>
					<div
						ref={stripRef}
						class='flex gap-2 pb-1 overflow-x-auto [scrollbar-width:none]'
					>
						<For each={props.images}>
							{(image, index) => (
								<button
									type='button'
									aria-label={image.title}
									aria-current={index() === selected()}
									class={cn(
										'relative flex-1 bg-neutral-900 border min-w-28 max-w-44 aspect-video overflow-hidden transition-[opacity,border-color] duration-300 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white',
										index() === selected()
											? 'border-white/60 opacity-100'
											: 'border-neutral-800 opacity-50 hover:opacity-90 hover:border-white/30',
									)}
									onClick={() => select(index())}
								>
									<img
										loading='lazy'
										decoding='async'
										alt=''
										src={image.src}
										onError={onImageError}
										draggable={false}
										class='absolute inset-0 w-full h-full object-cover'
									/>
								</button>
							)}
						</For>
					</div>
				</Show>
			</div>

			<Lightbox
				images={props.images}
				index={() => selected()}
				open={() => lightboxOpen()}
				onOpenChange={setLightboxOpen}
				onIndexChange={select}
				sourceRect={() => sourceRect()}
			/>
		</Show>
	);
}

export default Media;
