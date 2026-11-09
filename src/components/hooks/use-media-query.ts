import { createSignal, onCleanup, onMount } from 'solid-js';
import type { Accessor } from 'solid-js';

const cache = new Map<string, MediaQueryList>();

function getMatcher(query: string): MediaQueryList {
	const media = cache.get(query);
	if (media) return media;

	const matcher = window.matchMedia(query);
	cache.set(query, matcher);

	return matcher;
}

export default function useMediaQuery(query: string): Accessor<boolean> {
	const media = getMatcher(query);
	const [state, setState] = createSignal(media.matches);

	const callback = () => setState(media.matches);

	onMount(() => {
		media.addEventListener('change', callback);
	});

	onCleanup(() => media.removeEventListener('change', callback));

	return state;
}

export function usePrefersDark(): Accessor<boolean> {
	return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersLight(): Accessor<boolean> {
	return useMediaQuery('(prefers-color-scheme: light)');
}

export function usePrefersReducedMotion(): Accessor<boolean> {
	return useMediaQuery('(prefers-reduced-motion)');
}
