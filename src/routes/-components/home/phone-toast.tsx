import { For } from 'solid-js';

type PhoneToastProps = {
	/** 0 hides the toast above the island, 1 settles it below. */
	toast: number;
};

const ROWS = ['w-16', 'w-24', 'w-12', 'w-20'];

function StatusIcons() {
	return (
		<span class='flex items-center gap-1'>
			<span class='flex items-end gap-px h-2'>
				<For each={['h-1', 'h-1.5', 'h-2']}>
					{(height) => <span class={`bg-white/70 w-0.5 ${height}`} />}
				</For>
			</span>
			<span class='relative border border-white/50 rounded-[2px] w-3.5 h-2'>
				<span class='absolute inset-px bg-white/70 rounded-[1px] w-2' />
			</span>
		</span>
	);
}

function PhoneToast(props: PhoneToastProps) {
	return (
		<div class='@container relative flex flex-col bg-neutral-950 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] px-3 pt-2 border border-white/15 border-b-0 rounded-t-[22px] h-full overflow-hidden'>
			<div class='flex justify-between items-center font-medium text-[9px] text-white/80 tabular-nums'>
				<span class='flex-1'>9:41</span>
				<span class='bg-black border border-white/10 rounded-full w-14 h-4 shrink' />
				<span class='flex flex-1 justify-end'>
					<StatusIcons />
				</span>
			</div>

			<div class='flex flex-col gap-2 mt-4 px-1'>
				<For each={ROWS}>
					{(width) => (
						<span class='flex items-center gap-2'>
							<span class='bg-white/10 rounded-full w-3 h-3 shrink-0' />
							<span class={`bg-white/10 h-1 ${width}`} />
						</span>
					)}
				</For>
			</div>

			<div
				class='top-1.5 left-1/2 absolute flex items-center gap-1.5 bg-neutral-800/95 shadow-black/60 shadow-lg px-2 @[8.5rem]:pr-3 @[8.5rem]:pl-1 py-1 border border-white/10 rounded-full max-w-[calc(100%-1rem)] whitespace-nowrap'
				style={{
					transform: `translate(-50%, ${(props.toast - 1) * 120 + props.toast * 22}px) scale(${0.85 + props.toast * 0.15})`,
					opacity: Math.min(Math.max(props.toast * 1.5, 0), 1),
				}}
			>
				<img
					class='hidden @[8.5rem]:block rounded-full w-4 h-4 shrink-0'
					src='/img/projects/enmity/icon.png'
					alt=''
				/>
				<span class='min-w-0 text-[8px] @[8.5rem]:text-[10px] text-white truncate'>
					Enmity has loaded
				</span>
			</div>
		</div>
	);
}

export default PhoneToast;
