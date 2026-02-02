import ReactDOM from 'react-dom/client';
import React from 'react';

import App from './app';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
