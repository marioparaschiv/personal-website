const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

// The latest swap per element, so an interrupted one stops instead of finishing over the new one.
const latest = new WeakMap<HTMLElement, number>();

/**
 * Swaps an element's content with a sideways swoosh, matching how media slides change: the old
 * content streaks out against `direction`, `swap` replaces it, and the new content streaks in.
 * `data-swooshing` stops nested stagger entrances from adding a vertical motion. It is never
 * removed: dropping it re-enables the stagger animation, which restarts and replays it.
 */
async function swooshSwap(el: HTMLElement, direction: number, swap: () => unknown) {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const shift = reduced ? 0 : 48 * direction;
	const blur = reduced ? 0 : 10;
	const run = (latest.get(el) ?? 0) + 1;
	const isStale = () => latest.get(el) !== run;

	latest.set(el, run);

	for (const animation of el.getAnimations()) animation.cancel();

	el.dataset.swooshing = '';

	// Holds the hidden end state until the enter animation replaces it below; cancelling it
	// explicitly matters, since a leftover filled exit would keep the new content invisible.
	const exit = el.animate(
		[
			{ opacity: 1, translate: '0 0', filter: 'blur(0px)' },
			{ opacity: 0, translate: `${-shift}px 0`, filter: `blur(${blur}px)` },
		],
		{ duration: reduced ? 120 : 180, easing: EASE_OUT, fill: 'forwards' },
	);

	try {
		await exit.finished;
	} catch {
		return;
	}

	if (isStale()) return;

	await swap();

	if (isStale()) {
		exit.cancel();

		return;
	}

	const enter = el.animate(
		[
			{ opacity: 0, translate: `${shift}px 0`, filter: `blur(${blur}px)` },
			{ opacity: 1, translate: '0 0', filter: 'blur(0px)' },
		],
		{ duration: reduced ? 200 : 460, easing: EASE_OUT },
	);

	exit.cancel();

	await enter.finished.catch(() => undefined);
}

export default swooshSwap;
