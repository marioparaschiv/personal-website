import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, createSignal, splitProps } from 'solid-js';

import { cn } from '~/utils';

type CardProps = JSX.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof styles.highlights> & {
		radius?: 'sm' | 'md' | 'lg';
		contentClass?: string | undefined;
	};

const styles = {
	container: cva(
		'group/card relative flex bg-neutral-900/75 hover:shadow-black/5 hover:shadow-md backdrop-blur-lg p-6 rounded-none focus-visible:outline-hidden focus-visible:ring-none text-neutral-400 hover:scale-[1.03] transition-all duration-200 ease-out',
		{
			variants: {
				highlights: {
					white: 'group-hover/card:border-white/50 group-hover/card:bg-white/20 selection:bg-neutral-400/50',
					red: 'group-hover/card:border-rose-500/50 group-hover/card:bg-rose-400/20 selection:bg-rose-500/50',
					blue: 'group-hover/card:border-blue-500/50 group-hover/card:bg-blue-400/20 selection:bg-blue-500/50',
					green: 'group-hover/card:border-green-100/50 group-hover/card:bg-green-400/20 selection:bg-green-500/50',
					purple: 'group-hover/card:border-purple-500/50 group-hover/card:bg-purple-400/20 selection:bg-purple-500/50',
				},
			},
		},
	),
	highlights: cva(
		'absolute inset-0 opacity-0 saturate-200 rounded-none transition duration-200 ease-linear',
		{
			variants: {
				highlights: {
					white: 'bg-neutral-700/30 group-hover/card:opacity-100',
					red: 'bg-linear-to-tr from-rose-500/30 to-pink-700/30 group-hover/card:opacity-30',
					blue: 'bg-linear-to-tr from-blue-500/30 to-indigo-700/30 group-hover/card:opacity-30',
					green: 'bg-linear-to-tr from-green-500/30 to-emerald-700/30 group-hover/card:opacity-30',
					purple: 'bg-linear-to-tr from-purple-500/30 to-violet-700/30 group-hover/card:opacity-30',
				},
			},
			defaultVariants: {
				highlights: 'white',
			},
		},
	),
	border: cva(
		'absolute inset-0 rounded-none focus-visible:outline-hidden ring-1 ring-white/10 focus-visible:ring-none ring-inset transition-all',
		{
			variants: {
				border: {
					white: 'ring-white/5 group-hover/card:ring-white/15',
					red: 'ring-red/5 group-hover/card:ring-red-200/15',
					blue: 'ring-blue/5 group-hover/card:ring-blue-200/15',
					green: 'ring-green/5 group-hover/card:ring-green-200/15',
					purple: 'ring-purple/5 group-hover/card:ring-purple-200/15',
				},
			},
			defaultVariants: {
				border: 'white',
			},
		},
	),
};

function Card(props: CardProps) {
	const [local, rest] = splitProps(props, [
		'children',
		'highlights',
		'radius',
		'class',
		'contentClass',
		'onMouseMove',
	]);

	const [mouseX, setMouseX] = createSignal(0);
	const [mouseY, setMouseY] = createSignal(0);

	const radius = () => local.radius ?? 'lg';
	const maskImage = () => {
		const r = radius() === 'lg' ? '250px' : radius() === 'md' ? '180px' : '100px';
		return `radial-gradient(${r} at ${mouseX()}px ${mouseY()}px, white, transparent)`;
	};

	return (
		<div
			{...rest}
			class={cn(styles.container({ highlights: local.highlights }), local.class)}
			onMouseMove={(event) => {
				const rect = event.currentTarget.getBoundingClientRect();

				setMouseX(event.clientX - rect.left);
				setMouseY(event.clientY - rect.top);

				if (typeof local.onMouseMove === 'function') {
					local.onMouseMove(event);
				}
			}}
		>
			<div
				class={styles.highlights({ highlights: local.highlights })}
				style={{ 'mask-image': maskImage(), '-webkit-mask-image': maskImage() }}
			/>
			<div class={styles.border({ border: local.highlights })} />
			<div class={cn('relative w-full h-full', local.contentClass)}>{local.children}</div>
		</div>
	);
}

export default Card;
