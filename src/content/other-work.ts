type OtherWork = {
	name: string;
	description: string;
	language: string;
	url: string;
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
		stars: 23,
		span: 'sm:col-span-2',
	},
	{
		name: 'lastfm-yt-music',
		description: 'Scrobbles everything you play in the YouTube Music iOS app to Last.fm.',
		language: 'Logos',
		url: github('lastfm-yt-music'),
		stars: 14,
	},
	{
		name: 'possess',
		description:
			'Structured monkey-patching for JavaScript and TypeScript. Run code before, instead of or after any function or constructor, then undo it cleanly. Unbound patches Discord with it.',
		language: 'TypeScript',
		url: github('possess'),
		span: 'sm:row-span-2 sm:[&_p]:line-clamp-none',
	},
	{
		name: 'discord.self',
		description: 'The discord.js API you already know, with support for user accounts.',
		language: 'TypeScript',
		url: github('discord.self'),
	},
	{
		name: 'sideload-fix',
		description:
			'Keeps re-signed iOS apps working after sideloading: keychain, app groups, CloudKit and alternate app icons.',
		language: 'Logos',
		url: github('sideload-fix'),
		span: 'sm:col-span-2',
	},
	{
		name: 'vyprvpn-native',
		description: 'A lightweight native VyprVPN tray client for Windows and macOS.',
		language: 'Rust',
		url: github('vyprvpn-native'),
	},
	{
		name: 'tailnet-connector',
		description:
			"Shares a machine's local MCP servers with a Tailnet hub so agents can use them remotely.",
		language: 'Rust',
		url: github('tailnet-connector'),
	},
	{
		name: 'vphone-mcp',
		description: 'MCP server for iOS work in a jailbroken VM: IPAs, tweaks, app data and logs.',
		language: 'Python',
		url: github('vphone-mcp'),
	},
	{
		name: 'vscode-import-sorter',
		description:
			'A VS Code extension that sorts JS and TS imports in a consistent, configurable order.',
		language: 'TypeScript',
		url: github('vscode-import-sorter'),
		span: 'col-span-2 sm:col-span-1',
	},
];

export { otherWork };
export type { OtherWork };
