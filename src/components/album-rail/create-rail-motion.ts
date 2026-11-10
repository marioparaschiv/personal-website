import { createMemo, createSignal, onCleanup } from 'solid-js';

import { swipeAxis } from '~/utils';

import { clamp, slotOffset } from './layout';

type RailMotionOptions = {
	count: () => number;
	loop: boolean;
	startIndex: number;
	reducedMotion: () => boolean;
};

type DragState = {
	startX: number;
	startY: number;
	startPosition: number;
	unit: number;
	lastX: number;
	lastTime: number;
	velocity: number;
	moved: boolean;
};

const POSITION_RATE = 9;

function approach(current: number, target: number, rate: number, dt: number) {
	return current + (target - current) * (1 - Math.exp(-rate * dt));
}

function createRailMotion(options: RailMotionOptions) {
	const [position, setPosition] = createSignal(options.startIndex);
	const [dragging, setDragging] = createSignal(false);

	let target = options.startIndex;
	let frame = 0;
	let lastFrame = 0;
	let drag: DragState | undefined;
	let suppressClick = false;

	function bound(value: number) {
		if (options.loop) return value;

		return clamp(value, 0, Math.max(options.count() - 1, 0));
	}

	const index = createMemo(() => {
		const count = options.count();
		const rounded = Math.round(position());

		return ((rounded % count) + count) % count;
	});

	function tick(time: number) {
		const dt = Math.min((time - lastFrame) / 1000, 0.05);
		const instant = options.reducedMotion();

		lastFrame = time;

		if (!drag) {
			setPosition((current) =>
				instant ? target : approach(current, target, POSITION_RATE, dt),
			);
		}

		if (!drag && Math.abs(position() - target) < 0.0005) {
			setPosition(target);
			frame = 0;

			return;
		}

		frame = requestAnimationFrame(tick);
	}

	function wake() {
		if (frame) return;

		lastFrame = performance.now();
		frame = requestAnimationFrame(tick);
	}

	function goTo(next: number) {
		target = bound(target + slotOffset(next, target, options.count(), options.loop));
		wake();
	}

	function step(direction: number) {
		target = bound(Math.round(target) + direction);
		wake();
	}

	function dragStart(clientX: number, clientY: number, unit: number) {
		suppressClick = false;
		drag = {
			startX: clientX,
			startY: clientY,
			startPosition: position(),
			unit,
			lastX: clientX,
			lastTime: performance.now(),
			velocity: 0,
			moved: false,
		};
	}

	function dragMove(clientX: number, clientY: number) {
		if (!drag) return;

		const now = performance.now();
		const delta = clientX - drag.startX;

		if (!drag.moved) {
			const axis = swipeAxis(delta, drag.startY - clientY);

			if (axis === null) return;

			// A vertical swipe belongs to the page's section snap, so the rail lets the whole gesture go.
			if (axis === 'y') {
				drag = undefined;

				return;
			}

			drag.moved = true;
			setDragging(true);
		}

		const elapsed = Math.max(now - drag.lastTime, 1);
		const instantVelocity = (drag.lastX - clientX) / drag.unit / (elapsed / 1000);

		drag.velocity = drag.velocity * 0.6 + instantVelocity * 0.4;
		drag.lastX = clientX;
		drag.lastTime = now;

		setPosition(bound(drag.startPosition - delta / drag.unit));
		wake();
	}

	function dragEnd() {
		if (!drag) return;

		if (drag.moved) {
			suppressClick = true;
			target = bound(Math.round(position() + clamp(drag.velocity * 0.18, -2, 2)));
		}

		drag = undefined;
		setDragging(false);
		wake();
	}

	// A drag ends with a click on whatever sits under the pointer; swallow that one.
	function consumeClick() {
		const suppressed = suppressClick;

		suppressClick = false;

		return suppressed;
	}

	onCleanup(() => cancelAnimationFrame(frame));

	return {
		position,
		dragging,
		index,
		goTo,
		step,
		dragStart,
		dragMove,
		dragEnd,
		consumeClick,
	};
}

type RailMotion = ReturnType<typeof createRailMotion>;

export { type RailMotion, createRailMotion };
