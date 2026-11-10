import { readdir, stat } from 'node:fs/promises';
import { rgbaToThumbHash } from 'thumbhash';
import type { Plugin } from 'vite';
import path from 'node:path';
import sharp from 'sharp';

type CachedHash = {
	mtime: number;
	hash: string;
};

const MODULE_ID = 'virtual:thumbhashes';
const RESOLVED_ID = `\0${MODULE_ID}`;

const IMAGE = /\.(webp|png|jpe?g)$/i;

// Strip thumbnails share their original's placeholder; icons are tiny and need none.
const SKIP = /\.thumb\.webp$|(^|\/)icon\.png$/;

// ThumbHash encodes images of at most 100x100.
const MAX_SIDE = 100;

const cache = new Map<string, CachedHash>();

async function hashImage(file: string) {
	const { data, info } = await sharp(file)
		.resize(MAX_SIDE, MAX_SIDE, { fit: 'inside' })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString('base64');
}

async function cachedHash(file: string) {
	const { mtimeMs } = await stat(file);
	const cached = cache.get(file);

	if (cached?.mtime === mtimeMs) return cached.hash;

	const hash = await hashImage(file);

	cache.set(file, { mtime: mtimeMs, hash });

	return hash;
}

/**
 * Exposes `virtual:thumbhashes`: a map from each image's public URL under `dir` to its base64
 * ThumbHash, so images can paint a blurred preview while the real file loads.
 */
function thumbhash(dir: string): Plugin {
	let root = process.cwd();

	return {
		name: 'thumbhash',

		configResolved(config) {
			root = config.root;
		},

		resolveId(id) {
			if (id === MODULE_ID) return RESOLVED_ID;
		},

		async load(id) {
			if (id !== RESOLVED_ID) return;

			const publicDir = path.join(root, 'public');
			const base = path.join(publicDir, dir);
			const files = (await readdir(base, { recursive: true }))
				.map((file) => file.split(path.sep).join('/'))
				.filter((file) => IMAGE.test(file) && !SKIP.test(file));

			const entries = await Promise.all(
				files.map(async (file) => {
					const absolute = path.join(base, file);

					this.addWatchFile(absolute);

					return [`/${dir}/${file}`, await cachedHash(absolute)] as const;
				}),
			);

			return `export default ${JSON.stringify(Object.fromEntries(entries))};`;
		},
	};
}

export default thumbhash;
