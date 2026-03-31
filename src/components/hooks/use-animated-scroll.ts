import { useCallback, useLayoutEffect, useRef } from 'react';
import type { SpringConfig } from '@react-spring/web';
import { useSpringValue } from '@react-spring/web';

import useLatestRef from './use-latest-ref';

interface UseAnimatedScrollOptions {
	containerRef: React.RefObject<HTMLElement | null>;
	springConfig?: SpringConfig;
	onFrame?: (value: number) => void;
}

function useAnimatedScroll({
	containerRef,
	springConfig = { tension: 170, friction: 26 },
	onFrame,
}: UseAnimatedScrollOptions) {
	const spring = useSpringValue(0, { config: springConfig });
	const rafRef = useRef<number>(0);
	const animatingRef = useRef(false);
	const onFrameRef = useLatestRef(onFrame);
	const applyScrollRef = useRef<() => void>();

	const applyScroll = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;

		const val = spring.get();
		container.scrollTop = val;
		onFrameRef.current?.(val);

		if (!spring.idle) {
			rafRef.current = requestAnimationFrame(() => applyScrollRef.current?.());
		} else {
			animatingRef.current = false;
		}
	}, [containerRef, spring, onFrameRef]);

	useLayoutEffect(() => {
		applyScrollRef.current = applyScroll;
	});

	const scrollTo = useCallback(
		(target: number) => {
			const container = containerRef.current;
			const current = container?.scrollTop ?? 0;

			if (Math.abs(current - target) < 2) return;

			animatingRef.current = true;
			cancelAnimationFrame(rafRef.current);

			spring.set(current);
			spring.start(target);
			rafRef.current = requestAnimationFrame(() => applyScrollRef.current?.());
		},
		[containerRef, spring],
	);

	const stop = useCallback(() => {
		spring.stop();
		cancelAnimationFrame(rafRef.current);
		animatingRef.current = false;
	}, [spring]);

	const set = useCallback(
		(value: number) => {
			spring.set(value);
		},
		[spring],
	);

	return {
		scrollTo,
		getValue: () => spring.get(),
		isIdle: () => spring.idle,
		isAnimating: () => animatingRef.current,
		stop,
		set,
	};
}

export default useAnimatedScroll;
