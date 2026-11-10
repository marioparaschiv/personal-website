import { createEffect, createSignal, For, on, onCleanup, onMount } from 'solid-js';

import { usePrefersReducedMotion } from '~/components/hooks/use-media-query';
import useBreakpoint from '~/components/hooks/use-breakpoint';
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

// On desktop the covers grow and neighbours sit mostly behind the focused one, peeking out just
// enough to hint at more. Phones keep the wider fan, where a tight stack shows slivers of tilt.
const DESKTOP_SPREAD = 0.28;

// Wide stages leave room beside the height-capped cover, so neighbours spread out into it.
const DESKTOP_SPREAD_MAX = 0.42;

const PERSPECTIVE = 1600;

// Headroom kept between a tilted neighbour's lifted corner and the focused cover's edge.
const FAN_MARGIN = 0.8;

const WHEEL_STEP = 60;

// Drag distance per item as a share of the cover width, kept apart from `spread` so a tighter
// stack doesn't make dragging twitchy.
const DRAG_UNIT = 0.6;

// Lets the section fade in before the hint plays; the length matches the `hint-intro` animation.
const INTRO_DELAY_MS = 500;
const INTRO_MS = 1600;

// Once per visit, so returning from a project doesn't replay it.
let introPlayed = false;

function AlbumRail(props: AlbumRailProps) {
	const reducedMotion = usePrefersReducedMotion();
	const desktop = useBreakpoint('md');
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
	const [introStart, setIntroStart] = createSignal<number>();
	const [pointerHint, setPointerHint] = createSignal(false);

	// The hover hint waits for a real mouse move. Otherwise a cover that slides or snaps under a
	// resting cursor, or a touch that leaves sticky hover behind, flashes the hint on every pass.
	createEffect(on(motion.index, () => setPointerHint(false), { defer: true }));

	createEffect(() => {
		if (!onScreen()) setPointerHint(false);
	});

	function onStagePointerMove(event: PointerEvent) {
		if (event.pointerType === 'mouse' && !motion.dragging()) setPointerHint(true);
	}

	// The first time the rail is seen, the focused cover shows its hint unprompted, then leaves it to
	// hover. It runs on one clock, so changing slides mid-intro carries it over rather than replaying it.
	createEffect(() => {
		if (introPlayed || !onScreen()) return;

		introPlayed = true;

		const start = setTimeout(() => setIntroStart(performance.now()), INTRO_DELAY_MS);
		const end = setTimeout(() => setIntroStart(undefined), INTRO_DELAY_MS + INTRO_MS);

		onCleanup(() => {
			clearTimeout(start);
			clearTimeout(end);
		});
	});

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
		spread: desktop()
			? clamp(
					(DESKTOP_SPREAD * stage().width) / coverWidth() / 1.25,
					DESKTOP_SPREAD,
					DESKTOP_SPREAD_MAX,
				)
			: SHAPE.spread,
		fan: desktop() ? Math.min(SHAPE.fan, fanRoom()) : 0,
		visible: desktop() ? 1 : Math.max(1, Math.min(3, Math.floor((count() - 1) / 2))),
	});

	const coverWidth = () =>
		desktop()
			? Math.min(stage().width * 0.8, stage().height * 0.92 * aspect(), 1280)
			: Math.min(stage().width * 0.8, stage().height * 0.88 * aspect(), 1280);

	const coverHeight = () => coverWidth() / aspect();

	// The largest tilt, in degrees, that keeps a neighbour's inner corners hidden behind the
	// focused cover. A neighbour sits deeper and so renders shorter; tilting it lifts its inner
	// corners by half its width times sin(fan), and past that height gap they poke out as
	// triangles. Big covers sit deeper in perspective, so they get room for more tilt.
	function fanRoom() {
		const innerDepth =
			coverWidth() * (SHAPE.depth - 0.5 * Math.sin((SHAPE.turn * Math.PI) / 180));
		const scale = PERSPECTIVE / (PERSPECTIVE + innerDepth);
		const lift = clamp(((1 - scale) / aspect()) * FAN_MARGIN, 0, 1);

		return (Math.asin(lift) * 180) / Math.PI;
	}

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

		motion.dragStart(event.clientX, event.clientY, unit);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	}

	function onPointerMove(event: PointerEvent) {
		motion.dragMove(event.clientX, event.clientY);
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
				style={{ perspective: `${PERSPECTIVE}px` }}
				onPointerDown={(event) => startDrag(event, coverWidth() * DRAG_UNIT)}
				onPointerMove={onStagePointerMove}
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
								hint={pointerHint()}
								introStart={index() === motion.index() ? introStart() : undefined}
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
