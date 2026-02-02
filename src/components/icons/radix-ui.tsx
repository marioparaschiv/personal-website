import type { SVGProps } from 'react';

export function RadixUI(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1em'
			height='1em'
			viewBox='0 0 24 24'
			{...props}
		>
			<path
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M14 5.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M6 3h5v5H6zm5 8v10a5 5 0 0 1-.217-9.995z'
			/>
		</svg>
	);
}

export default RadixUI;
