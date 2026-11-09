import { ArrowLeft, ArrowRight, CalendarDays, Clock, Video } from 'lucide-solid';
import { createSignal, type JSX, Show } from 'solid-js';

import { site } from '~/content/site';

import { type Booking, createBooking } from './api';
import { formatDay, formatTime } from './dates';

type BookingEvent = (typeof site.booking.events)[number];

type BookingFormProps = {
	event: BookingEvent;
	start: string;
	day: string;
	timeZone: string;
	hour12: boolean;
	onBack: () => void;
	onBooked: (booking: Booking, email: string) => void;
};

type FieldProps = {
	label: string;
	children: JSX.Element;
};

const input =
	'bg-transparent px-3 py-2.5 border border-white/10 hover:border-white/20 focus:border-white/50 outline-hidden text-white text-sm placeholder:text-neutral-600 transition-colors duration-300';

function Field(props: FieldProps) {
	return (
		<label class='flex flex-col gap-1.5'>
			<span class='font-light text-[10px] text-neutral-500 uppercase tracking-widest'>
				{props.label}
			</span>
			{props.children}
		</label>
	);
}

function BookingForm(props: BookingFormProps) {
	const [submitting, setSubmitting] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();

		const data = new FormData(event.currentTarget as HTMLFormElement);
		const email = String(data.get('email'));

		setSubmitting(true);
		setError(null);

		try {
			const booking = await createBooking({
				event: props.event.slug,
				start: props.start,
				name: String(data.get('name')),
				email,
				notes: String(data.get('notes') ?? ''),
				timeZone: props.timeZone,
			});

			props.onBooked(booking, email);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div class='gap-6 sm:gap-8 grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'>
			<div class='flex flex-col gap-4'>
				<button
					type='button'
					onClick={() => props.onBack()}
					class='flex items-center gap-2 self-start opacity-70 hover:opacity-100 font-light text-[10px] uppercase tracking-widest transition-opacity duration-300 cursor-pointer'
				>
					<ArrowLeft size={12} />
					Change time
				</button>

				<div class='flex flex-col gap-2.5 text-neutral-300 text-sm'>
					<span class='flex items-center gap-2.5'>
						<CalendarDays class='text-neutral-500' size={14} />
						{formatDay(props.day)}
					</span>
					<span class='flex items-center gap-2.5 tabular-nums'>
						<Clock class='text-neutral-500' size={14} />
						{formatTime(props.start, props.timeZone, props.hour12)} ·{' '}
						{props.event.minutes} min
					</span>
					<span class='flex items-center gap-2.5'>
						<Video class='text-neutral-500' size={14} />
						{site.booking.location}
					</span>
				</div>
			</div>

			<form onSubmit={onSubmit} class='flex flex-col gap-4'>
				<div class='gap-4 grid sm:grid-cols-2'>
					<Field label='Name'>
						<input name='name' required autocomplete='name' class={input} />
					</Field>
					<Field label='Email'>
						<input
							name='email'
							type='email'
							required
							autocomplete='email'
							class={input}
						/>
					</Field>
				</div>

				<Field label='What would you like to talk about?'>
					<textarea
						name='notes'
						rows={3}
						placeholder='Optional'
						class={`${input} resize-none`}
					/>
				</Field>

				<Show when={error()}>
					<p role='alert' class='px-3 py-2 border border-red-400/30 text-red-300 text-sm'>
						{error()}
					</p>
				</Show>

				<button
					type='submit'
					disabled={submitting()}
					class='group flex items-stretch self-start disabled:opacity-60 focus-visible:outline-hidden font-medium text-black text-sm uppercase tracking-widest cursor-pointer disabled:cursor-wait'
				>
					<span class='bg-white group-hover:bg-neutral-100 px-5 py-3 transition-colors duration-300'>
						{submitting() ? 'Booking…' : 'Confirm booking'}
					</span>
					<span class='relative flex justify-center items-center bg-white group-hover:bg-neutral-200 border-black/10 border-l w-11 overflow-hidden transition-colors duration-300'>
						<ArrowRight
							class='transition-transform group-hover:translate-x-8 duration-300 ease-out'
							size={14}
						/>
						<ArrowRight
							class='absolute transition-transform -translate-x-8 group-hover:translate-x-0 duration-300 ease-out'
							size={14}
						/>
					</span>
				</button>
			</form>
		</div>
	);
}

export { type BookingEvent };
export default BookingForm;
