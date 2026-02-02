/// <reference types='vite/client' />

import '@total-typescript/ts-reset';

import * as Icons from 'lucide-react';

import * as CustomIcons from '~/components/icons';

declare global {
	/* Components */
	type CardHighlights = 'red' | 'blue' | 'green' | 'purple' | 'white';

	type Page = {
		element: React.ComponentType;
		path: string;
	};

	/* Pages */
	interface AboutItemDetails {
		icon: keyof typeof Icons | keyof typeof CustomIcons;
		highlights: CardHighlights;
		text?: string[];
		items?: AboutItemGridItem[];
		buttons?: AboutItemButton[];
	}

	interface AboutItemButton {
		text: string;
		onClick?: {
			type: 'redirect';
			url?: string;
		};
	}

	interface AboutItemGridItem {
		name: string;
		icon: keyof typeof Icons & keyof typeof ItemIcons;
	}

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
