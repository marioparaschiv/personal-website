import resolveConfig from 'tailwindcss/resolveConfig';

import { useMediaQuery } from '~/components/hooks';
import file from '~/../tailwind.config';

const config = resolveConfig(file);
const breakpoints = config.theme!.screens!;

function useBreakpoint(breakpoint: keyof typeof breakpoints) {
	return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
}

export default useBreakpoint;
