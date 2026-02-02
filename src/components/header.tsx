import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { animated, easings, useSpringValue } from '@react-spring/web';
import { useLocation, useNavigate } from 'react-router-dom';

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '~/components/navigation-menu';
import * as Pages from '~/pages';
import { cn } from '~/utils';

function Header(props: React.HTMLProps<HTMLElement>) {
	const [isFirstRender, setIsFirstRender] = useState(true);
	const ref = useRef<HTMLAnchorElement | null>(null);
	const navigate = useNavigate();
	const location = useLocation();

	const left = useSpringValue(0);
	const width = useSpringValue(0);
	const height = useSpringValue(0);

	const animateProperties = useCallback(
		(target: HTMLElement | null, immediate: boolean = false) => {
			if (!target) return;

			const rect = target.getBoundingClientRect();

			left[immediate ? 'set' : 'start'](target.offsetLeft, {
				config: {
					duration: 250,
					easing: easings.easeInOutQuad,
				},
			});

			width[immediate ? 'set' : 'start'](rect.width, {
				config: {
					duration: 150,
					easing: easings.easeInOutQuad,
				},
			});

			height[immediate ? 'set' : 'start'](rect.height, {
				config: {
					duration: 150,
					easing: easings.easeInOutQuad,
				},
			});
		},
		[],
	);

	useEffect(() => {
		if (isFirstRender) {
			setIsFirstRender(false);
		}
	}, []);

	useEffect(() => {
		if (!ref.current) return;

		animateProperties(ref.current, isFirstRender);
	}, [ref, location.pathname]);

	// useEffect(() => {
	// 	if (!isFirstRender) return;

	// 	if (ref.current) {
	// 		animateProperties(ref.current, true);
	// 	}
	// }, [ref, isFirstRender]);

	useEffect(() => {
		function onResize() {
			if (!ref.current) return;

			const target = ref.current;

			if (target) {
				animateProperties(target, true);
			}
		}

		window.addEventListener('resize', onResize);

		return () => window.removeEventListener('resize', onResize);
	}, []);

	return (
		<nav
			{...(props as any)}
			key='header'
			className={cn(
				'pointer-events-none transition-color sticky h-[5dvh] z-10 flex w-full items-center justify-center gap-8 mt-6',
				props.className,
			)}
		>
			<div className='flex justify-center items-center gap-4 pointer-events-none container'>
				<NavigationMenu className='flex md:items-center w-full md:w-auto pointer-events-auto bg-secondary/75 backdrop-blur-lg border-2 border-border/50 rounded-full'>
					<animated.div
						className='z-0 min-w-0 min-h-0 absolute bg-primary-foreground rounded-full'
						style={{ height, left, width }}
					/>
					<NavigationMenuList className='relative'>
						{Object.entries(Pages)
							.sort(([, first], [, second]) => first.headerOrder - second.headerOrder)
							.filter(([, instance]) => instance.showInHeader)
							.map(([name, instance]) => {
								const isSelected =
									location.pathname === instance.path ||
									(instance.path !== '/' &&
										location.pathname.startsWith(instance.path));

								return (
									<NavigationMenuItem key={name} asChild>
										<NavigationMenuLink
											href={instance.path}
											ref={(r) => isSelected && (ref.current = r)}
											className={cn(
												'z-10 text-md cursor-pointer select-none transition-colors duration-200 font-semibold',
												isSelected && '!to-neutral-100 p-4',
											)}
											onClick={(e) => (
												e.preventDefault(), navigate(instance.path)
											)}
										>
											{name}
										</NavigationMenuLink>
									</NavigationMenuItem>
								);
							})}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</nav>
	);
}

export default memo(Header);
