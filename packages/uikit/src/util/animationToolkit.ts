import anime from "animejs";
import { keyframes } from "styled-components";

export const appearAnimation = keyframes`
  from { opacity:0 }
  to { opacity:1 }
`;

export const disappearAnimation = keyframes`
  from { opacity:1 }
  to { opacity:0 }
`;

export const animationHandler = (element: HTMLElement | null, shouldDisappear?: boolean) => {
  if (!element) return;
  if (element.classList.contains("appear")) {
    element.classList.remove("appear");
    element.classList.add("disappear");
  } else {
    element.classList.remove("disappear");
    element.classList.add("appear");
  }
  if (shouldDisappear) {
    element.classList.remove("appear");
    element.classList.add("disappear");
  }
};

export const animationVariants = {
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

export const animationMap = {
  initial: "initial",
  animate: "animate",
  exit: "exit",
};

export const createAnimation = (
  element: HTMLElement,
  variant: keyof typeof animationVariants,
  duration = 300
) => {
  return anime({
    targets: element,
    ...animationVariants[variant],
    duration,
    easing: "easeInOutQuad",
  });
};

export const promotedGradient = keyframes`
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
`;
