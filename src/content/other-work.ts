import {
	ArrowDownWideNarrow,
	AudioLines,
	Crosshair,
	Ghost,
	KeyRound,
	type LucideIcon,
	Network,
	ShieldCheck,
	Smartphone,
	UserCog,
} from 'lucide-solid';

type OtherWork = {
	name: string;
	description: string;
	language: string;
	url: string;
	icon: LucideIcon;
	stars?: number;
	span?: string;
};

const github = (repo: string) => `https://github.com/marioparaschiv/${repo}`;

const otherWork: OtherWork[] = [
	{
		name: 'testflight-sniper',
		description:
			'Watches TestFlight betas and tells you the moment a slot opens up, so you stop refreshing full betas by hand.',
		language: 'JavaScript',
		url: github('testflight-sniper'),
		icon: Crosshair,
		stars: 23,
		span: 'sm:col-span-2',
	},
	{
		name: 'lastfm-yt-music',
		description: 'Scrobbles everything you play in the YouTube Music iOS app to Last.fm.',
		language: 'Logos',
		url: github('lastfm-yt-music'),
		icon: AudioLines,
		stars: 14,
	},
	{
		name: 'possess',
		description:
			'Structured monkey-patching for JavaScript and TypeScript. Run code before, instead of or after any function or constructor, then undo it cleanly. Unbound patches Discord with it.',
		language: 'TypeScript',
		url: github('possess'),
		icon: Ghost,
		span: 'sm:row-span-2',
	},
	{
		name: 'discord.self',
		description: 'The discord.js API you already know, with support for user accounts.',
		language: 'TypeScript',
		url: github('discord.self'),
		icon: UserCog,
	},
	{
		name: 'sideload-fix',
		description:
			'Keeps re-signed iOS apps working after sideloading: keychain, app groups, CloudKit and alternate app icons.',
		language: 'Logos',
		url: github('sideload-fix'),
		icon: KeyRound,
		span: 'sm:col-span-2',
	},
	{
		name: 'vyprvpn-native',
		description: 'A lightweight native VyprVPN tray client for Windows and macOS.',
		language: 'Rust',
		url: github('vyprvpn-native'),
		icon: ShieldCheck,
	},
	{
		name: 'tailnet-connector',
		description:
			"Shares a machine's local MCP servers with a Tailnet hub so agents can use them remotely.",
		language: 'Rust',
		url: github('tailnet-connector'),
		icon: Network,
	},
	{
		name: 'vphone-mcp',
		description: 'MCP server for iOS work in a jailbroken VM: IPAs, tweaks, app data and logs.',
		language: 'Python',
		url: github('vphone-mcp'),
		icon: Smartphone,
	},
	{
		name: 'vscode-import-sorter',
		description:
			'A VS Code extension that sorts JS and TS imports in a consistent, configurable order.',
		language: 'TypeScript',
		url: github('vscode-import-sorter'),
		icon: ArrowDownWideNarrow,
		span: 'col-span-2 sm:col-span-1',
	},
];

export { otherWork };
export type { OtherWork };
