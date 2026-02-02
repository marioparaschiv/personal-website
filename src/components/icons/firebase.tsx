import type { SVGProps } from 'react';

function Firebase(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1em'
			height='1em'
			viewBox='0 0 24 24'
			{...props}
		>
			<path
				fill='currentColor'
				d='m20 18.69l-7.3 4.05c-.5.26-1 .26-1.5 0L4 18.69L17.05 5.54l.35-.1c.3 0 .47.13.5.4zM9.35 5.74L4.8 13.29L6.7 1.34c.03-.27.2-.4.5-.4c.2 0 .33.06.4.25l2.15 3.95zM13.85 7L4.3 16.59l7.25-12.3c.1-.2.25-.29.45-.29s.33.09.4.29z'
			/>
		</svg>
	);
}

export default Firebase;
