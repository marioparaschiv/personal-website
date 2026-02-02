import config from '@config.json';

import { useBreakpoint } from '~/components/hooks';
import { Technologies } from '~/constants';
import { cn } from '~/utils';

interface TechnologiesProps extends React.HTMLProps<HTMLSpanElement> {
	technologies?: string[];
	order?: string[];
	identifierProps?: React.ComponentProps<'span'>;
}

function TechnologiesList({
	order = config.technologiesOrder,
	technologies,
	...props
}: TechnologiesProps) {
	const isMedium = useBreakpoint('md');

	if (!technologies || !Array.isArray(technologies)) return null;

	const entities = technologies
		.map((t) => Technologies.find((i) => i.name === t))
		.filter(Boolean);
	const items = order
		? entities.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
		: entities;

	return (
		<span
			{...props}
			className={cn(
				'grid lg:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:g:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4',
				props.className,
			)}
		>
			{items.map((technology) => {
				const Icon = technology.icon;

				return (
					<div className='flex items-center gap-2 md:gap-3' key={technology.name}>
						{Icon && (
							<Icon
								className='text-neutral-200 shrink-0'
								width={isMedium ? 18 : 14}
								height={isMedium ? 18 : 14}
							/>
						)}
						<span
							{...(props.identifierProps ?? {})}
							className={cn('truncate text-sm', props.identifierProps?.className)}
						>
							{technology.name}
						</span>
					</div>
				);
			})}
		</span>
	);
}

export default TechnologiesList;
