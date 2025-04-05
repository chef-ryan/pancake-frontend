import { ChevronDownIcon } from "@pancakeswap/uikit";
import { useLayoutEffect, useRef } from "react";
import { styled } from "styled-components";

const PADDING = 0;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 0;
  cursor: pointer;
`;
const ContentWrapper = styled.div<{ show: boolean }>`
  transform: ${({ show }) => (show ? "translateY(0)" : "translateY(-10px)")};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: transform 0.3s ease, opacity 0.3s ease;
`;
const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(0deg);
  transition: transform 0.25s ease;
  flex-grow: 0;
  cursor: pointer;
  &.open {
    transform: rotate(180deg);
  }
`;

const Container = styled.div`
  overflow: hidden;
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: ${PADDING}px;
  flex-grow: 0;
  will-change: height;
  transition: height 0.25s ease-in-out;
`;

interface CollapseProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  recalculateDep?: boolean;
}

export const Collapse: React.FC<CollapseProps> = ({ title, content, isOpen, onToggle, recalculateDep = false }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !titleRef.current || !contentRef.current) return;

    const titleHeight = titleRef.current.scrollHeight;
    const contentHeight = contentRef.current.scrollHeight;
    const targetHeight = isOpen ? titleHeight + contentHeight + PADDING * 2 : titleHeight + PADDING * 2;

    wrapperRef.current.style.height = `${targetHeight}px`;
  }, [isOpen, recalculateDep]);

  return (
    <Container ref={wrapperRef}>
      <TitleWrapper ref={titleRef} onClick={onToggle}>
        {title}
        <IconWrapper className={isOpen ? "open" : undefined}>
          <ChevronDownIcon color="textSubtle" width="24px" />
        </IconWrapper>
      </TitleWrapper>
      <ContentWrapper ref={contentRef} show={!!isOpen}>
        {content}
      </ContentWrapper>
    </Container>
  );
};
