import { createCpuCanvas, type CpuFrame } from './create-cpu-canvas';
import { cppnLayers } from './dark-veil-weights';

type DarkVeilFallbackOptions = {
	target: () => number;
	speed: number;
	warpAmount: number;
};

type Layer = {
	out: number;
	inputs: number[];
	weights: Float64Array;
	bias: number[];
};

const layers: Layer[] = cppnLayers.map((layer) => ({
	out: layer.out * 4,
	inputs: layer.inputs.map((input) => input * 4),
	weights: Float64Array.from(layer.weights),
	bias: layer.bias,
}));

const buf = new Float64Array(32);

// A line-for-line port of cppn_fn in dark-veil.tsx. Leaves the colour in buf[0..2].
function cppn(x: number, y: number, in0: number, in1: number, in2: number) {
	buf[24] = x;
	buf[25] = y;
	buf[26] = 0.3948333106474662 + in0;
	buf[27] = 0.36 + in1;
	buf[28] = 0.14 + in2;
	buf[29] = Math.sqrt(x * x + y * y);
	buf[30] = 0;
	buf[31] = 0;

	for (const { out, inputs, weights: w, bias } of layers) {
		let r0 = bias[0];
		let r1 = bias[1];
		let r2 = bias[2];
		let r3 = bias[3];

		for (let k = 0; k < inputs.length; k++) {
			const s = inputs[k];
			const o = k * 16;
			const v0 = buf[s];
			const v1 = buf[s + 1];
			const v2 = buf[s + 2];
			const v3 = buf[s + 3];

			r0 += w[o] * v0 + w[o + 4] * v1 + w[o + 8] * v2 + w[o + 12] * v3;
			r1 += w[o + 1] * v0 + w[o + 5] * v1 + w[o + 9] * v2 + w[o + 13] * v3;
			r2 += w[o + 2] * v0 + w[o + 6] * v1 + w[o + 10] * v2 + w[o + 14] * v3;
			r3 += w[o + 3] * v0 + w[o + 7] * v1 + w[o + 11] * v2 + w[o + 15] * v3;
		}

		buf[out] = 1 / (1 + Math.exp(-r0));
		buf[out + 1] = 1 / (1 + Math.exp(-r1));
		buf[out + 2] = 1 / (1 + Math.exp(-r2));
		buf[out + 3] = 1 / (1 + Math.exp(-r3));
	}
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Mirrors the shader's main() minus scanlines and grain, which the site never turns on and
// which would smear into blotches once the low-resolution canvas is upscaled.
function renderVeil(frame: CpuFrame, time: number, warp: number, hueCos: number, hueSin: number) {
	const { data, width, height } = frame;
	const in0 = 0.1 * Math.sin(0.3 * time);
	const in1 = 0.1 * Math.sin(0.69 * time);
	const in2 = 0.1 * Math.sin(0.44 * time);
	const phase = time * 0.5;

	let i = 0;

	for (let row = 0; row < height; row++) {
		// gl_FragCoord counts rows from the bottom and the shader flips y, so rows map top-down.
		const uy = ((row + 0.5) / height) * 2 - 1;
		const warpX = warp * Math.sin(uy * 6.283 + phase) * 0.05;

		for (let col = 0; col < width; col++) {
			const ux = ((col + 0.5) / width) * 2 - 1;

			cppn(ux + warpX, uy + warp * Math.cos(ux * 6.283 + phase) * 0.05, in0, in1, in2);

			const r = buf[0];
			const g = buf[1];
			const b = buf[2];

			// The shader's mat3 constructors are column-major, so these are its matrices as written.
			const yy = 0.299 * r + 0.596 * g + 0.211 * b;
			const yi = 0.587 * r - 0.274 * g - 0.523 * b;
			const yq = 0.114 * r - 0.322 * g + 0.312 * b;
			const si = yi * hueCos - yq * hueSin;
			const sq = yi * hueSin + yq * hueCos;

			data[i] = clamp01(yy + si + sq) * 255;
			data[i + 1] = clamp01(0.956 * yy - 0.272 * si - 1.106 * sq) * 255;
			data[i + 2] = clamp01(0.621 * yy - 0.647 * si + 1.703 * sq) * 255;
			data[i + 3] = 255;
			i += 4;
		}
	}
}

function mountDarkVeilFallback(container: HTMLElement, options: DarkVeilFallbackOptions) {
	const toRadians = (deg: number) => (deg * Math.PI) / 180;
	const start = toRadians(options.target());

	let hueX = Math.cos(start);
	let hueY = Math.sin(start);

	return createCpuCanvas(container, {
		maxPixels: 12_000,
		fps: 30,
		render: (frame) => {
			const target = toRadians(options.target());
			const t = 1 - Math.exp(-frame.delta * 3);

			hueX += (Math.cos(target) - hueX) * t;
			hueY += (Math.sin(target) - hueY) * t;

			renderVeil(frame, frame.elapsed * options.speed, options.warpAmount, hueX, hueY);
		},
	});
}

export { mountDarkVeilFallback };
