import * as THREE from 'three';

interface ThreeCanvasOptions {
	dpr?: number | [number, number];
	antialias?: boolean;
	preserveDrawingBuffer?: boolean;
	camera?: {
		position?: [number, number, number];
		fov?: number;
	};
}

interface ThreeCanvas {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	timer: THREE.Timer;
	startLoop: (callback: (delta: number, elapsed: number) => void) => void;
	dispose: () => void;
}

function resolveDevicePixelRatio(dpr: number | [number, number] | undefined): number {
	const deviceDpr = globalThis.devicePixelRatio ?? 1;

	if (dpr === undefined) {
		return deviceDpr;
	}

	if (typeof dpr === 'number') {
		return dpr;
	}

	return Math.min(Math.max(deviceDpr, dpr[0]), dpr[1]);
}

function createThreeCanvas(container: HTMLElement, options: ThreeCanvasOptions = {}): ThreeCanvas {
	const { width, height } = container.getBoundingClientRect();
	const devicePixelRatio = resolveDevicePixelRatio(options.dpr);

	const renderer = new THREE.WebGLRenderer({
		antialias: options.antialias ?? false,
		preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
	});
	renderer.setPixelRatio(devicePixelRatio);
	renderer.setSize(width, height);

	const canvas = renderer.domElement;

	canvas.style.display = 'block';
	canvas.style.width = '100%';
	canvas.style.height = '100%';

	container.appendChild(canvas);

	const fov = options.camera?.fov ?? 75;

	const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
	const scene = new THREE.Scene();
	const timer = new THREE.Timer();

	const pos = options.camera?.position ?? [0, 0, 5];

	camera.position.set(...pos);

	const observer = new ResizeObserver((entries) => {
		const entry = entries[0];
		if (!entry) return;

		const { width: w, height: h } = entry.contentRect;
		if (w === 0 || h === 0) return;

		renderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	});

	observer.observe(container);

	let frameId = 0;

	function startLoop(callback: (delta: number, elapsed: number) => void) {
		function tick() {
			const delta = timer.getDelta();
			const elapsed = timer.getElapsed();

			callback(delta, elapsed);

			frameId = requestAnimationFrame(tick);
		}

		frameId = requestAnimationFrame(tick);
	}

	function dispose() {
		cancelAnimationFrame(frameId);

		observer.disconnect();
		renderer.dispose();

		if (canvas.parentElement) {
			canvas.parentElement.removeChild(canvas);
		}
	}

	return { scene, camera, renderer, timer, startLoop, dispose };
}

export { createThreeCanvas };
export type { ThreeCanvas, ThreeCanvasOptions };
