import { breakpointsTailwind, useBreakpoints as useBreakpoints_ } from '@vueuse/core';

export function useBreakpoints() {
  const breakpoints = useBreakpoints_(breakpointsTailwind);
  const isMobile = breakpoints.smaller('md');

  return {
    isMobile,
    breakpoints,
  };
}
