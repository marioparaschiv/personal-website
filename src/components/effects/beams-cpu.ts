import { createCpuCanvas, type CpuFrame } from './create-cpu-canvas';

type BeamsFallbackOptions = {
	beamWidth: number;
	beamHeight: number;
	beamNumber: number;
	speed: number;
	scale: number;
	rotation: number;
	noiseIntensity: number;
};

// Matches beams.tsx: the camera, light placement, segment count and material are fixed there too.
const CAMERA_Z = 20;
const HALF_FOV_TAN = Math.tan((15 * Math.PI) / 180);
const SEGMENTS = 100;
const A2 = (0.3 * 0.3) ** 2;
const SPECULAR_F0 = 0.04 * (1 - 0.3);
const LUT_SIZE = 1024;

const mod289 = (x: number) => x - Math.floor(x / 289) * 289;
const permute = (x: number) => mod289((x * 34 + 1) * x);
const fract = (x: number) => x - Math.floor(x);
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const corner = new Float64Array(8);

// Port of the shader's classic Perlin cnoise(vec3), one lattice corner at a time.
function cnoise(px: number, py: number, pz: number): number {
	const fx = Math.floor(px);
	const fy = Math.floor(py);
	const fz = Math.floor(pz);
	const pf0x = px - fx;
	const pf0y = py - fy;
	const pf0z = pz - fz;

	for (let c = 0; c < 8; c++) {
		const dx = c & 1;
		const dy = (c >> 1) & 1;
		const dz = c >> 2;
		const hash = permute(permute(permute(mod289(fx + dx)) + mod289(fy + dy)) + mod289(fz + dz));

		let gx = hash / 7;
		let gy = fract(Math.floor(gx) / 7) - 0.5;

		gx = fract(gx);

		const gz = 0.5 - Math.abs(gx) - Math.abs(gy);

		if (gz <= 0) {
			gx -= gx < 0 ? -0.5 : 0.5;
			gy -= gy < 0 ? -0.5 : 0.5;
		}

		const norm = 1.79284291400159 - 0.85373472095314 * (gx * gx + gy * gy + gz * gz);

		corner[c] = norm * (gx * (pf0x - dx) + gy * (pf0y - dy) + gz * (pf0z - dz));
	}

	const u = fade(pf0x);
	const v = fade(pf0y);
	const w = fade(pf0z);
	const x0 = mix(mix(corner[0], corner[4], w), mix(corner[2], corner[6], w), v);
	const x1 = mix(mix(corner[1], corner[5], w), mix(corner[3], corner[7], w), v);

	return 2.2 * mix(x0, x1, u);
}

const srgbLut = Uint8ClampedArray.from({ length: LUT_SIZE + 1 }, (_, i) => {
	const c = i / LUT_SIZE;

	return (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055) * 255;
});

function mountBeamsFallback(container: HTMLElement, options: BeamsFallbackOptions) {
	const { beamWidth, beamHeight, beamNumber, speed, scale } = options;
	const rad = (options.rotation * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	const xStart = (-beamNumber * beamWidth) / 2;
	const uvOffsets = Array.from({ length: beamNumber }, () => Math.random() * 300);

	// The shader subtracts per-pixel grain from 0 to noiseIntensity / 15. At this resolution the
	// grain itself would smear, so only its average darkening is kept.
	const grainMean = (0.5 / 15) * options.noiseIntensity * 255;

	// The light sits at (0, 3, 10) inside the rotated group and shines at the origin.
	const lightLen = Math.hypot(3, 10);
	const lx = (-3 * sin) / lightLen;
	const ly = (3 * cos) / lightLen;
	const lz = 10 / lightLen;

	// Per-vertex normals in the beam's local frame, as (y, z) pairs: the shader's normal never
	// has an x component because the noise ignores x.
	const normals = new Float64Array(beamNumber * (SEGMENTS + 1) * 2);

	let time = 0;

	function updateNormals() {
		const z = time * speed * 3 * scale;

		for (let b = 0; b < beamNumber; b++) {
			for (let j = 0; j <= SEGMENTS; j++) {
				const y = beamHeight * (j / SEGMENTS - 0.5);
				const uvY = j / SEGMENTS + uvOffsets[b];
				const dz = cnoise(0, (y - 0.01 - uvY) * scale, z) - cnoise(0, (y - uvY) * scale, z);
				const len = Math.hypot(dz, 0.01);
				const k = (b * (SEGMENTS + 1) + j) * 2;

				normals[k] = dz / len;
				normals[k + 1] = 0.01 / len;
			}
		}
	}

	// Specular light leaving one beam at local height t, seen from world point (x, y).
	// The beams are black, so three.js' BRDF_GGX term is all that reaches the screen.
	function shade(beam: number, t: number, x: number, y: number): number {
		if (beam < 0 || beam >= beamNumber || t < 0 || t >= SEGMENTS) return 0;

		const j = Math.floor(t);
		const k = (beam * (SEGMENTS + 1) + j) * 2;
		const ny = mix(normals[k], normals[k + 2], t - j);
		const nz = mix(normals[k + 1], normals[k + 3], t - j);
		const nLen = Math.hypot(ny, nz);
		const nx = (-ny * sin) / nLen;
		const nyw = (ny * cos) / nLen;
		const nzw = nz / nLen;

		const vLen = Math.hypot(x, y, CAMERA_Z);
		const vx = -x / vLen;
		const vy = -y / vLen;
		const vz = CAMERA_Z / vLen;

		const hLen = Math.hypot(lx + vx, ly + vy, lz + vz);
		const hx = (lx + vx) / hLen;
		const hy = (ly + vy) / hLen;
		const hz = (lz + vz) / hLen;

		const dotNL = Math.max(0, nx * lx + nyw * ly + nzw * lz);
		const dotNV = Math.max(0, nx * vx + nyw * vy + nzw * vz);
		const dotNH = Math.max(0, nx * hx + nyw * hy + nzw * hz);
		const dotVH = Math.max(0, vx * hx + vy * hy + vz * hz);

		const fresnel = SPECULAR_F0 + (1 - SPECULAR_F0) * (1 - dotVH) ** 5;
		const gv = dotNL * Math.sqrt(A2 + (1 - A2) * dotNV * dotNV);
		const gl = dotNV * Math.sqrt(A2 + (1 - A2) * dotNL * dotNL);
		const visibility = 0.5 / Math.max(gv + gl, 1e-6);
		const denom = dotNH * dotNH * (A2 - 1) + 1;
		const distribution = A2 / (Math.PI * denom * denom);

		return dotNL * fresnel * visibility * distribution;
	}

	function render(frame: CpuFrame) {
		const { data, width, height } = frame;
		const halfH = HALF_FOV_TAN * CAMERA_Z;
		const halfW = halfH * (width / height);

		// One canvas pixel measured across a beam, used to anti-alias the seams between beams,
		// which would otherwise stair-step once the canvas is upscaled.
		const footprint = (((2 * halfW) / width) * (Math.abs(cos) + Math.abs(sin))) / beamWidth;

		time += 0.1 * frame.delta;
		updateNormals();

		let i = 0;

		for (let row = 0; row < height; row++) {
			const y = (1 - ((row + 0.5) / height) * 2) * halfH;

			for (let col = 0; col < width; col++, i += 4) {
				const x = (((col + 0.5) / width) * 2 - 1) * halfW;
				const u = (x * cos + y * sin - xStart) / beamWidth;
				const t = ((-x * sin + y * cos) / beamHeight + 0.5) * SEGMENTS;
				const seam = Math.round(u);
				const edge = (u - seam) / footprint;

				let linear: number;

				if (edge > -0.5 && edge < 0.5) {
					linear = mix(shade(seam - 1, t, x, y), shade(seam, t, x, y), edge + 0.5);
				} else {
					linear = shade(Math.floor(u), t, x, y);
				}

				const value = srgbLut[Math.round(Math.min(linear, 1) * LUT_SIZE)] - grainMean;

				data[i] = data[i + 1] = data[i + 2] = value;
				data[i + 3] = 255;
			}
		}
	}

	return createCpuCanvas(container, { maxPixels: 120_000, fps: 30, render });
}

export { mountBeamsFallback };
