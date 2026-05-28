import { RouterProvider, createRouter } from '@tanstack/solid-router';
import { MetaProvider } from '@solidjs/meta';

import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/solid-router' {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return (
		<MetaProvider>
			<RouterProvider router={router} />
		</MetaProvider>
	);
}

export default App;
