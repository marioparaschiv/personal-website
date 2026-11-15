type CpuFrame = {
	data: Uint8ClampedArray;
	width: number;
	height: number;
	delta: number;
	elapsed: number;
};

type CpuCanvasOptions = {
	// Pixels shaded per frame. The canvas renders below screen resolution and the browser
	// upscales it, which keeps the per-pixel JS cost bounded on large screens.
	maxPixels: number;
	fps: number;
	render: (frame: CpuFrame) => void;
};

type CpuCanvas = {
	canvas: HTMLCanvasElement;
	dispose: () => void;
};

function createCpuCanvas(container: HTMLElement, options: CpuCanvasOptions): CpuCanvas | null {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) return null;

	canvas.style.display = 'block';
	canvas.style.width = '100%';
	canvas.style.height = '100%';

	container.appendChild(canvas);

	let image: ImageData | null = null;

	const resize = (width: number, height: number) => {
		if (width === 0 || height === 0) return;

		const scale = Math.min(1, Math.sqrt(options.maxPixels / (width * height)));

		canvas.width = Math.max(1, Math.round(width * scale));
		canvas.height = Math.max(1, Math.round(height * scale));
		image = ctx.createImageData(canvas.width, canvas.height);
	};

	const { width, height } = container.getBoundingClientRect();

	resize(width, height);

	const observer = new ResizeObserver((entries) => {
		const entry = entries[0];

		if (!entry) return;

		resize(entry.contentRect.width, entry.contentRect.height);
	});

	observer.observe(container);

	const frameInterval = 1000 / options.fps;
	let start: number | null = null;
	let last = 0;
	let frameId = 0;

	const tick = (timestamp: number) => {
		frameId = requestAnimationFrame(tick);

		start ??= timestamp;

		if (timestamp - last < frameInterval || !image) return;

		const delta = last === 0 ? frameInterval / 1000 : (timestamp - last) / 1000;

		last = timestamp;

		options.render({
			data: image.data,
			width: image.width,
			height: image.height,
			delta,
			elapsed: (timestamp - start) / 1000,
		});

		ctx.putImageData(image, 0, 0);
	};

	frameId = requestAnimationFrame(tick);

	function dispose() {
		cancelAnimationFrame(frameId);
		observer.disconnect();
		canvas.remove();
	}

	return { canvas, dispose };
}

export { createCpuCanvas };
export type { CpuCanvas, CpuFrame };
