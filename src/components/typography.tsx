import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/utils';

interface TypographyProps
	extends VariantProps<typeof TypographyVariants>, React.HTMLProps<HTMLElement> {
	margin?: boolean;
	border?: boolean;
	padding?: boolean;
}

const TypographyVariants = cva('truncate', {
	variants: {
		tag: {
			h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
			h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
			h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
			h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
			h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
			h6: 'scroll-m-20 text-md font-semibold tracking-tight',
			p: '',
			blockquote: 'mt-6 border-l-2 pl-6 italic',
			code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
		},
		colour: {
			normal: 'text-normal-foreground',
			muted: 'text-foreground-secondary',
			destructive: 'text-destructive',
			white: 'text-white',
		},
	},
	defaultVariants: {
		tag: 'p',
		colour: 'white',
	},
});

export function Typography({
	tag,
	colour,
	border = true,
	margin = true,
	padding = true,
	children,
	className,
}: TypographyProps) {
	const Tag = (tag as keyof JSX.IntrinsicElements) ?? 'p';

	return (
		<Tag
			className={cn(
				TypographyVariants({ tag, colour }),
				className,
				!margin && '!m-0',
				!border && '!border-none',
				!padding && '!p-0',
			)}
		>
			{children}
		</Tag>
	);
}

export default Typography;
