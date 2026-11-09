type Month = {
	year: number;
	month: number;
};

type Day = {
	key: string;
	day: number;
};

const pad = (value: number) => String(value).padStart(2, '0');

const dayKey = (year: number, month: number, day: number) =>
	`${year}-${pad(month + 1)}-${pad(day)}`;

function todayIn(timeZone: string): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
}

function monthOf(key: string): Month {
	const [year, month] = key.split('-').map(Number);

	return { year, month: month - 1 };
}

function shiftMonth(value: Month, by: number): Month {
	const date = new Date(Date.UTC(value.year, value.month + by, 1));

	return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function monthRange(value: Month) {
	const last = new Date(Date.UTC(value.year, value.month + 1, 0)).getUTCDate();

	return { from: dayKey(value.year, value.month, 1), to: dayKey(value.year, value.month, last) };
}

// Monday-first grid; `null` cells pad the first week so day 1 lands under its weekday.
function monthGrid(value: Month): (Day | null)[] {
	const first = new Date(Date.UTC(value.year, value.month, 1)).getUTCDay();
	const days = new Date(Date.UTC(value.year, value.month + 1, 0)).getUTCDate();
	const leading = (first + 6) % 7;

	const cells: (Day | null)[] = Array.from({ length: leading }, () => null);

	for (let day = 1; day <= days; day++) {
		cells.push({ key: dayKey(value.year, value.month, day), day });
	}

	return cells;
}

function formatMonth(value: Month): string {
	return new Intl.DateTimeFormat('en-GB', {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(Date.UTC(value.year, value.month, 1)));
}

function formatDay(key: string): string {
	const { year, month } = monthOf(key);

	return new Intl.DateTimeFormat('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC',
	}).format(new Date(Date.UTC(year, month, Number(key.slice(8)))));
}

function formatTime(iso: string, timeZone: string, hour12: boolean): string {
	return new Intl.DateTimeFormat('en-GB', {
		hour: 'numeric',
		minute: '2-digit',
		hour12,
		timeZone,
	}).format(new Date(iso));
}

export {
	type Day,
	formatDay,
	formatMonth,
	formatTime,
	type Month,
	monthGrid,
	monthOf,
	monthRange,
	shiftMonth,
	todayIn,
};
