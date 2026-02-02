import { useEffect, useState } from 'react';

const cache = new Map<string, MediaQueryList>();

function getMatcher(query: string): MediaQueryList {
	const media = cache.get(query);
	if (media) return media;

	const matcher = window.matchMedia(query);
	cache.set(query, matcher);

	return matcher;
}

export default function useMediaQuery(query: string): boolean {
	const media = getMatcher(query);
	const [state, setState] = useState(media.matches);

	useEffect(() => {
		const callback = () => setState(media.matches);

		media.addEventListener('change', callback);
		return () => media.removeEventListener('change', callback);
	});

	return state;
}

export function usePrefersDark(): boolean {
	return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersLight(): boolean {
	return useMediaQuery('(prefers-color-scheme: light)');
}

export function usePrefersReducedMotion(): boolean {
	return useMediaQuery('(prefers-reduced-motion)');
}
