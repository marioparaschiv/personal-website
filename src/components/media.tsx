import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { Dialog } from '@kobalte/core/dialog';
import { ArrowUpDown } from 'lucide-solid';

import Lightbox from '~/components/lightbox';
import Card from '~/components/card';

interface Image {
	src: string;
	title: string;
	subtitle: string;
}

interface MediaProps {
	onSelect?: (index: number) => void;
	images: Image[];
	footer?: {
		enabled?: boolean;
		hint?: boolean;
		subtitle?: string;
	};
}

function Media(props: MediaProps) {
	const [opened, setOpened] = createSignal(false);
	const [locked, setLocked] = createSignal(false);
	const [selected, setSelected] = createSignal(0);
	const [hovered, setHovered] = createSignal(0);
	const [search, setSearch] = createSignal('');

	const [lightboxOpen, setLightboxOpen] = createSignal(false);
	const [sourceRect, setSourceRect] = createSignal<DOMRect | null>(null);

	const [highlightTop, setHighlightTop] = createSignal(0);
	const [highlightWidth, setHighlightWidth] = createSignal(0);
	const [highlightHeight, setHighlightHeight] = createSignal(0);

	let listRef!: HTMLDivElement;
	let highlightRef: HTMLDivElement | undefined;
	let thumbnailRef!: HTMLImageElement;
	let initialMount = true;

	const footer = () => props.footer ?? {};

	const items = createMemo(() => {
		const s = search().toLowerCase();
		return props.images.filter((image) =>
			[image.title, image.subtitle].some((v) => v.toLowerCase().includes(s)),
		);
	});

	createEffect(() => {
		if (items().length - 1 < hovered()) {
			setHovered(0);
		}
	});

	function updateHighlight(target: HTMLElement | undefined) {
		if (!target) return;
		setHighlightTop(target.offsetTop);
		setHighlightWidth(target.offsetWidth);
		setHighlightHeight(target.offsetHeight);
	}

	function scrollToIndex(index: number) {
		if (!listRef) return;

		const child = index + 1;
		const hasVerticalScrollbar = listRef.scrollHeight > listRef.clientHeight;

		if (hasVerticalScrollbar) {
			listRef.children[child]?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}
	}

	function changeIndex(index: number) {
		setHovered(index);
		scrollToIndex(index);
	}

	createEffect(() => {
		hovered();
		if (!highlightRef) return;
		updateHighlight(highlightRef);
	});

	createEffect(() => {
		if (!opened()) {
			initialMount = true;
		}
	});

	function moveDown() {
		setLocked(true);
		changeIndex(hovered() < items().length - 1 ? hovered() + 1 : 0);
	}

	function moveUp() {
		setLocked(true);
		changeIndex(hovered() > 0 ? hovered() - 1 : items().length - 1);
	}

	onMount(() => {
		function onResize() {
			if (!highlightRef) return;

			updateHighlight(highlightRef);
			scrollToIndex(hovered());
		}

		window.addEventListener('resize', onResize);

		onCleanup(() => window.removeEventListener('resize', onResize));
	});

	return (
		<>
			<Show when={props.images.length > 0}>
				<button
					type='button'
					aria-haspopup='dialog'
					class='group relative flex justify-center items-center bg-neutral-900 border border-neutral-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white aspect-video overflow-hidden cursor-pointer w-full'
					onClick={() => {
						if (thumbnailRef) setSourceRect(thumbnailRef.getBoundingClientRect());
						setLightboxOpen(true);
					}}
				>
					<img
						ref={thumbnailRef}
						loading='lazy'
						decoding='async'
						alt={props.images[selected()]?.title}
						src={props.images[selected()]?.src}
						onError={(event) =>
							((event.currentTarget as HTMLImageElement).src =
								'/img/projects/fallback.png')
						}
						sizes='100vw'
						class='absolute w-full max-w-none h-full object-cover text-transparent scale-[1.02]'
					/>
				</button>
				<Dialog open={opened()} onOpenChange={setOpened}>
					<Dialog.Trigger
						as='div'
						tabIndex={-1}
						class='w-full! appearance-none cursor-pointer'
					>
						<Card
							aria-pressed={opened()}
							tabIndex={0}
							role='button'
							class='focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white'
							contentClass='group flex items-center'
							onClick={() => setOpened(!opened())}
						>
							<div class='flex flex-col items-start gap-1 overflow-hidden'>
								<span class='font-semibold text-white text-sm sm:text-base md:text-lg lg:text-xl truncate'>
									{props.images[selected()]?.title}
								</span>
								<span class='text-neutral-300 text-xs md:text-sm'>
									{props.images[selected()]?.subtitle}
								</span>
							</div>
							<div class='ml-auto group-hover:text-white transition-colors'>
								<ArrowUpDown size={24} />
							</div>
						</Card>
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Overlay class='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-175 ease-in-out data-expanded:opacity-100 data-closed:opacity-0' />
						<Dialog.Content
							class='top-1/2 left-1/2 fixed w-full max-w-xl -translate-x-1/2! -translate-y-1/2! transition-[opacity,transform] duration-175 ease-in-out data-expanded:opacity-100 data-expanded:scale-100 data-closed:opacity-0 data-closed:scale-95'
							onKeyDown={(event: KeyboardEvent) => {
								switch (event.key) {
									case 'ArrowDown':
										event.preventDefault();
										moveDown();
										event.stopPropagation();
										break;

									case 'ArrowUp':
										event.preventDefault();
										moveUp();
										event.stopPropagation();
										break;
									case 'Enter':
										if (!items().length) return;

										setOpened(false);
										setSelected(hovered());
										break;
								}
							}}
						>
							<div class='bg-neutral-900 shadow-lg mx-6 sm:mx-0 border border-neutral-700'>
								<input
									type='text'
									autofocus={false}
									placeholder='Search...'
									class='z-20 bg-transparent px-6 sm:px-7 py-3 sm:py-4 border-neutral-800 border-b outline-hidden w-full text-white placeholder:text-neutral-500 text-sm sm:text-base'
									onInput={(event) => setSearch(event.currentTarget.value)}
									value={search()}
								/>
								<div
									ref={listRef}
									class='z-0 relative flex flex-col px-3 sm:px-4 py-2 sm:py-3 w-full h-full max-h-80 overflow-auto'
								>
									<Show when={items().length !== 0}>
										<div
											class='z-10 absolute bg-white/10 transition-[top,width,height]'
											style={{
												width: `${highlightWidth()}px`,
												height: `${highlightHeight()}px`,
												top: `${highlightTop()}px`,
												'transition-duration': '250ms',
												'transition-timing-function': 'ease-in-out',
											}}
										/>
									</Show>
									<Show when={items().length === 0}>
										<div class='p-12 text-center'>
											No items found containing{' '}
											<b>'{search().toLowerCase()}'.</b>
										</div>
									</Show>
									<For each={items()}>
										{(image, index) => (
											<div
												class='z-10 relative flex items-center gap-3 p-1.5 sm:p-2 cursor-pointer'
												ref={(r) => {
													if (hovered() !== index()) return;

													highlightRef = r;

													if (initialMount) {
														initialMount = false;
														updateHighlight(r);
													}
												}}
												onClick={() => {
													setOpened(false);
													setSelected(index());
												}}
												onMouseLeave={() => setLocked(false)}
												onMouseEnter={() => {
													if (!locked()) {
														setHovered(index());
													}
												}}
											>
												<div class='relative bg-neutral-900 w-24 sm:w-32 h-13.5 sm:h-18 overflow-hidden'>
													<img
														alt={`Media ${image.src}`}
														loading='lazy'
														decoding='async'
														onError={(event) =>
															((
																event.currentTarget as HTMLImageElement
															).src = '/img/projects/fallback.png')
														}
														src={image.src}
														class='shadow-none border-none outline-hidden max-w-none object-cover scale-[1.02]'
														style={{
															position: 'absolute',
															height: '100%',
															width: '100%',
															inset: '0',
															color: 'transparent',
														}}
													/>
												</div>
												<div class='flex-1'>
													<div class='font-medium text-white sm:text-md text-sm'>
														{image.title}
													</div>
													<div class='text-neutral-500 text-xs'>
														{image.subtitle}
													</div>
												</div>
											</div>
										)}
									</For>
								</div>
								<Show when={footer().enabled ?? true}>
									<div class='flex justify-between items-center px-6 sm:px-7 py-3 sm:py-4 border-neutral-800 border-t w-full'>
										<Show when={footer().subtitle}>
											<div class='font-medium text-neutral-500 text-xs sm:text-sm'>
												{footer().subtitle}
											</div>
										</Show>
										<Show when={footer().hint ?? true}>
											<div class='flex items-center gap-2 font-medium text-white text-xs sm:text-sm'>
												View Media
												<div class='flex justify-center items-center bg-white/5 px-2 pt-1 text-xs'>
													&#x21B5;
												</div>
											</div>
										</Show>
									</div>
								</Show>
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog>
				<Lightbox
					images={props.images}
					index={() => selected()}
					open={() => lightboxOpen()}
					onOpenChange={setLightboxOpen}
					onIndexChange={setSelected}
					sourceRect={() => sourceRect()}
				/>
			</Show>
		</>
	);
}

export default Media;
