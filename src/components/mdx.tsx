import type { MDXComponents } from 'mdx/types';

const components: MDXComponents = {
	h2: (props) => (
		<h2 className='mb-4 font-semibold text-white text-2xl tracking-tight' {...props} />
	),
	p: (props) => <p className='mb-6 text-neutral-300 leading-relaxed' {...props} />,
	ul: (props) => <ul className='flex flex-col gap-3 mb-6' {...props} />,
	li: (props) => <li className='text-neutral-300 leading-relaxed' {...props} />,
	strong: (props) => <strong className='font-semibold text-white' {...props} />,
};

export default components;
