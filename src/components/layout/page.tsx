import { memo, type ComponentProps } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Header from '~/components/header';
import { cn } from '~/utils';

interface PageProps {
	headerProps?: ComponentProps<typeof Header>;
	bodyProps?: React.HTMLProps<HTMLDivElement>;
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
	headerProps,
	bodyProps,
	...props
}: React.PropsWithChildren<PageProps>) {
	return (
		<div {...bodyProps}>
			<Helmet>
				<title>
					{[section && `${section} »`, 'Mario Paraschiv'].filter(Boolean).join(' ')}
				</title>
			</Helmet>
			<Header key='header' {...(headerProps ?? {})} />
			{before ? before : ''}
			<div
				{...props}
				className={cn(
					'before:-top-64 before:fixed before:inset-0 flex flex-col gap-[10px] before:bg-grid before:bg-no-repeat before:bg-top before:opacity-70 md:-mt-[5dvh] overflow-hidden before:pointer-events-none',
					className,
				)}
			>
				<Outlet />
			</div>
			{after ? after : ''}
		</div>
	);
}

export default memo(Page);
