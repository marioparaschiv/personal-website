import React from 'react';

import { cn } from '~/utils';

function Tag({ children, className, style, ...rest }: React.HTMLProps<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'flex w-fit items-center font-normal justify-center rounded-full border border-brand/40 bg-brand/10 py-1 px-2.5 text-center text-xs text-gray-200/90 transition-all md:py-1.5 md:px-3 md:font-medium',
				className,
			)}
			style={{ filter: 'saturate(1.5)', ...style }}
			{...rest}
		>
			{children}
		</div>
	);
}

export default Tag;
