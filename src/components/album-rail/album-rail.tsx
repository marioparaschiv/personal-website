import { createSignal, For, onCleanup, onMount } from 'solid-js';

import { usePrefersReducedMotion } from '~/components/hooks/use-media-query';
import { cn } from '~/utils';

import { clamp, type RailShape, slotLayout, slotOffset } from './layout';
import { createRailMotion } from './create-rail-motion';
import { type AlbumRailItem, Sleeve } from './sleeve';
import Ruler from './ruler';

type AlbumRailProps = {
	items: AlbumRailItem[];
	startIndex?: number;
	aspect?: number;
	interval?: number;
	class?: string;
	onSelect: (item: AlbumRailItem, index: number) => void;
};

type StageSize = {
	width: number;
	height: number;
};

const SHAPE: Omit<RailShape, 'visible'> = {
	spread: 0.58,
	stack: 0.5,
	fan: 6,
	turn: 22,
	depth: 0.5,
	dim: 0.45,
};

const WHEEL_STEP = 60;

function AlbumRail(props: AlbumRailProps) {
	const reducedMotion = usePrefersReducedMotion();
	const count = () => props.items.length;
	const aspect = () => props.aspect ?? 16 / 9;

	const motion = createRailMotion({
		count,
		loop: true,
		startIndex: props.startIndex ?? 0,
		reducedMotion,
	});

	const [stage, setStage] = createSignal<StageSize>({ width: 0, height: 0 });
	const [hoveringRail, setHoveringRail] = createSignal(false);
	const [onScreen, setOnScreen] = createSignal(false);

	let rootRef!: HTMLDivElement;
	let stageRef!: HTMLDivElement;
	let wheelDelta = 0;
	let wheelLocked = false;
	let lastActivity = performance.now();

	function markActivity() {
		lastActivity = performance.now();
	}

	// Autoplay only steps once the user has left the rail alone for a full interval, and never
	// while they are hovering, dragging, focused inside it or a step of theirs is still settling.
	function autoplayTick() {
		const interval = (props.interval ?? 5) * 1000;
		const moving = Math.abs(motion.position() - Math.round(motion.position())) > 0.001;

		const busy =
			!onScreen() ||
			hoveringRail() ||
			motion.dragging() ||
			moving ||
			rootRef.querySelector(':focus-visible') !== null;

		if (interval === 0 || busy) {
			if (busy) markActivity();

			return;
		}

		if (performance.now() - lastActivity < interval) return;

		motion.step(1);
		markActivity();
	}

	const shape = (): RailShape => ({
		...SHAPE,
		visible: Math.max(1, Math.min(3, Math.floor((count() - 1) / 2))),
	});

	const coverWidth = () => Math.min(stage().width * 0.58, stage().height * 0.88 * aspect(), 1280);

	const coverHeight = () => coverWidth() / aspect();

	function select(index: number) {
		if (motion.consumeClick()) return;

		if (index !== motion.index()) {
			motion.goTo(index);

			return;
		}

		props.onSelect(props.items[index], index);
	}

	// `unit` is how many pixels of drag move the rail by one item, so each surface tracks the finger.
	function startDrag(event: PointerEvent, unit: number) {
		if (event.button !== 0) return;

		motion.dragStart(event.clientX, unit);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	}

	function onPointerMove(event: PointerEvent) {
		motion.dragMove(event.clientX);
	}

	function onPointerUp() {
		motion.dragEnd();
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointercancel', onPointerUp);
	}

	// Only horizontal swipes drive the rail so vertical wheel still scrolls between page sections.
	function onWheel(event: WheelEvent) {
		if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

		event.preventDefault();
		markActivity();

		if (wheelLocked) return;

		wheelDelta += event.deltaX;

		if (Math.abs(wheelDelta) < WHEEL_STEP) return;

		motion.step(Math.sign(wheelDelta));
		wheelDelta = 0;
		wheelLocked = true;
		setTimeout(() => (wheelLocked = false), 350);
	}

	function onKeyDown(event: KeyboardEvent) {
		if (!onScreen()) return;

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			markActivity();
			motion.step(-1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			markActivity();
			motion.step(1);
		}
	}

	onMount(() => {
		const resize = new ResizeObserver(([entry]) => {
			setStage({ width: entry.contentRect.width, height: entry.contentRect.height });
		});

		const visibility = new IntersectionObserver(
			([entry]) => setOnScreen(entry.isIntersecting),
			{
				threshold: 0.5,
			},
		);

		resize.observe(stageRef);
		visibility.observe(rootRef);
		stageRef.addEventListener('wheel', onWheel, { passive: false });
		document.addEventListener('keydown', onKeyDown);

		const autoplay = setInterval(autoplayTick, 250);

		onCleanup(() => {
			resize.disconnect();
			visibility.disconnect();
			clearInterval(autoplay);
			stageRef.removeEventListener('wheel', onWheel);
			document.removeEventListener('keydown', onKeyDown);
			onPointerUp();
		});
	});

	return (
		<div
			ref={(el) => (rootRef = el)}
			role='region'
			aria-roledescription='carousel'
			aria-label='Featured projects. Use the arrow keys or swipe to browse.'
			class={cn('relative flex flex-col items-center w-full h-full select-none', props.class)}
			onPointerEnter={() => setHoveringRail(true)}
			onPointerLeave={() => {
				setHoveringRail(false);
				markActivity();
			}}
			onPointerDown={markActivity}
		>
			<div
				ref={(el) => (stageRef = el)}
				class={cn(
					'relative w-full min-h-0 grow touch-pan-y',
					motion.dragging() ? 'cursor-grabbing' : 'cursor-grab',
				)}
				style={{ perspective: '1600px' }}
				onPointerDown={(event) => startDrag(event, coverWidth() * SHAPE.spread)}
			>
				<For each={props.items}>
					{(item, index) => {
						const offset = () => slotOffset(index(), motion.position(), count(), true);

						return (
							<Sleeve
								item={item}
								layout={slotLayout(offset(), coverWidth(), shape())}
								width={coverWidth()}
								height={coverHeight()}
								focused={index() === motion.index()}
								onClick={() => select(index())}
							/>
						);
					}}
				</For>
			</div>

			<div aria-live='polite' class='relative mt-10 w-full h-16 overflow-hidden'>
				<For each={props.items}>
					{(item, index) => {
						const offset = () => slotOffset(index(), motion.position(), count(), true);

						return (
							<div
								aria-hidden={index() !== motion.index()}
								class='top-0 left-1/2 absolute flex flex-col items-center gap-1.5 w-max'
								style={{
									transform: `translateX(calc(-50% + ${offset() * 240}px))`,
									opacity: clamp(1 - Math.abs(offset()) * 1.6, 0, 1),
								}}
							>
								<span class='font-semibold text-white text-2xl tracking-tight'>
									{item.title}
								</span>
								<span class='font-light text-neutral-400 text-xs uppercase tracking-widest'>
									{item.subtitle}
								</span>
							</div>
						);
					}}
				</For>
			</div>

			<div class='mt-4'>
				<Ruler
					position={motion.position()}
					count={count()}
					loop
					dragging={motion.dragging()}
					selectLabel={`Open ${props.items[motion.index()]?.title}`}
					onDragStart={startDrag}
					onGoTo={(index) => {
						if (!motion.consumeClick()) motion.goTo(index);
					}}
					onStep={motion.step}
					onSelect={() => {
						if (motion.consumeClick()) return;

						props.onSelect(props.items[motion.index()], motion.index());
					}}
				/>
			</div>
		</div>
	);
}

export { type AlbumRailItem };
export default AlbumRail;
