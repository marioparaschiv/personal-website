type SwipeAxis = 'x' | 'y';

// Shared by the page's section snap and the carousel so one gesture never drives both.
const INTENT_DISTANCE = 10;

/** The axis a swipe has committed to, or null while it is still too short to tell. */
function swipeAxis(dx: number, dy: number): SwipeAxis | null {
	if (Math.hypot(dx, dy) < INTENT_DISTANCE) return null;

	return Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
}

export { type SwipeAxis };
export default swipeAxis;
