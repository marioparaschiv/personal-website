import { createEffect, createSignal, on, Show } from 'solid-js';
import { ArrowLeft, ArrowRight, X } from 'lucide-solid';
import { Dialog } from '@kobalte/core/dialog';

import { type Project, projects } from '~/content/projects';
import DarkVeil from '~/components/effects/dark-veil';
import HireMe from '~/components/hire-me';
import { swooshSwap } from '~/utils';

import ProjectDetail from '../../projects/-components/project-detail';

type ProjectOverlayProps = {
	projectId: string | null;
	onSelect: (id: string | null) => void;
};

type SavedSheet = {
	id: string;
	scrollTop: number;
};

const navButton =
	'group relative flex items-center gap-2 opacity-70 hover:opacity-100 px-3 py-2 border border-transparent hover:border-white/30 overflow-hidden font-light text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer';

// Survives the home route unmounting, so Back from the contact page reopens the sheet where it was.
let saved: SavedSheet | null = null;

const savedProjectId = () => saved?.id ?? null;

/** Project detail as a sheet over the home page, so closing it lands back where you were. */
function ProjectOverlay(props: ProjectOverlayProps) {
	let scrollRef: HTMLDivElement | undefined;
	let gapRef: HTMLDivElement | undefined;
	let detailRef!: HTMLDivElement;

	const restore = saved;

	// Outlives `projectId` so the sheet keeps its content while it animates closed.
	const [shown, setShown] = createSignal<Project | null>(null);

	const index = () => projects.findIndex((p) => p.id === shown()?.id);
	const prev = () => projects.at(index() - 1)!;
	const next = () => projects[(index() + 1) % projects.length];

	createEffect(
		on(
			() => props.projectId,
			(id, previousId) => {
				const project = projects.find((p) => p.id === id);

				if (!project) {
					saved = null;

					return;
				}

				setShown(project);

				if (restore && restore.id === id && previousId === undefined) {
					requestAnimationFrame(() => scrollRef?.scrollTo({ top: restore.scrollTop }));

					return;
				}

				// Switching projects keeps the sheet's height, but starts the new project at its top.
				const top = previousId
					? Math.min(scrollRef?.scrollTop ?? 0, gapRef?.offsetHeight ?? 0)
					: 0;

				scrollRef?.scrollTo({ top });
				saved = { id: project.id, scrollTop: top };
			},
		),
	);

	function onScroll() {
		if (saved) saved.scrollTop = scrollRef?.scrollTop ?? 0;
	}

	function go(id: string, direction: number) {
		void swooshSwap(detailRef, direction, () => props.onSelect(id));
	}

	// The home page listens for arrow keys and Page Up/Down on `document` to snap sections, so keys
	// stop here. That also hides Escape from Kobalte's document listener, hence closing by hand.
	// A native `on:` listener, since Solid delegates `onKeyDown` to `document`, too late to stop it.
	function onKeyDown(event: KeyboardEvent) {
		event.stopPropagation();

		if (event.key === 'Escape') props.onSelect(null);
	}

	return (
		<Dialog
			open={props.projectId !== null}
			onOpenChange={(open) => {
				if (!open) props.onSelect(null);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay class='z-40 fixed inset-0 bg-black/60 overlay-fade' />
				<Dialog.Content
					on:keydown={onKeyDown}
					class='z-40 fixed inset-0 outline-hidden sheet-slide'
				>
					<Show when={shown()}>
						{(project) => (
							<>
								<Dialog.Title class='sr-only'>{project().name}</Dialog.Title>

								<div
									ref={(el) => (scrollRef = el)}
									onScroll={onScroll}
									class='[&::-webkit-scrollbar]:hidden relative h-full overflow-y-auto [scrollbar-width:none]'
								>
									{/* The sheet grows to full height by scrolling this gap away. Resizing the
									    scroller mid-gesture instead made iOS fling the momentum to the bottom. */}
									<div
										ref={(el) => (gapRef = el)}
										aria-hidden='true'
										class='h-10 sm:h-16'
										onClick={() => props.onSelect(null)}
									/>

									<div class='relative bg-black shadow-[0_-24px_80px_rgba(0,0,0,0.6)] border-white/10 border-t min-h-dvh'>
										{/* The sheet's own veil, pinned to the top of its content like on the project page. */}
										<div class='top-0 z-0 absolute inset-x-0 h-dvh pointer-events-none'>
											<DarkVeil
												target={() => project().hueShift}
												speed={0.3}
												warpAmount={0.5}
											/>
										</div>

										<div class='top-0 z-30 sticky flex justify-between items-center bg-black/30 backdrop-blur-md px-4 sm:px-6 py-4 border-white/5 border-b'>
											<Dialog.CloseButton
												class={navButton}
												aria-label='Close project'
											>
												<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
												<X class='relative' size={12} />
												<span class='relative'>Close</span>
											</Dialog.CloseButton>

											<div class='flex items-center gap-2'>
												<button
													type='button'
													onClick={() => go(prev().id, -1)}
													class={navButton}
												>
													<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
													<ArrowLeft class='relative' size={12} />
													<span class='relative hidden sm:inline'>
														{prev().name}
													</span>
												</button>
												<button
													type='button'
													onClick={() => go(next().id, 1)}
													class={navButton}
												>
													<span class='absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
													<span class='relative hidden sm:inline'>
														{next().name}
													</span>
													<ArrowRight class='relative' size={12} />
												</button>
												<div class='max-sm:hidden ml-4 swish-arrive'>
													<HireMe />
												</div>
											</div>
										</div>

										<div ref={detailRef} class='relative z-10'>
											<Show when={project()} keyed>
												{(p) => <ProjectDetail project={p} />}
											</Show>
										</div>
									</div>
								</div>
							</>
						)}
					</Show>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}

export { savedProjectId };
export default ProjectOverlay;
