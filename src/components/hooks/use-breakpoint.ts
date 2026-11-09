import { createSignal, onCleanup, onMount } from 'solid-js';
import type { Accessor } from 'solid-js';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues = new Map<Breakpoint, string>();

function resolve(breakpoint: Breakpoint) {
	let value = breakpointValues.get(breakpoint);
	if (value) return value;

	if (breakpointValues.size === 0) {
		const style = getComputedStyle(document.documentElement);

		for (const bp of ['sm', 'md', 'lg', 'xl', '2xl'] as const) {
			const v = style.getPropertyValue(`--breakpoint-${bp}`).trim();
			if (v) breakpointValues.set(bp, v);
		}

		value = breakpointValues.get(breakpoint);
	}

	return value;
}

function useBreakpoint(breakpoint: Breakpoint): Accessor<boolean> {
	const value = resolve(breakpoint);
	const [matches, setMatches] = createSignal(
		!!value && window.matchMedia(`(min-width: ${value})`).matches,
	);

	let mql: MediaQueryList | undefined;
	let onChange: (() => void) | undefined;

	onMount(() => {
		if (!value) return;

		mql = window.matchMedia(`(min-width: ${value})`);
		setMatches(mql.matches);

		onChange = () => setMatches(mql!.matches);
		mql.addEventListener('change', onChange);
	});

	onCleanup(() => {
		if (mql && onChange) mql.removeEventListener('change', onChange);
	});

	return matches;
}

export default useBreakpoint;
