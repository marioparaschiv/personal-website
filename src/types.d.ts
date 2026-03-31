/// <reference types='vite/client' />

import '@total-typescript/ts-reset';

declare module '*.mdx' {
	import type { ComponentType } from 'react';
	const Component: ComponentType;
	export default Component;
}

declare global {
	/* Components */
	type CardHighlights = 'red' | 'blue' | 'green' | 'purple' | 'white';

	type Page = {
		element: React.ComponentType;
		path: string;
	};

	interface ContactCardProps {
		name: string;
		href: string;
		body: string;
		icon: React.ReactNode;
		color: CardHighlights;
		className?: string;
	}

	/* Utilities */
	type ArrayToTuple<T extends ReadonlyArray<any>> = keyof {
		[K in T extends ReadonlyArray<infer U> ? U : never]: T[K];
	};
}
