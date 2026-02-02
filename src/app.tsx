import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { Page } from '~/components/layout';
import * as Pages from '~/pages';

const routes = Object.values(Pages).map(({ path, element: Component }: Page) => ({
	path,
	element: <Component />,
}));

const router = createBrowserRouter([
	{
		element: <Page />,
		children: routes.map(({ path, element }) => ({ path, element })),
	},
]);

function App() {
	return (
		<HelmetProvider>
			<RouterProvider router={router} />
		</HelmetProvider>
	);
}

export default App;
