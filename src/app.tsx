import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
	return <RouterProvider router={router} />;
}

export default App;
