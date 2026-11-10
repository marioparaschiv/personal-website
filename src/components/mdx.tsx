const components = {
	h2: (props: any) => (
		<h2 class='mt-8 mb-3 font-semibold text-white text-2xl tracking-tight' {...props} />
	),
	p: (props: any) => <p class='mb-4 text-neutral-300 leading-relaxed' {...props} />,
	ul: (props: any) => (
		<ul class='flex flex-col gap-1.5 mb-4 pl-5 list-disc marker:text-neutral-500' {...props} />
	),
	ol: (props: any) => (
		<ol
			class='flex flex-col gap-1.5 mb-4 pl-5 list-decimal marker:text-neutral-500'
			{...props}
		/>
	),
	li: (props: any) => <li class='text-neutral-300 leading-relaxed' {...props} />,
	strong: (props: any) => <strong class='font-semibold text-white' {...props} />,
};

export default components;
