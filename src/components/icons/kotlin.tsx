import type { JSX } from 'solid-js';

function Kotlin(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1em'
			height='1em'
			viewBox='0 0 24 24'
			{...props}
		>
			<path fill='currentColor' d='M2 2h20L12 12l10 10H2Z' />
		</svg>
	);
}

export default Kotlin;
