import { site } from '~/content/site';

type Slots = Record<string, string[]>;

type BookingRequest = {
	event: string;
	start: string;
	name: string;
	email: string;
	notes: string;
	timeZone: string;
};

type Booking = {
	uid: string;
	start: string;
	meetingUrl?: string;
};

type Envelope = {
	ok: boolean;
	data: unknown;
	message?: string;
};

type SlotsQuery = {
	event: string;
	from: string;
	to: string;
	timeZone: string;
};

const API = 'https://api.cal.com/v2';

class BookingError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

async function readEnvelope(response: Response): Promise<Envelope> {
	const body: unknown = await response.json().catch(() => null);
	const error = isRecord(body) && isRecord(body.error) ? body.error : undefined;

	return {
		ok: response.ok,
		data: isRecord(body) ? body.data : undefined,
		message: typeof error?.message === 'string' ? error.message : undefined,
	};
}

function toSlots(data: unknown): Slots | undefined {
	if (!isRecord(data)) return undefined;

	const slots: Slots = {};

	for (const [date, entries] of Object.entries(data)) {
		if (!Array.isArray(entries)) continue;

		slots[date] = entries.flatMap((entry: unknown) =>
			isRecord(entry) && typeof entry.start === 'string' ? [entry.start] : [],
		);
	}

	return slots;
}

function toBooking(data: unknown): Booking | undefined {
	if (!isRecord(data) || typeof data.uid !== 'string' || typeof data.start !== 'string') {
		return undefined;
	}

	return {
		uid: data.uid,
		start: data.start,
		meetingUrl: typeof data.meetingUrl === 'string' ? data.meetingUrl : undefined,
	};
}

type CachedSlots = {
	at: number;
	slots: Promise<Slots>;
};

// Short-lived so a prefetch from the home page is reused, but a long-open tab still sees fresh times.
const SLOTS_TTL = 60_000;

const slotsCache = new Map<string, CachedSlots>();

function fetchSlots(query: SlotsQuery): Promise<Slots> {
	const key = `${query.event}|${query.from}|${query.to}|${query.timeZone}`;
	const cached = slotsCache.get(key);

	if (cached && Date.now() - cached.at < SLOTS_TTL) return cached.slots;

	const slots = requestSlots(query);

	slotsCache.set(key, { at: Date.now(), slots });
	slots.catch(() => slotsCache.delete(key));

	return slots;
}

async function requestSlots(query: SlotsQuery): Promise<Slots> {
	const params = new URLSearchParams({
		username: site.booking.username,
		eventTypeSlug: query.event,
		start: query.from,
		end: query.to,
		timeZone: query.timeZone,
	});

	const response = await fetch(`${API}/slots?${params}`, {
		headers: { 'cal-api-version': '2024-09-04' },
	});

	const body = await readEnvelope(response);
	const slots = body.ok ? toSlots(body.data) : undefined;

	if (!slots) throw new BookingError(body.message ?? 'Could not load availability.');

	return slots;
}

async function createBooking(request: BookingRequest): Promise<Booking> {
	const response = await fetch(`${API}/bookings`, {
		method: 'POST',
		headers: { 'cal-api-version': '2024-08-13', 'content-type': 'application/json' },
		body: JSON.stringify({
			start: new Date(request.start).toISOString(),
			username: site.booking.username,
			eventTypeSlug: request.event,
			attendee: { name: request.name, email: request.email, timeZone: request.timeZone },
			bookingFieldsResponses: request.notes ? { notes: request.notes } : undefined,
		}),
	});

	const body = await readEnvelope(response);
	const booking = body.ok ? toBooking(body.data) : undefined;

	if (!booking) {
		throw new BookingError(body.message ?? 'Could not book that time. Try another slot.');
	}

	return booking;
}

export { type Booking, BookingError, type BookingRequest, createBooking, fetchSlots, type Slots };
