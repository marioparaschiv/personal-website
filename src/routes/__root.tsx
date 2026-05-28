import { Outlet, createRootRoute } from '@tanstack/solid-router';

import { DarkVeilProvider } from '~/components/effects/dark-veil';

function RootLayout() {
	return (
		<DarkVeilProvider>
			<div class='flex flex-col gap-2.5 overflow-hidden'>
				<Outlet />
			</div>
		</DarkVeilProvider>
	);
}

export const Route = createRootRoute({
	component: RootLayout,
});
