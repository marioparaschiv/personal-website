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
	lastX: number;
	lastY: number;
	lastTime: number;
	velocityX: number;
	velocityY: number;
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

// Apple's scroll deceleration projection, so a flicked pan glides to where the throw was heading.
function project(velocity: number, rate = 0.998) {
	return ((velocity / 1000) * rate) / (1 - rate);
}

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
			if (a === x && pan) continue;
			if (a === y && pan) continue;

			const force = -STIFFNESS * (a.value - a.target) - DAMPING * a.velocity;

			a.velocity += force * dt;
			a.value += a.velocity * dt;

			if (Math.abs(a.value - a.target) > 0.001 || Math.abs(a.velocity) > 0.01) {
				resting = false;
			} else {
				a.value = a.target;
				a.velocity = 0;
			}
		}

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

	function bounds(s: number) {
		const rect = frame()?.getBoundingClientRect();

		return {
			x: rect ? ((s - 1) * rect.width) / 2 : 0,
			y: rect ? ((s - 1) * rect.height) / 2 : 0,
		};
	}

	function setTargets(s: number, tx: number, ty: number) {
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
			originX: x.value,
			originY: y.value,
			lastX: event.clientX,
			lastY: event.clientY,
			lastTime: event.timeStamp,
			velocityX: 0,
			velocityY: 0,
			moved: false,
		};

		x.velocity = 0;
		y.velocity = 0;
	}

	function onPointerMove(event: PointerEvent) {
		if (!pan || event.pointerId !== pan.pointerId) return;

		const dx = event.clientX - pan.startX;
		const dy = event.clientY - pan.startY;

		if (!pan.moved && Math.hypot(dx, dy) < CLICK_SLOP) return;
		if (!zoomed()) return;

		pan.moved = true;
		setPanning(true);

		const dt = Math.max(event.timeStamp - pan.lastTime, 1);

		pan.velocityX = ((event.clientX - pan.lastX) / dt) * 1000;
		pan.velocityY = ((event.clientY - pan.lastY) / dt) * 1000;
		pan.lastX = event.clientX;
		pan.lastY = event.clientY;
		pan.lastTime = event.timeStamp;

		// Past the edge the image follows at a third of the pointer, so the limit feels like friction.
		const limit = bounds(scale.target);
		const rubber = (value: number, max: number) =>
			value > max ? max + (value - max) / 3 : value < -max ? -max + (value + max) / 3 : value;

		x.value = x.target = rubber(pan.originX + dx, limit.x);
		y.value = y.target = rubber(pan.originY + dy, limit.y);
		render();
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

		x.velocity = released.velocityX;
		y.velocity = released.velocityY;
		setTargets(
			scale.target,
			x.value + project(released.velocityX),
			y.value + project(released.velocityY),
		);
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
