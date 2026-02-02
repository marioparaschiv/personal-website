import { memo, type ComponentProps } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

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
					'overflow-hidden md:-mt-[5dvh] flex flex-col gap-[10px] before:pointer-events-none before:fixed before:inset-0 before:-top-64 before:bg-grid before:bg-top before:bg-no-repeat before:opacity-70',
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
