const components = {
	h2: (props: any) => (
		<h2 class='mb-4 font-semibold text-white text-2xl tracking-tight' {...props} />
	),
	p: (props: any) => <p class='mb-6 text-neutral-300 leading-relaxed' {...props} />,
	ul: (props: any) => <ul class='flex flex-col gap-3 mb-6' {...props} />,
	li: (props: any) => <li class='text-neutral-300 leading-relaxed' {...props} />,
	strong: (props: any) => <strong class='font-semibold text-white' {...props} />,
};

export default components;
