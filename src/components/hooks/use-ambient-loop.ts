import { onCleanup, onMount } from 'solid-js';

import { usePrefersReducedMotion } from './use-media-query';

// Decorative loops pause for reduced motion and while the tab is hidden, so they never cost anything unseen.
function useAmbientLoop(tick: () => void, interval: number) {
	const reducedMotion = usePrefersReducedMotion();

	onMount(() => {
		const id = setInterval(() => {
			if (reducedMotion() || document.hidden) return;

			tick();
		}, interval);

		onCleanup(() => clearInterval(id));
	});
}

export default useAmbientLoop;
