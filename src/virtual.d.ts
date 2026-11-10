// Kept separate from types.d.ts: that file has imports, which would make this a module augmentation of a module that doesn't exist.
declare module 'virtual:thumbhashes' {
	/** Public image URL to its base64 ThumbHash; see `vite/thumbhash.ts`. */
	const hashes: Partial<Record<string, string>>;
	export default hashes;
}
