import { Show, createSignal, on, onCleanup, onMount, createEffect } from 'solid-js';
import { ArrowLeft, ArrowRight, X } from 'lucide-solid';
import { Dialog } from '@kobalte/core/dialog';
import type { Accessor } from 'solid-js';

import { usePrefersReducedMotion } from '~/components/hooks/use-media-query';

interface Image {
	src: string;
	title: string;
	subtitle: string;
}

interface LightboxProps {
	images: Image[];
	index: Accessor<number>;
	open: Accessor<boolean>;
	onOpenChange: (open: boolean) => void;
	onIndexChange?: (index: number) => void;
	sourceRect: Accessor<DOMRect | null>;
}

function computeFlipTransform(from: DOMRect, to: DOMRect): string {
	const scaleX = from.width / to.width;
	const scaleY = from.height / to.height;
	const dx = from.left + from.width / 2 - (to.left + to.width / 2);
	const dy = from.top + from.height / 2 - (to.top + to.height / 2);

	return `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
}

function Lightbox(props: LightboxProps) {
	const reducedMotion = usePrefersReducedMotion();

	const [activeIndex, setActiveIndex] = createSignal(0);
	const [animating, setAnimating] = createSignal(false);
	const [crossFading, setCrossFading] = createSignal(false);
	const [transitioning, setTransitioning] = createSignal(false);
	const [transform, setTransform] = createSignal<string | undefined>(undefined);
	const [imgOpacity, setImgOpacity] = createSignal(1);
	const [overlayOpacity, setOverlayOpacity] = createSignal(0);

	let boxRef: HTMLDivElement | undefined;
	let innerImgRef: HTMLImageElement | undefined;
	let touchStartX = 0;

	const image = () => props.images[activeIndex()];
	const hasMultiple = () => props.images.length > 1;

	createEffect(
		on(
			() => props.open(),
			(open) => {
				if (!open) return;
				setActiveIndex(props.index());
			},
		),
	);

	function runFlip(rect: DOMRect) {
		if (!boxRef) return;

		setAnimating(true);

		const to = boxRef.getBoundingClientRect();
		const flip = computeFlipTransform(rect, to);

		setTransitioning(false);
		setTransform(flip);
		setImgOpacity(1);

		boxRef.offsetHeight;

		setTransitioning(true);
		setTransform(undefined);

		const onEnd = (e: TransitionEvent) => {
			if (e.propertyName !== 'transform') return;
			boxRef?.removeEventListener('transitionend', onEnd);
			setAnimating(false);
		};

		boxRef?.addEventListener('transitionend', onEnd);
	}

	function playOpen() {
		setOverlayOpacity(1);

		const rect = props.sourceRect();
		if (!rect || !boxRef || reducedMotion()) {
			setImgOpacity(1);
			setTransitioning(true);
			return;
		}

		const to = boxRef.getBoundingClientRect();

		if (to.width === 0 || to.height === 0) {
			setImgOpacity(0);

			const settle = () => {
				innerImgRef?.removeEventListener('load', settle);
				innerImgRef?.removeEventListener('error', settle);
				requestAnimationFrame(() => runFlip(rect));
			};

			innerImgRef?.addEventListener('load', settle);
			innerImgRef?.addEventListener('error', settle);
			return;
		}

		runFlip(rect);
	}

	function close() {
		if (animating()) return;

		setOverlayOpacity(0);

		const rect = props.sourceRect();
		if (!rect || !boxRef || reducedMotion()) {
			setTimeout(() => {
				props.onOpenChange(false);
				setTransitioning(false);
			}, 300);
			return;
		}

		setAnimating(true);
		setTransitioning(true);

		const from = boxRef.getBoundingClientRect();
		setTransform(computeFlipTransform(rect, from));

		const onEnd = (e: TransitionEvent) => {
			if (e.propertyName !== 'transform') return;
			boxRef?.removeEventListener('transitionend', onEnd);
			setImgOpacity(0);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setAnimating(false);
					setTransitioning(false);
					setTransform(undefined);
					setImgOpacity(1);
					props.onOpenChange(false);
				});
			});
		};

		boxRef?.addEventListener('transitionend', onEnd);
	}

	function navigate(delta: number) {
		if (animating() || crossFading() || !hasMultiple()) return;

		const next = (activeIndex() + delta + props.images.length) % props.images.length;

		setCrossFading(true);
		setImgOpacity(0);

		setTimeout(() => {
			setActiveIndex(next);
			props.onIndexChange?.(next);
			setImgOpacity(1);

			setTimeout(() => setCrossFading(false), 200);
		}, 150);
	}

	function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				navigate(-1);
				break;
			case 'ArrowRight':
				e.preventDefault();
				navigate(1);
				break;
		}
	}

	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent) {
		const delta = e.changedTouches[0].clientX - touchStartX;
		if (Math.abs(delta) > 50) {
			navigate(delta > 0 ? -1 : 1);
		}
	}

	onMount(() => {
		const handler = (e: KeyboardEvent) => {
			if (props.open()) onKeyDown(e);
		};

		window.addEventListener('keydown', handler);
		onCleanup(() => window.removeEventListener('keydown', handler));
	});

	return (
		<Dialog
			open={props.open()}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay
					class='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity duration-300 ease-in-out'
					style={{ opacity: overlayOpacity() }}
					onClick={close}
				/>
				<Dialog.Content
					class='fixed inset-0 z-50 flex flex-col items-center justify-center outline-hidden'
					onTouchStart={onTouchStart}
					onTouchEnd={onTouchEnd}
				>
					<Dialog.Title class='sr-only'>{image()?.title}</Dialog.Title>

					<div class='relative flex items-center justify-center w-full h-full p-4 sm:p-12'>
						<Show when={image()}>
							{(img) => (
								<div
									ref={(el) => {
										boxRef = el;
										if (props.open()) {
											requestAnimationFrame(() => playOpen());
										}
									}}
									classList={{
										'relative w-[90vw] aspect-video select-none': true,
										'lightbox-transition': transitioning(),
									}}
									style={{
										transform: transform(),
										opacity: imgOpacity(),
									}}
								>
									<img
										ref={innerImgRef}
										src={img().src}
										alt={img().title}
										class='absolute w-full h-full object-cover'
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).src =
												'/img/projects/fallback.png';
										}}
										draggable={false}
									/>
								</div>
							)}
						</Show>
					</div>

					<Dialog.CloseButton
						class='fixed top-4 right-4 z-50 p-2 text-white/70 hover:text-white transition-[color,opacity] duration-300 cursor-pointer'
						style={{ opacity: overlayOpacity() }}
						onClick={(e: MouseEvent) => {
							e.stopPropagation();
							close();
						}}
						aria-label='Close lightbox'
					>
						<X size={24} />
					</Dialog.CloseButton>

					<Show when={hasMultiple()}>
						<button
							type='button'
							class='fixed left-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white/70 hover:text-white transition-[color,opacity] duration-300 cursor-pointer'
							style={{ opacity: overlayOpacity() }}
							onClick={() => navigate(-1)}
							aria-label='Previous image'
						>
							<ArrowLeft size={24} />
						</button>
						<button
							type='button'
							class='fixed right-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white/70 hover:text-white transition-[color,opacity] duration-300 cursor-pointer'
							style={{ opacity: overlayOpacity() }}
							onClick={() => navigate(1)}
							aria-label='Next image'
						>
							<ArrowRight size={24} />
						</button>
					</Show>

					<div
						class='fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-1 pb-4 pointer-events-none transition-[opacity,transform] duration-300 ease-in-out'
						style={{
							opacity: overlayOpacity(),
							transform: overlayOpacity() === 1 ? 'translateY(0)' : 'translateY(1rem)',
						}}
					>
						<Show when={hasMultiple()}>
							<span class='text-white/70 text-xs font-medium tabular-nums'>
								{activeIndex() + 1} / {props.images.length}
							</span>
						</Show>
						<Show when={image()}>
							{(img) => (
								<span class='text-white/50 text-xs text-center px-4 truncate max-w-sm'>
									{img().title}
								</span>
							)}
						</Show>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}

export default Lightbox;
