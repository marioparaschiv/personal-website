import { Cable, Send, MessagesSquare, AtSign, Webhook } from 'lucide-solid';
import type { Component } from 'solid-js';
import { For } from 'solid-js';

import { cn } from '~/utils';

type Source = {
	label: string;
	icon: Component<{ size?: number; class?: string }>;
	// Chip anchor and wire end, in px from the project icon's centre.
	x: number;
	y: number;
	endY: number;
};

const SOURCES: Source[] = [
	{ label: 'Discord', icon: MessagesSquare, x: -300, y: -64, endY: -12 },
	{ label: 'Telegram', icon: Send, x: -360, y: 8, endY: 0 },
	{ label: 'X', icon: AtSign, x: -290, y: 80, endY: 12 },
	{ label: 'Webhooks', icon: Webhook, x: 300, y: -44, endY: -8 },
	{ label: 'WebSocket', icon: Cable, x: 350, y: 52, endY: 8 },
];

// Half the icon's width plus a small gap, so wires stop at its edge.
const PORT_X = 44;

// Matches the header layout: `pt-28` plus half of the `h-16` icon.
const ICON_CENTER_Y = 144;

function wirePath(source: Source) {
	const endX = Math.sign(source.x) * PORT_X;
	const midX = (source.x + endX) / 2;

	return `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${source.endY}, ${endX} ${source.endY}`;
}

/** Five sources wired into the project icon, with pulses travelling inward. */
function IngestWires() {
	return (
		<div
			aria-hidden='true'
			class='max-sm:hidden top-0 z-1 absolute inset-x-0 h-dvh overflow-hidden pointer-events-none'
		>
			<div class='absolute left-1/2 size-0' style={{ top: `${ICON_CENTER_Y}px` }}>
				<div class='absolute bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)] -m-40 size-80' />

				<svg
					class='absolute overflow-visible'
					style={{ left: '-600px', top: '-200px' }}
					width='1200'
					height='400'
					viewBox='-600 -200 1200 400'
					fill='none'
				>
					<For each={SOURCES}>
						{(source, i) => {
							const d = wirePath(source);
							const delay = 300 + i() * 90;

							return (
								<g>
									<path
										d={d}
										pathLength={100}
										stroke='rgba(255,255,255,0.14)'
										stroke-width='1'
										stroke-dasharray='100'
										class='motion-safe:animate-[wire-draw_900ms_cubic-bezier(0.23,1,0.32,1)_both]'
										style={{ 'animation-delay': `${delay}ms` }}
									/>
									<path
										d={d}
										pathLength={100}
										stroke='white'
										stroke-width='1.5'
										stroke-linecap='round'
										stroke-dasharray='14 200'
										stroke-dashoffset='14'
										class='drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] motion-safe:animate-[wire-pulse_2.4s_cubic-bezier(0.55,0,0.45,1)_infinite]'
										style={{
											'animation-delay': `${delay + 900 + i() * 520}ms`,
											'animation-duration': `${2.2 + (i() % 3) * 0.45}s`,
										}}
									/>
									<circle
										cx={Math.sign(source.x) * PORT_X}
										cy={source.endY}
										r='1.5'
										fill='rgba(255,255,255,0.5)'
									/>
								</g>
							);
						}}
					</For>
				</svg>

				<For each={SOURCES}>
					{(source, i) => (
						<div
							class={cn(
								'absolute -translate-y-1/2',
								source.x < 0 && '-translate-x-full',
							)}
							style={{ left: `${source.x}px`, top: `${source.y}px` }}
						>
							<div
								class='flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-sm px-3 py-1 border border-white/10 rounded-full text-neutral-300 text-xs stagger'
								style={{ '--stagger': String(2 + i()) }}
							>
								<source.icon size={12} class='text-neutral-400' />
								{source.label}
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}

export default IngestWires;
