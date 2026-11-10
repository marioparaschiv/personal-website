import { thumbHashToDataURL } from 'thumbhash';
import hashes from 'virtual:thumbhashes';
import type { JSX } from 'solid-js';

const decoded = new Map<string, string>();

function dataUrl(src: string) {
	const cached = decoded.get(src);

	if (cached) return cached;

	const hash = hashes[src];

	if (!hash) return;

	const url = thumbHashToDataURL(Uint8Array.from(atob(hash), (char) => char.charCodeAt(0)));

	decoded.set(src, url);

	return url;
}

/**
 * Paints an image's ThumbHash behind it, so the blurred preview shows until the file loads and
 * then sits hidden underneath. Pass the original image's URL.
 */
function placeholder(src: string): JSX.CSSProperties | undefined {
	const url = dataUrl(src);

	if (!url) return;

	return { 'background-image': `url(${url})`, 'background-size': 'cover' };
}

export default placeholder;
