import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkFrontmatter from 'remark-frontmatter';
import compression from 'vite-plugin-compression';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import solid from 'vite-plugin-solid';
import mdx from '@mdx-js/rollup';
import path from 'node:path';

const config: UserConfig = {
	plugins: [
		{
			enforce: 'pre',
			...mdx({ jsx: true, remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
		},
		TanStackRouterVite({
			target: 'solid',
			autoCodeSplitting: true,
		}),
		tailwindcss(),
		compression(),
		solid({ extensions: ['.mdx'] }),
	],
	build: {
		minify: 'esbuild',
	},
	resolve: {
		conditions: ['solid'],
		tsconfigPaths: true,
		alias: [
			{ find: '~', replacement: path.resolve(__dirname, 'src') },
			{ find: '@', replacement: __dirname },
		],
	},
	server: {
		host: true,
		port: 80,
	},
};

export default config;
