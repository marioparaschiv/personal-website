import { animated, easings, useSpringValue, useTransition } from '@react-spring/web';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpDown } from 'lucide-react';

import Card from '~/components/card';

interface Image {
	src: string;
	title: string;
	subtitle: string;
}

interface MediaProps extends React.ComponentProps<typeof Dialog.Root> {
	onSelect?: (index: number) => void;
	images: Image[];
	footer?: {
		enabled?: boolean;
		hint?: boolean;
		subtitle?: string;
	};
}

function Media({ images, footer = {}, ...props }: MediaProps) {
	if (!images.length) return null;

	const [opened, setOpened] = useState(false);
	const [locked, setLocked] = useState(false);
	const [selected, setSelected] = useState(0);
	const [hovered, setHovered] = useState(0);
	const [search, setSearch] = useState('');

	const listRef = useRef<HTMLDivElement | null>(null);
	const ref = useRef<HTMLDivElement | null>(null);

	const animation = {
		left: useSpringValue(0),
		top: useSpringValue(0),
		width: useSpringValue(0),
		height: useSpringValue(0),
	};

	const transitions = useTransition(opened, {
		from: {
			opacity: 0,
			scale: 0.95,
		},
		enter: {
			opacity: 1,
			scale: 1,
		},
		leave: {
			opacity: 0,
			scale: 0.95,
		},
		config: {
			easing: easings.easeInOutQuad,
			duration: 175,
		},
	});

	const items = useMemo(() => {
		const result: typeof images = [];

		for (let i = 0; images.length > i; i++) {
			const image = images[i];
			const searchable = [image.title, image.subtitle];

			if (searchable.some((s) => s.toLowerCase().includes(search.toLowerCase()))) {
				result.push(images[i]);
			}
		}

		return result;
	}, [search]);

	// Out of bounds check
	useEffect(() => {
		if (items.length - 1 < hovered) {
			setHovered(0);
		}
	}, [search, hovered]);

	const animateProperties = useCallback((target?: HTMLElement, immediate: boolean = false) => {
		if (!target) return;

		const rect = target.getBoundingClientRect();

		animation.top[immediate ? 'set' : 'start'](target.offsetTop, {
			config: {
				duration: 250,
				easing: easings.easeInOutQuad,
			},
		});

		animation.width[immediate ? 'set' : 'start'](rect.width, {
			config: {
				duration: 150,
				easing: easings.easeInOutQuad,
			},
		});

		animation.height[immediate ? 'set' : 'start'](rect.height, {
			config: {
				duration: 150,
				easing: easings.easeInOutQuad,
			},
		});
	}, []);

	const scrollToIndex = useCallback(
		(index: number) => {
			if (!listRef.current) {
				return;
			}

			// Account for the highlight element
			const child = index + 1;

			// const hasHorizontalScrollbar = listRef.current.scrollWidth > listRef.current.clientWidth;
			const hasVerticalScrollbar =
				listRef.current.scrollHeight > listRef.current.clientHeight;

			if (hasVerticalScrollbar) {
				listRef.current.children[child]?.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		},
		[listRef],
	);

	const changeIndex = useCallback(
		(index: number) => {
			setHovered(index);
			scrollToIndex(index);
		},
		[items],
	);

	useEffect(() => {
		if (!ref.current) return;
		animateProperties(ref.current);
	}, [opened, ref.current, hovered]);

	const moveDown = useCallback(() => {
		setLocked(true);
		changeIndex(hovered < items.length - 1 ? hovered + 1 : 0);
	}, [hovered]);

	const moveUp = useCallback(() => {
		setLocked(true);
		changeIndex(hovered > 0 ? hovered - 1 : items.length - 1);
	}, [hovered]);

	useEffect(() => {
		function onResize() {
			if (!ref.current) return;

			const target = ref.current;

			if (target) {
				animateProperties(target, true);
				scrollToIndex(hovered);
			}
		}

		window.addEventListener('resize', onResize);

		return () => window.removeEventListener('resize', onResize);
	}, []);

	return (
		<>
			<a
				className='group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white relative flex justify-center items-center border-neutral-800 bg-neutral-900 border rounded-xl lg:rounded-3xl overflow-hidden aspect-[16/9]'
				href={images[selected].src}
			>
				<img
					loading='lazy'
					decoding='async'
					alt={images[selected].title}
					src={images[selected].src}
					onError={(event) =>
						((event.target as HTMLImageElement).src = '/img/projects/fallback.png')
					}
					sizes='100vw'
					className='absolute w-full max-w-none h-full text-transparent object-cover scale-[1.02]'
				/>
			</a>
			<Dialog.Root open={opened} onOpenChange={setOpened} {...props}>
				<Dialog.Trigger tabIndex={-1} className='appearance-none ![all:unset]'>
					<Card
						aria-pressed={opened}
						tabIndex={0}
						role='button'
						className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
						contentClassName='group flex items-center'
						onClick={() => setOpened(!opened)}
					>
						<div className='flex flex-col gap-1 overflow-hidden'>
							<span className='font-semibold text-sm text-white sm:text-base md:text-lg lg:text-xl truncate'>
								{images[selected].title}
							</span>
							<span className='text-neutral-300 text-xs md:text-sm'>
								{images[selected].subtitle}
							</span>
						</div>
						<div className='group-hover:text-white ml-auto transition-colors'>
							<ArrowUpDown size={24} />
						</div>
					</Card>
				</Dialog.Trigger>
				{transitions((styles, item) =>
					item ? (
						<Dialog.Portal>
							<Dialog.Overlay asChild forceMount>
								<animated.div
									style={{ opacity: styles.opacity }}
									className='fixed inset-0 bg-black/50 backdrop-blur-sm'
								/>
							</Dialog.Overlay>
							<Dialog.Content asChild forceMount>
								<animated.div
									style={{ opacity: styles.opacity, scale: styles.scale }}
									className='top-1/2 left-1/2 fixed w-full max-w-xl !-translate-x-1/2 !-translate-y-1/2'
									onKeyDown={(event) => {
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
												if (!items.length) return;

												setOpened(false);
												setSelected(hovered);
												break;
										}
									}}
								>
									<div className='border-neutral-700 bg-neutral-900 shadow-lg mx-6 sm:mx-0 border rounded-2xl'>
										<input
											type='text'
											autoFocus={false}
											placeholder='Search...'
											className='z-20 border-neutral-800 bg-transparent px-6 sm:px-7 py-3 sm:py-4 border-b w-full text-sm text-white placeholder:text-neutral-500 sm:text-base outline-none'
											onChange={(event) => setSearch(event.target.value)}
											value={search}
										/>
										<div
											ref={listRef}
											className='relative z-0 flex flex-col px-3 sm:px-4 py-2 sm:py-3 w-full h-full max-h-80 overflow-auto'
										>
											{/* Highlight */}
											{items.length !== 0 && (
												<animated.div
													className='z-10 absolute bg-white/10 rounded-lg sm:rounded-xl w-full h-[87.5px]'
													style={{
														width: animation.width,
														height: animation.height,
														top: animation.top,
													}}
												/>
											)}
											{items.length === 0 && (
												<div className='p-12 text-center'>
													No items found containing{' '}
													<b>'{search.toLowerCase()}'.</b>
												</div>
											)}
											{items.map((image, index) => (
												<div
													key={image.src + index}
													className='relative z-10 flex items-center gap-3 p-1.5 sm:p-2 cursor-pointer'
													ref={function (r) {
														if (hovered === index) {
															ref.current = r;
														} else {
															return null;
														}
													}}
													onClick={() => {
														setOpened(false);
														setSelected(index);
													}}
													onMouseLeave={() => setLocked(false)}
													onMouseEnter={() => {
														if (!locked) {
															setHovered(index);
														}
													}}
												>
													<div className='relative bg-neutral-900 rounded-md w-24 sm:w-32 h-[54px] sm:h-[72px] overflow-hidden'>
														<img
															alt={`Media ${image.src}`}
															loading='lazy'
															decoding='async'
															onError={(event) =>
																((
																	event.target as HTMLImageElement
																).src =
																	'/img/projects/fallback.png')
															}
															src={image.src}
															className='shadow-none border-none max-w-none object-cover outline-none scale-[1.02]'
															style={{
																position: 'absolute',
																height: '100%',
																width: '100%',
																inset: 0,
																color: 'transparent',
															}}
														></img>
													</div>
													<div className='flex-1'>
														<div className='font-medium text-sm text-white sm:text-md'>
															{image.title}
														</div>
														<div className='text-neutral-500 text-xs'>
															{image.subtitle}
														</div>
													</div>
												</div>
											))}
										</div>
										{(footer.enabled ?? true) && (
											<div className='flex justify-between items-center border-neutral-800 px-6 sm:px-7 py-3 sm:py-4 border-t w-full'>
												{footer.subtitle && (
													<div className='font-medium text-neutral-500 text-xs sm:text-sm'>
														{footer.subtitle}
													</div>
												)}
												{(footer.hint ?? true) && (
													<div className='flex items-center gap-2 font-medium text-white text-xs sm:text-sm'>
														View Media
														<div className='flex justify-center items-center bg-white/5 px-2 pt-1 rounded-md text-xs'>
															↵
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								</animated.div>
							</Dialog.Content>
						</Dialog.Portal>
					) : null,
				)}
			</Dialog.Root>
		</>
	);
}

export default Media;
