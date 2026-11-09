import { createSignal, onCleanup, onMount } from 'solid-js';

import type { SpringConfig } from './use-animated-scroll';

import useTemporaryVisibility from './use-temporary-visibility';
import useAnimatedScroll from './use-animated-scroll';
import useScrollInputs from './use-scroll-inputs';

interface UseScrollSnapOptions {
	container: () => HTMLDivElement;
	sectionCount: number;
	springConfig?: SpringConfig;
	onScrollProgress?: (ratio: number) => void;
}

function useScrollSnap({
	container: getContainer,
	sectionCount,
	springConfig = { tension: 170, friction: 26 },
	onScrollProgress,
}: UseScrollSnapOptions) {
	const [activeSection, setActiveSection] = createSignal(0);
	const [showLabel, triggerLabel] = useTemporaryVisibility(1500);

	let currentSection = 0;
	const maxIndex = sectionCount - 1;

	function processScroll(scrollTop: number, clientHeight: number) {
		const ratio = Math.min(Math.max(scrollTop / clientHeight, 0), maxIndex);
		onScrollProgress?.(ratio);

		const next = Math.round(ratio);
		if (activeSection() !== next) triggerLabel();
		setActiveSection(next);
	}

	const animated = useAnimatedScroll({
		container: getContainer,
		springConfig,
		onFrame: (val) => processScroll(val, getContainer().clientHeight),
	});

	function snapTo(index: number) {
		const container = getContainer();
		const clamped = Math.max(0, Math.min(maxIndex, index));
		const clientHeight = container.clientHeight || window.innerHeight;
		const target = clamped * clientHeight;

		currentSection = clamped;
		animated.scrollTo(target);
	}

	useScrollInputs(getContainer, {
		onNext: () => snapTo(currentSection + 1),
		onPrev: () => snapTo(currentSection - 1),
		onFirst: () => snapTo(0),
		onLast: () => snapTo(maxIndex),
		isLocked: animated.isAnimating,
	});

	triggerLabel();

	let debounceTimer: ReturnType<typeof setTimeout>;

	function onResize() {
		const container = getContainer();
		const target = currentSection * (container.clientHeight || window.innerHeight);
		animated.set(target);
		container.scrollTop = target;
	}

	function onScroll() {
		const container = getContainer();
		if (!animated.isIdle()) {
			const diff = Math.abs(container.scrollTop - animated.getValue());
			if (diff > 10) {
				animated.stop();
				animated.set(container.scrollTop);
			} else {
				return;
			}
		}

		processScroll(container.scrollTop, container.clientHeight);

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const c = getContainer();
			if (!animated.isIdle()) return;
			const nearest = Math.round(c.scrollTop / c.clientHeight);
			snapTo(nearest);
		}, 150);
	}

	onMount(() => {
		const container = getContainer();
		window.addEventListener('resize', onResize);
		container.addEventListener('scroll', onScroll, { passive: true });
	});

	onCleanup(() => {
		const container = getContainer();
		window.removeEventListener('resize', onResize);
		container?.removeEventListener('scroll', onScroll);
		clearTimeout(debounceTimer);
	});

	return { snapTo, activeSection, showLabel };
}

export default useScrollSnap;
