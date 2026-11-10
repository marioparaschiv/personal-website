import { Brain, Ghost, Library, type LucideIcon, Network, Puzzle } from 'lucide-solid';

type OtherWork = {
	name: string;
	description: string;
	language: string;
	/** Omitted for private repositories. */
	url?: string;
	icon: LucideIcon;
	stars?: number;
	span?: string;
	/** Leads the grid at full width on phones, the only tile that keeps its visual there. */
	featured?: boolean;
};

const github = (repo: string) => `https://github.com/marioparaschiv/${repo}`;

const otherWork: OtherWork[] = [
	{
		name: 'hivemind',
		description: 'Real-time market intelligence platform.',
		language: 'Rust',
		icon: Brain,
		span: 'col-span-2 sm:row-span-2',
		featured: true,
	},
	{
		name: 'enmity',
		description:
			"The first mod for Discord's React Native app on iOS. A native tweak loads a JavaScript bundle before Discord starts, and plugins patch Discord from there. Superseded by Unbound.",
		language: 'TypeScript',
		url: 'https://github.com/enmity-mod',
		icon: Puzzle,
		stars: 499,
		span: 'sm:col-span-2',
	},
	{
		name: 'trove',
		description: 'Local semantic search for your notes, on-device with llama.cpp and EmbeddingGemma.',
		language: 'Rust',
		url: github('trove'),
		icon: Library,
		span: 'sm:col-span-2',
	},
	{
		name: 'possess',
		description: 'Structured monkey-patching for JS and TS, with clean undo.',
		language: 'TypeScript',
		url: github('possess'),
		icon: Ghost,
		span: 'sm:col-span-2',
	},
	{
		name: 'tailnet-connector',
		description:
			"Shares a machine's local MCP servers with a Tailnet hub so agents can use them remotely.",
		language: 'Rust',
		url: github('tailnet-connector'),
		icon: Network,
		span: 'sm:col-span-2',
	},
];

export { otherWork };
export type { OtherWork };
