export const animeVariants = {
  initial: {
    opacity: 0,
    translateX: 0,
  },
  animate: {
    opacity: 1,
    translateX: 0,
  },
  exit: {
    opacity: 0,
    translateX: 0,
  },
};

import anime from 'animejs';

export const createAnimation = (
  element: HTMLElement,
  variant: 'initial' | 'animate' | 'exit',
  duration = 300,
) => {
  return anime({
    targets: element,
    ...animeVariants[variant],
    duration,
    easing: 'easeInOutQuad',
  });
};
