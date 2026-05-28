import type { Component } from 'solid-js';

interface Image {
	src: string;
	title: string;
	subtitle: string;
}

interface Badge {
	styles: string;
	text: string;
}

interface Icon {
	path: string;
	styles: string;
}

interface Project {
	name: string;
	id: string;
	order: number;
	hueShift: number;
	type: string;
	timeFrame: string;
	badge?: Badge;
	successor?: string;
	repository?: string | null;
	url?: string | null;
	icon: Icon;
	thumbnail: string;
	images: Image[];
}

interface ProjectModule {
	default: Component<{ components?: Record<string, Component> }>;
	frontmatter: Project;
}

const modules = import.meta.glob<ProjectModule>('./*.mdx', { eager: true });

const entries = Object.values(modules)
	.map((mod) => ({
		...mod.frontmatter,
		Content: mod.default,
	}))
	.sort((a, b) => a.order - b.order);

const projects = entries.map(({ Content: _, ...rest }) => rest);
const contentMap = new Map(entries.map((e) => [e.id, e.Content]));

function getContent(id: string) {
	return contentMap.get(id);
}

export { projects, getContent };
export type { Project, Image, Badge, Icon };
