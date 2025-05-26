import React, { useEffect, useRef, FC } from 'react';
import anime from 'animejs';

interface AnimePresenceProps {
  isVisible?: boolean;
  onExitComplete?: () => void;
  features?: unknown;
  mode?: string;
}

const LazyAnimatePresence: FC<React.PropsWithChildren<AnimePresenceProps>> = ({
  children,
  isVisible = true,
  onExitComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(isVisible);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isVisible) {
      setShow(true);
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeInOutQuad',
      });
    } else {
      anime({
        targets: containerRef.current,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInOutQuad',
        complete: () => {
          setShow(false);
          onExitComplete?.();
        },
      });
    }
  }, [isVisible, onExitComplete]);

  if (!show) return null;

  return (
    <div ref={containerRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};

export const domAnimation = {};
export default LazyAnimatePresence;
