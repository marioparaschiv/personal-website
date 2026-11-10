import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Dialog } from '@kobalte/core/dialog';
import { Lock } from 'lucide-solid';

type PrivateNoticeProps = {
	/** The private project's name, or null when the notice is closed. */
	name: string | null;
	onClose: () => void;
};

// Matches the `countdown` bar in styles.css.
const DISMISS_MS = 2500;

// A fast second click on the card lands on the backdrop; this keeps it from closing the notice.
const IGNORE_DISMISS_MS = 400;

/** Brief notice for private Other Work cards; closes itself once the bar runs out. */
function PrivateNotice(props: PrivateNoticeProps) {
	let openedAt = 0;

	// Outlives `name` so the title stays put while the notice animates out.
	const [title, setTitle] = createSignal('');

	function dismiss() {
		if (performance.now() - openedAt < IGNORE_DISMISS_MS) return;

		props.onClose();
	}

	createEffect(() => {
		if (!props.name) return;

		openedAt = performance.now();
		setTitle(props.name);

		const timer = setTimeout(() => props.onClose(), DISMISS_MS);

		onCleanup(() => clearTimeout(timer));
	});

	// The home page snaps sections on arrow keys at `document`, so keys stop here; Escape is
	// handled by hand because that also hides it from Kobalte. A native `on:` listener, since
	// Solid delegates `onKeyDown` to `document`, where stopping it is too late.
	function onKeyDown(event: KeyboardEvent) {
		event.stopPropagation();

		if (event.key === 'Escape') dismiss();
	}

	return (
		<Dialog
			open={props.name !== null}
			onOpenChange={(open) => {
				if (!open) dismiss();
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay class='z-40 fixed inset-0 bg-black/40 overlay-fade' />
				<div class='z-40 fixed inset-0 flex justify-center items-center p-6 pointer-events-none'>
					<Dialog.Content
						on:keydown={onKeyDown}
						onClick={dismiss}
						class='relative flex flex-col items-center gap-3 bg-neutral-950/90 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.75)] backdrop-blur-xl px-8 pt-7 pb-8 border border-white/15 outline-hidden w-full max-w-xs overflow-hidden text-center cursor-pointer pointer-events-auto notice-pop'
					>
						<span class='flex justify-center items-center bg-white/5 border border-white/20 size-11 text-white'>
							<Lock size={16} />
						</span>

						<Dialog.Title class='font-semibold text-white tracking-tight'>
							{title()}
						</Dialog.Title>

						<Dialog.Description class='font-light text-[11px] text-neutral-400 uppercase tracking-widest'>
							This project is not for public use or open source
						</Dialog.Description>

						<span class='bottom-0 left-0 absolute bg-white/10 w-full h-0.5'>
							<span class='block bg-white/70 h-full origin-left countdown' />
						</span>
					</Dialog.Content>
				</div>
			</Dialog.Portal>
		</Dialog>
	);
}

export default PrivateNotice;
