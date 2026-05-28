import { onCleanup, onMount } from 'solid-js';

interface ScrollInputHandlers {
	onNext: () => void;
	onPrev: () => void;
	onFirst: () => void;
	onLast: () => void;
	isLocked: () => boolean;
}

function useScrollInputs(getContainer: () => HTMLElement, handlers: ScrollInputHandlers) {
	let startY = 0;
	let triggered = false;

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		if (handlers.isLocked()) return;

		if (e.deltaY > 0) handlers.onNext();
		else if (e.deltaY < 0) handlers.onPrev();
	}

	function onTouchStart(e: TouchEvent) {
		startY = e.touches[0].clientY;
		triggered = false;
	}

	function onTouchMove(e: TouchEvent) {
		if (triggered || handlers.isLocked()) return;

		const deltaY = startY - e.touches[0].clientY;
		if (Math.abs(deltaY) < 5) return;

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
		container.addEventListener('touchmove', onTouchMove, { passive: true });
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
