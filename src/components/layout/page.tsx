import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { memo } from 'react';

import { DarkVeilProvider } from '~/components/effects/dark-veil';
import { cn } from '~/utils';

interface PageProps {
	containerProps?: React.HTMLProps<HTMLDivElement>;
	before?: JSX.Element;
	after?: JSX.Element;
	className?: string;
	section?: string;
}

function Page({
	section,
	before,
	after,
	children,
	className,
	containerProps,
	...props
}: React.PropsWithChildren<PageProps>) {
	return (
		<DarkVeilProvider>
			<div {...containerProps}>
				<Helmet>
					<title>
						{[section && `${section} »`, 'Mario Paraschiv'].filter(Boolean).join(' ')}
					</title>
				</Helmet>
				<div {...props} className={cn('flex flex-col gap-2.5 overflow-hidden', className)}>
					<Outlet />
				</div>
			</div>
		</DarkVeilProvider>
	);
}

export default memo(Page);
