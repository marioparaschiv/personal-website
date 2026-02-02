import { useEffect, useState } from 'react';

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

function useBreakpoint(breakpoint: Breakpoint) {
	const value = resolve(breakpoint);
	const [matches, setMatches] = useState(
		() => !!value && window.matchMedia(`(min-width: ${value})`).matches,
	);

	useEffect(() => {
		if (!value) return;

		const mql = window.matchMedia(`(min-width: ${value})`);
		setMatches(mql.matches);

		const onChange = () => setMatches(mql.matches);
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, [value]);

	return matches;
}

export default useBreakpoint;
