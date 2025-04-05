import { ChevronDownIcon } from "@pancakeswap/uikit";
import { styled } from "styled-components";

const PADDING = 0;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 0;
  cursor: pointer;
`;
const ContentWrapper = styled.div<{ isOpen: boolean }>`
  transform-origin: top;
  max-height: ${({ isOpen }) => (isOpen ? "1000px" : "0")};
  transform: scaleY(${({ isOpen }) => (isOpen ? 1 : 0)});
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out, max-height 0.25s ease-in-out;
  will-change: max-height, transform, opacity;
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
`;

interface CollapseProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Collapse: React.FC<CollapseProps> = ({ title, content, isOpen = false, onToggle }) => {
  return (
    <Container>
      <TitleWrapper onClick={onToggle}>
        {title}
        <IconWrapper className={isOpen ? "open" : undefined}>
          <ChevronDownIcon color="textSubtle" width="24px" />
        </IconWrapper>
      </TitleWrapper>
      <ContentWrapper isOpen={isOpen}>{content}</ContentWrapper>
    </Container>
  );
};
