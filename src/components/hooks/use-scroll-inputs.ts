import { useEffect } from 'react';

import useLatestRef from './use-latest-ref';

interface ScrollInputHandlers {
	onNext: () => void;
	onPrev: () => void;
	onFirst: () => void;
	onLast: () => void;
	isLocked: () => boolean;
}

function useScrollInputs(
	containerRef: React.RefObject<HTMLElement | null>,
	handlers: ScrollInputHandlers,
) {
	const handlersRef = useLatestRef(handlers);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function onWheel(e: WheelEvent) {
			e.preventDefault();
			if (handlersRef.current.isLocked()) return;

			if (e.deltaY > 0) handlersRef.current.onNext();
			else if (e.deltaY < 0) handlersRef.current.onPrev();
		}

		container.addEventListener('wheel', onWheel, { passive: false });
		return () => container.removeEventListener('wheel', onWheel);
	}, [containerRef]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let startY = 0;
		let triggered = false;

		function onTouchStart(e: TouchEvent) {
			startY = e.touches[0].clientY;
			triggered = false;
		}

		function onTouchMove(e: TouchEvent) {
			if (triggered || handlersRef.current.isLocked()) return;

			const deltaY = startY - e.touches[0].clientY;
			if (Math.abs(deltaY) < 5) return;

			triggered = true;
			if (deltaY > 0) handlersRef.current.onNext();
			else handlersRef.current.onPrev();
		}

		container.addEventListener('touchstart', onTouchStart, { passive: true });
		container.addEventListener('touchmove', onTouchMove, { passive: true });

		return () => {
			container.removeEventListener('touchstart', onTouchStart);
			container.removeEventListener('touchmove', onTouchMove);
		};
	}, [containerRef]);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (handlersRef.current.isLocked()) return;

			switch (e.key) {
				case 'ArrowDown':
				case 'PageDown':
					e.preventDefault();
					handlersRef.current.onNext();
					break;
				case 'ArrowUp':
				case 'PageUp':
					e.preventDefault();
					handlersRef.current.onPrev();
					break;
				case 'Home':
					e.preventDefault();
					handlersRef.current.onFirst();
					break;
				case 'End':
					e.preventDefault();
					handlersRef.current.onLast();
					break;
			}
		}

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);
}

export default useScrollInputs;
