import { createSignal, onCleanup } from 'solid-js';

type Axis = {
	value: number;
	target: number;
	velocity: number;
};

type Pan = {
	pointerId: number;
	startX: number;
	startY: number;
	originX: number;
	originY: number;
	moved: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const CLICK_SCALE = 2.5;
const CLICK_SLOP = 4;

// Critically damped (ratio 1) with a 0.35s response: settles without overshoot, keeps velocity on retarget.
const RESPONSE = 0.35;
const STIFFNESS = ((2 * Math.PI) / RESPONSE) ** 2;
const DAMPING = 2 * Math.sqrt(STIFFNESS);

// While dragging, the image trails the pointer on a much tighter spring: enough to smooth out
// jitter, quick enough that it lands exactly where it was let go with no drift.
const PAN_RESPONSE = 0.09;
const PAN_STIFFNESS = ((2 * Math.PI) / PAN_RESPONSE) ** 2;
const PAN_DAMPING = 2 * Math.sqrt(PAN_STIFFNESS);
const SUBSTEP = 1 / 240;

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function axis(value: number): Axis {
	return { value, target: value, velocity: 0 };
}

/**
 * Spring zoom and pan for one image inside a fixed frame: click toggles zoom at the cursor, the
 * wheel zooms around the cursor, and a drag pans while zoomed.
 */
function createZoom(frame: () => HTMLElement | undefined, image: () => HTMLElement | undefined) {
	const scale = axis(1);
	const x = axis(0);
	const y = axis(0);
	const axes = [scale, x, y];

	const [zoomed, setZoomed] = createSignal(false);
	const [panning, setPanning] = createSignal(false);

	let frameId = 0;
	let lastTick = 0;
	let pan: Pan | undefined;
	let settling = false;

	const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function render() {
		const el = image();

		if (el) el.style.transform = `translate(${x.value}px, ${y.value}px) scale(${scale.value})`;
	}

	function tick(now: number) {
		const dt = Math.min((now - lastTick) / 1000, 1 / 30);
		let resting = true;

		lastTick = now;

		for (const a of axes) {
			const tight = a !== scale && (pan?.moved || settling);
			const stiffness = tight ? PAN_STIFFNESS : STIFFNESS;
			const damping = tight ? PAN_DAMPING : DAMPING;
			// Fixed small substeps keep the stiff drag spring stable when a frame arrives late.
			for (let left = dt; left > 0; left -= SUBSTEP) {
				const step = Math.min(left, SUBSTEP);
				const force = -stiffness * (a.value - a.target) - damping * a.velocity;

				a.velocity += force * step;
				a.value += a.velocity * step;
			}

			if (Math.abs(a.value - a.target) > 0.001 || Math.abs(a.velocity) > 0.01) {
				resting = false;
			} else {
				a.value = a.target;
				a.velocity = 0;
			}
		}

		if (resting) settling = false;

		render();
		frameId = resting && !pan ? 0 : requestAnimationFrame(tick);
	}

	function start() {
		if (reduced()) {
			for (const a of axes) {
				a.value = a.target;
				a.velocity = 0;
			}

			render();

			return;
		}

		if (frameId) return;

		lastTick = performance.now();
		frameId = requestAnimationFrame(tick);
	}

	// The zoomed image spills past its frame to fill the screen, so panning stops when an image edge
	// reaches the viewport edge rather than the frame edge.
	function bounds(s: number) {
		const rect = frame()?.getBoundingClientRect();

		if (!rect) return { x: 0, y: 0 };

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const halfWidth = (rect.width * s) / 2;
		const halfHeight = (rect.height * s) / 2;

		return {
			x: Math.max(0, halfWidth - Math.min(centerX, window.innerWidth - centerX)),
			y: Math.max(0, halfHeight - Math.min(centerY, window.innerHeight - centerY)),
		};
	}

	function setTargets(s: number, tx: number, ty: number) {
		settling = false;

		const next = clamp(s, MIN_SCALE, MAX_SCALE);
		const limit = bounds(next);

		scale.target = next;
		x.target = clamp(tx, -limit.x, limit.x);
		y.target = clamp(ty, -limit.y, limit.y);
		setZoomed(next > 1.01);
		start();
	}

	// Keeps the point under the cursor fixed while the scale changes.
	function zoomAt(clientX: number, clientY: number, nextScale: number) {
		const rect = frame()?.getBoundingClientRect();

		if (!rect) return;

		const px = clientX - (rect.left + rect.width / 2);
		const py = clientY - (rect.top + rect.height / 2);
		const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
		const ratio = s / scale.target;

		setTargets(s, px - (px - x.target) * ratio, py - (py - y.target) * ratio);
	}

	function reset(instant = false) {
		pan = undefined;
		setPanning(false);
		setTargets(1, 0, 0);

		if (instant) {
			for (const a of axes) {
				a.value = a.target;
				a.velocity = 0;
			}

			render();
		}
	}

	function onWheel(event: WheelEvent) {
		event.preventDefault();

		const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;

		zoomAt(event.clientX, event.clientY, scale.target * Math.exp(-delta * 0.0025));
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || pan) return;

		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

		pan = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: x.target,
			originY: y.target,
			moved: false,
		};
	}

	function onPointerMove(event: PointerEvent) {
		if (!pan || event.pointerId !== pan.pointerId) return;

		const dx = event.clientX - pan.startX;
		const dy = event.clientY - pan.startY;

		if (!pan.moved && Math.hypot(dx, dy) < CLICK_SLOP) return;
		if (!zoomed()) return;

		pan.moved = true;
		setPanning(true);

		// Past the edge the image follows at a third of the pointer, so the limit feels like friction.
		const limit = bounds(scale.target);
		const rubber = (value: number, max: number) =>
			value > max ? max + (value - max) / 3 : value < -max ? -max + (value + max) / 3 : value;

		x.target = rubber(pan.originX + dx, limit.x);
		y.target = rubber(pan.originY + dy, limit.y);
		start();
	}

	function onPointerUp(event: PointerEvent) {
		if (!pan || event.pointerId !== pan.pointerId) return;

		const released = pan;

		pan = undefined;
		setPanning(false);

		if (!released.moved) {
			if (zoomed()) reset();
			else zoomAt(event.clientX, event.clientY, CLICK_SCALE);

			return;
		}

		// No momentum: the image settles where it was let go on the drag spring, and only an
		// over-dragged edge springs back on the softer one.
		const releasedX = x.target;
		const releasedY = y.target;

		setTargets(scale.target, releasedX, releasedY);
		settling = x.target === releasedX && y.target === releasedY;
	}

	const cursor = () => (panning() ? 'grabbing' : zoomed() ? 'grab' : 'zoom-in');

	onCleanup(() => cancelAnimationFrame(frameId));

	return {
		zoomed,
		cursor,
		reset,
		handlers: {
			onWheel,
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: onPointerUp,
		},
	};
}

export default createZoom;
