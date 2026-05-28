/// <reference types='vite/client' />

import '@total-typescript/ts-reset';

declare module '*.mdx' {
	import type { Component } from 'solid-js';

	import type { Project } from '~/content/projects';
	const MDXComponent: Component;
	export default MDXComponent;
	export const frontmatter: Project;
}

declare global {
	type CardHighlights = 'red' | 'blue' | 'green' | 'purple' | 'white';
}
