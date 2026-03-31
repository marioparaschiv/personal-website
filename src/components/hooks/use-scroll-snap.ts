import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpringConfig } from '@react-spring/web';

import useTemporaryVisibility from './use-temporary-visibility';
import useAnimatedScroll from './use-animated-scroll';
import useScrollInputs from './use-scroll-inputs';
import useLatestRef from './use-latest-ref';

interface UseScrollSnapOptions {
	containerRef: React.RefObject<HTMLDivElement | null>;
	sectionCount: number;
	springConfig?: SpringConfig;
	onScrollProgress?: (ratio: number) => void;
}

function useScrollSnap({
	containerRef,
	sectionCount,
	springConfig = { tension: 170, friction: 26 },
	onScrollProgress,
}: UseScrollSnapOptions) {
	const [activeSection, setActiveSection] = useState(0);
	const [showLabel, triggerLabel] = useTemporaryVisibility(1500);
	const sectionRef = useRef(0);
	const onScrollProgressRef = useLatestRef(onScrollProgress);

	const maxIndex = sectionCount - 1;

	const processScroll = useCallback(
		(scrollTop: number, clientHeight: number) => {
			const ratio = Math.min(Math.max(scrollTop / clientHeight, 0), maxIndex);
			onScrollProgressRef.current?.(ratio);

			const next = Math.round(ratio);
			setActiveSection((prev) => {
				if (prev !== next) triggerLabel();
				return next;
			});
		},
		[maxIndex, onScrollProgressRef, triggerLabel],
	);

	const animated = useAnimatedScroll({
		containerRef,
		springConfig,
		onFrame: (val) => {
			const container = containerRef.current;
			if (container) processScroll(val, container.clientHeight);
		},
	});

	const snapTo = useCallback(
		(index: number) => {
			const container = containerRef.current;
			const clamped = Math.max(0, Math.min(maxIndex, index));
			const clientHeight = container?.clientHeight ?? window.innerHeight;
			const target = clamped * clientHeight;

			sectionRef.current = clamped;
			animated.scrollTo(target);
		},
		[containerRef, maxIndex, animated],
	);

	useScrollInputs(containerRef, {
		onNext: () => snapTo(sectionRef.current + 1),
		onPrev: () => snapTo(sectionRef.current - 1),
		onFirst: () => snapTo(0),
		onLast: () => snapTo(maxIndex),
		isLocked: animated.isAnimating,
	});

	useEffect(() => {
		triggerLabel();
	}, [triggerLabel]);

	useEffect(() => {
		function onResize() {
			const target =
				sectionRef.current * (containerRef.current?.clientHeight ?? window.innerHeight);
			animated.set(target);
			if (containerRef.current) containerRef.current.scrollTop = target;
		}

		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [containerRef, animated]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let debounceTimer: ReturnType<typeof setTimeout>;

		function onScroll() {
			if (!animated.isIdle()) {
				const diff = Math.abs(container!.scrollTop - animated.getValue());
				if (diff > 10) {
					animated.stop();
					animated.set(container!.scrollTop);
				} else {
					return;
				}
			}

			processScroll(container!.scrollTop, container!.clientHeight);

			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				if (!animated.isIdle()) return;
				const nearest = Math.round(container!.scrollTop / container!.clientHeight);
				snapTo(nearest);
			}, 150);
		}

		container.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			container.removeEventListener('scroll', onScroll);
			clearTimeout(debounceTimer);
		};
	}, [containerRef, animated, snapTo, processScroll]);

	return { snapTo, activeSection, showLabel };
}

export default useScrollSnap;
