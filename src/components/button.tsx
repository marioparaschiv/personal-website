import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { cn } from '~/utils';

const ButtonVariants = cva(
	'inline-flex justify-center items-center disabled:opacity-50 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white ring-offset-background font-medium text-sm transition-colors duration-200 disabled:pointer-events-none',
	{
		variants: {
			variant: {
				default:
					'border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-900/75 backdrop-blur',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground border hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3 text-xs',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export interface ButtonProps
	extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof ButtonVariants> {
	asChild?: boolean;
	ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}

function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['class', 'variant', 'size', 'asChild', 'ref']);

	return (
		<Dynamic
			component={local.asChild ? 'span' : 'button'}
			class={cn(
				'select-none',
				ButtonVariants({
					variant: local.variant,
					size: local.size,
					className: local.class,
				}),
			)}
			ref={local.ref}
			{...rest}
		/>
	);
}

export { Button, ButtonVariants };
export default Button;
