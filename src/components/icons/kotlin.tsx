import type { SVGProps } from 'react';

function Kotlin(props: SVGProps<SVGSVGElement>) {
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
