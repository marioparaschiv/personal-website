import { site } from '~/content/site';

import { monthOf, monthRange, todayIn } from './dates';
import { fetchSlots } from './api';

const DETECTED_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const EVENTS = site.booking.events;

const DEFAULT_EVENT =
	EVENTS.find((event) => event.minutes === site.booking.defaultMinutes) ?? EVENTS[0];

// Warms the cache with exactly what the booking panel asks for on open (every call length, so
// switching 15/30 is instant too). Errors are swallowed; the panel retries and shows its own state.
function prefetchSlots() {
	const range = monthRange(monthOf(todayIn(DETECTED_ZONE)));

	for (const event of EVENTS) {
		fetchSlots({ ...range, timeZone: DETECTED_ZONE, event: event.slug }).catch(() => {});
	}
}

export { DEFAULT_EVENT, DETECTED_ZONE, EVENTS, prefetchSlots };
