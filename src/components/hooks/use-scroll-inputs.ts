import { onCleanup, onMount } from 'solid-js';

import { swipeAxis, type SwipeAxis } from '~/utils';

interface ScrollInputHandlers {
	onNext: () => void;
	onPrev: () => void;
	onFirst: () => void;
	onLast: () => void;
	isLocked: () => boolean;
}

function useScrollInputs(getContainer: () => HTMLElement, handlers: ScrollInputHandlers) {
	let startX = 0;
	let startY = 0;
	let axis: SwipeAxis | null = null;
	let triggered = false;

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		if (handlers.isLocked()) return;

		if (e.deltaY > 0) handlers.onNext();
		else if (e.deltaY < 0) handlers.onPrev();
	}

	function onTouchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
		axis = null;
		triggered = false;
	}

	function onTouchMove(e: TouchEvent) {
		if (e.touches.length > 1) return;

		// Sections only move by snapping. Letting the browser pan too would fight the snap animation
		// and carry momentum past the next section, so native touch scrolling is cancelled outright.
		if (e.cancelable) e.preventDefault();

		if (triggered || axis === 'x') return;

		const deltaX = e.touches[0].clientX - startX;
		const deltaY = startY - e.touches[0].clientY;

		axis ??= swipeAxis(deltaX, deltaY);

		if (axis !== 'y' || handlers.isLocked()) return;

		triggered = true;
		if (deltaY > 0) handlers.onNext();
		else handlers.onPrev();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (handlers.isLocked()) return;

		switch (e.key) {
			case 'ArrowDown':
			case 'PageDown':
				e.preventDefault();
				handlers.onNext();
				break;
			case 'ArrowUp':
			case 'PageUp':
				e.preventDefault();
				handlers.onPrev();
				break;
			case 'Home':
				e.preventDefault();
				handlers.onFirst();
				break;
			case 'End':
				e.preventDefault();
				handlers.onLast();
				break;
		}
	}

	onMount(() => {
		const container = getContainer();
		container.addEventListener('wheel', onWheel, { passive: false });
		container.addEventListener('touchstart', onTouchStart, { passive: true });
		container.addEventListener('touchmove', onTouchMove, { passive: false });
		document.addEventListener('keydown', onKeyDown);
	});

	onCleanup(() => {
		const container = getContainer();
		container.removeEventListener('wheel', onWheel);
		container.removeEventListener('touchstart', onTouchStart);
		container.removeEventListener('touchmove', onTouchMove);
		document.removeEventListener('keydown', onKeyDown);
	});
}

export default useScrollInputs;
