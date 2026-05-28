import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { ArrowLeft } from 'lucide-solid';
import { Title } from '@solidjs/meta';
import { For } from 'solid-js';

import { site } from '~/content/site';

function Contact() {
	const navigate = useNavigate();

	const links = () =>
		Object.entries(site.links).map(([key, link]) => ({
			key,
			...link,
		}));

	return (
		<div class='flex flex-col justify-center items-center h-dvh'>
			<Title>Contact - {site.name}</Title>

			<div class='top-6 left-6 z-30 fixed'>
				<button
					type='button'
					onClick={() => navigate({ to: '/' })}
					class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer'
				>
					<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
					<ArrowLeft class='relative' size={12} />
					<span class='relative'>Back</span>
				</button>
			</div>

			<h1 class='mb-2 font-semibold text-4xl text-white tracking-tight'>Get in Touch</h1>
			<p class='mb-8 text-neutral-400'>{site.location}</p>

			<div class='flex flex-col gap-3'>
				<For each={links()}>
					{(link) => (
						<a
							href={link.href}
							target='_blank'
							rel='noopener noreferrer'
							class='group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-4 py-2.5 border border-white/10 hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300'
						>
							<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
							<span class='relative'>{link.text}</span>
						</a>
					)}
				</For>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/contact')({
	component: Contact,
});
