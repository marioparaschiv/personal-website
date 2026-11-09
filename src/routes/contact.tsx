import {
	ArrowLeft,
	ArrowUpRight,
	AtSign,
	Check,
	Copy,
	GitBranch,
	type LucideIcon,
	Mail,
} from 'lucide-solid';
import { createSignal, For, type JSX, onCleanup, onMount } from 'solid-js';
import { createFileRoute, Link } from '@tanstack/solid-router';
import { Title } from '@solidjs/meta';

import Booking from '~/components/booking/booking';
import { site } from '~/content/site';
import { cn } from '~/utils';

type Social = {
	label: string;
	text: string;
	href: string;
	icon: LucideIcon;
};

type CornersProps = {
	outside?: boolean;
};

const SOCIALS: Social[] = [
	{ label: 'GitHub', icon: GitBranch, ...site.links.github },
	{ label: 'X / Twitter', icon: AtSign, ...site.links.twitter },
];

const corner =
	'absolute w-3 h-3 border-white/0 group-hover:border-white/50 group-focus-visible:border-white/50 transition-[border-color,translate] duration-300 pointer-events-none';

const londonTime = new Intl.DateTimeFormat('en-GB', {
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Europe/London',
});

function Corners(props: CornersProps): JSX.Element {
	return (
		<>
			<span
				class={cn(
					corner,
					props.outside ? '-top-1.5 -left-1.5' : 'top-1.5 left-1.5',
					'border-t border-l translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
			<span
				class={cn(
					corner,
					props.outside ? '-top-1.5 -right-1.5' : 'top-1.5 right-1.5',
					'border-t border-r -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
			<span
				class={cn(
					corner,
					props.outside ? '-bottom-1.5 -left-1.5' : 'bottom-1.5 left-1.5',
					'border-b border-l translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
			<span
				class={cn(
					corner,
					props.outside ? '-right-1.5 -bottom-1.5' : 'right-1.5 bottom-1.5',
					'border-r border-b -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0',
				)}
			/>
		</>
	);
}

function Contact() {
	const [now, setNow] = createSignal(new Date());
	const [copied, setCopied] = createSignal(false);

	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		const clock = setInterval(() => setNow(new Date()), 15_000);

		onCleanup(() => {
			clearInterval(clock);
			clearTimeout(copiedTimer);
		});
	});

	async function copyEmail() {
		await navigator.clipboard.writeText(site.links.email.text);
		setCopied(true);
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div class='relative flex justify-center items-center px-6 py-24 min-h-dvh overflow-hidden'>
			<Title>Contact - {site.name}</Title>

			<div
				class='z-0 absolute inset-0 opacity-40 pointer-events-none select-none'
				style={{
					'background-image': 'url(/img/grid-pattern.svg)',
					'background-repeat': 'repeat',
					'background-size': '48px 48px',
					'mask-image': 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
					'-webkit-mask-image':
						'radial-gradient(ellipse at center, black 50%, transparent 90%)',
				}}
			/>

			<Link
				to='/'
				class='group top-6 left-6 z-30 absolute flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300'
			>
				<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
				<ArrowLeft class='relative' size={12} />
				<span class='relative'>Back</span>
			</Link>

			<main class='z-10 relative flex flex-col gap-8 w-full max-w-4xl'>
				<div class='flex flex-col gap-8'>
					<div class='flex flex-col gap-3 stagger'>
						<h1 class='font-semibold text-white text-4xl sm:text-5xl tracking-tight'>
							Get in touch
						</h1>
						<p class='max-w-md text-neutral-400 leading-relaxed'>
							Have a project, a role or an idea in mind? Book a call, or send me an
							email with a few lines about it and I'll get back to you.
						</p>
					</div>

					<div
						class='flex flex-col gap-5 bg-neutral-950/60 backdrop-blur-sm p-5 sm:p-6 border border-white/10 stagger'
						style={{ '--stagger': '1' }}
					>
						<div class='flex justify-between items-center font-light text-[10px] text-neutral-500 sm:text-xs uppercase tracking-widest'>
							<span class='flex items-center gap-3'>
								<span class='flex justify-center items-center bg-white/5 border border-white/10 w-7 h-7 text-neutral-300'>
									<Mail size={14} />
								</span>
								Email
							</span>
							<span class='tabular-nums'>
								{site.location.split(',')[0]} · {londonTime.format(now())}
							</span>
						</div>

						<span class='font-semibold text-white text-xl sm:text-3xl break-all tracking-tight'>
							{site.links.email.text}
						</span>

						<div class='flex sm:flex-row flex-col gap-2 sm:gap-3'>
							<a
								href={site.links.email.href}
								class='group relative flex justify-center items-center gap-2 bg-white hover:bg-neutral-100 px-5 py-3 focus-visible:outline-hidden font-medium text-black text-sm uppercase tracking-widest transition-colors duration-300'
							>
								<Corners outside />
								Send an email
								<ArrowUpRight
									class='transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-300'
									size={14}
								/>
							</a>
							<button
								type='button'
								onClick={copyEmail}
								class='group relative flex justify-center items-center gap-2 px-5 py-3 border border-white/10 hover:border-white/30 focus-visible:border-white/60 focus-visible:outline-hidden overflow-hidden font-light text-sm uppercase tracking-widest transition-colors duration-300 cursor-pointer'
							>
								<span class='absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out' />
								<span class='relative flex items-center gap-2' aria-live='polite'>
									{copied() ? <Check size={14} /> : <Copy size={14} />}
									{copied() ? 'Copied' : 'Copy address'}
								</span>
							</button>
						</div>
					</div>

					<div class='gap-2 sm:gap-3 grid sm:grid-cols-2'>
						<For each={SOCIALS}>
							{(social, index) => {
								const Icon = social.icon;

								return (
									<a
										href={social.href}
										target='_blank'
										rel='noopener noreferrer'
										class='group relative flex items-center gap-3 bg-neutral-950/60 backdrop-blur-sm p-3.5 border border-white/10 hover:border-white/30 focus-visible:border-white/60 focus-visible:outline-hidden overflow-hidden transition-colors duration-300 stagger'
										style={{ '--stagger': String(index() + 2) }}
									>
										<span class='absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out' />
										<Corners />

										<span class='relative flex justify-center items-center bg-white/5 border border-white/10 group-hover:border-white/30 w-7 h-7 text-neutral-300 group-hover:text-white transition-colors duration-300 shrink-0'>
											<Icon size={14} />
										</span>
										<span class='relative flex flex-col min-w-0'>
											<span class='font-light text-[10px] text-neutral-500 uppercase tracking-widest'>
												{social.label}
											</span>
											<span class='text-white text-sm truncate'>
												{social.text}
											</span>
										</span>
										<ArrowUpRight
											class='relative ml-auto text-neutral-500 group-hover:text-white transition-[color,translate] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-300 shrink-0'
											size={14}
										/>
									</a>
								);
							}}
						</For>
					</div>
				</div>

				<div class='stagger' style={{ '--stagger': '4' }}>
					<Booking />
				</div>
			</main>
		</div>
	);
}

export const Route = createFileRoute('/contact')({
	component: Contact,
});
