type RailShape = {
	spread: number;
	stack: number;
	fan: number;
	turn: number;
	depth: number;
	dim: number;
	visible: number;
};

type SlotLayout = {
	x: number;
	z: number;
	rotateY: number;
	rotateZ: number;
	dim: number;
	opacity: number;
	zIndex: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Signed distance from the rail position to an item, taking the shortest way round when looping.
function slotOffset(index: number, position: number, count: number, loop: boolean) {
	const offset = index - position;

	if (!loop || count === 0) return offset;

	return offset - Math.round(offset / count) * count;
}

function slotLayout(offset: number, width: number, shape: RailShape): SlotLayout {
	const distance = Math.abs(offset);
	const side = Math.sign(offset);
	const near = Math.min(distance, 1);
	const far = Math.max(distance - 1, 0);

	return {
		x: side * width * shape.spread * (near + far * (1 - shape.stack * 0.6)),
		z: -width * shape.depth * (near + far * 0.5),
		rotateY: side * near * shape.turn,
		rotateZ: side * (near + far * 0.5) * shape.fan,
		dim: near * shape.dim,
		opacity: clamp(shape.visible + 0.5 - distance, 0, 1),
		zIndex: 100 - Math.round(distance * 10),
	};
}

export { type RailShape, type SlotLayout, clamp, slotOffset, slotLayout };
