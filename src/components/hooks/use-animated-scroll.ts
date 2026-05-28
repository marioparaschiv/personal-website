import { onCleanup } from 'solid-js';

interface SpringConfig {
	tension?: number;
	friction?: number;
}

interface UseAnimatedScrollOptions {
	container: () => HTMLElement;
	springConfig?: SpringConfig;
	onFrame?: (value: number) => void;
}

function useAnimatedScroll({
	container: getContainer,
	springConfig = { tension: 170, friction: 26 },
	onFrame,
}: UseAnimatedScrollOptions) {
	const tension = springConfig.tension ?? 170;
	const friction = springConfig.friction ?? 26;

	let position = 0;
	let velocity = 0;
	let target = 0;
	let animating = false;
	let rafId = 0;
	let lastTime = 0;

	function step(now: number) {
		if (!animating) return;

		const container = getContainer();
		const dt = Math.min((now - lastTime) / 1000, 0.064);
		lastTime = now;

		const acceleration = -tension * (position - target) - friction * velocity;
		velocity += acceleration * dt;
		position += velocity * dt;

		container.scrollTop = position;
		onFrame?.(position);

		const idle = Math.abs(position - target) < 0.5 && Math.abs(velocity) < 0.5;
		if (idle) {
			position = target;
			velocity = 0;
			animating = false;
			container.scrollTop = position;
			onFrame?.(position);
			return;
		}

		rafId = requestAnimationFrame(step);
	}

	function scrollTo(dest: number) {
		const current = getContainer().scrollTop;
		if (Math.abs(current - dest) < 2) return;

		position = current;
		velocity = 0;
		target = dest;
		animating = true;

		cancelAnimationFrame(rafId);
		lastTime = performance.now();
		rafId = requestAnimationFrame(step);
	}

	function stop() {
		cancelAnimationFrame(rafId);
		animating = false;
		velocity = 0;
	}

	function set(value: number) {
		stop();
		position = value;
		target = value;
	}

	onCleanup(() => cancelAnimationFrame(rafId));

	return {
		scrollTo,
		getValue: () => position,
		isIdle: () => !animating,
		isAnimating: () => animating,
		stop,
		set,
	};
}

export type { SpringConfig };
export default useAnimatedScroll;
