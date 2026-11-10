import { onCleanup, onMount } from 'solid-js';

import { usePrefersReducedMotion } from './use-media-query';

/**
 * Per-frame counterpart to `useAmbientLoop` for continuous motion. Hands the callback the seconds
 * since the last frame, and pauses for reduced motion and while the tab is hidden.
 */
function useAmbientFrame(frame: (delta: number) => void) {
	const reducedMotion = usePrefersReducedMotion();

	onMount(() => {
		let last = performance.now();
		let id = requestAnimationFrame(function step(time) {
			// Clamped so a backgrounded tab does not dump seconds of motion into one frame.
			const delta = Math.min((time - last) / 1000, 0.05);

			last = time;

			if (!reducedMotion() && !document.hidden) frame(delta);

			id = requestAnimationFrame(step);
		});

		onCleanup(() => cancelAnimationFrame(id));
	});
}

export default useAmbientFrame;
