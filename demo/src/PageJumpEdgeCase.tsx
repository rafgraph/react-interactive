import * as React from 'react';
import { Interactive, InteractiveState } from 'react-interactive';
import { styled, CSS } from './stitches.config';

const PageJumpEdgeCaseContainer = styled('div', {
  padding: '20px',
  margin: '0 auto',
  maxWidth: '600px',
});

const H1 = styled('h1', {
  fontSize: '20px',
  margin: '10px 0',
});

const Label = styled('div', {
  margin: '20px 0 5px',
});

const interactiveStyles: CSS = {
  '&.hover, &.mouseActive': {
    color: '$green',
  },
  '&.touchActive': {
    color: '$blue',
  },
  '&.keyActive': {
    color: '$purple',
  },
  '&.focusFromKey': {
    outlineOffset: '2px',
    outline: '2px solid $colors$purple',
  },
};

const InteractiveButton = styled(Interactive.Button, {
  padding: '5px',
  border: '1px solid',
  ...interactiveStyles,
});

const InteractiveLink = styled(Interactive.A, {
  textDecoration: 'underline',
  ...interactiveStyles,
});

const InteractiveDiv = styled(Interactive.Div, {
  padding: '5px',
  border: '1px solid',
  outline: 'none',
  ...interactiveStyles,
});

export const PageJumpEdgeCase: React.VFC = () => {
  const [jumpPage, setJumpPage] = React.useState(false);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setJumpPage((prevState) => !prevState);
      return () => window.clearInterval(intervalId);
    }, 5000);
  }, []);

  const interactiveChildren = React.useCallback(
    ({ hover, active, focus }: InteractiveState) =>
      `hover: ${hover}, active: ${active}, focus: ${focus}`,
    [],
  );

  return (
    <PageJumpEdgeCaseContainer>
      <H1>Page Jump Edge Case</H1>
      <p>
        The content will jump down the page every 5 seconds, and then jump back.
        Alternatively, clicking the button or div will jump the page instantly.
        This simulates the page layout changing (external content is loaded,
        etc), and tests how React Interactive handles a page jump when it's in
        an interactive state.
      </p>
      <div style={{ height: jumpPage ? '150px' : '0px' }}></div>
      <Label>Button:</Label>
      <InteractiveButton
        onClick={() => setJumpPage((prevState) => !prevState)}
        useExtendedTouchActive
      >
        {interactiveChildren}
      </InteractiveButton>
      <Label>Link:</Label>

      <InteractiveLink href="#" useExtendedTouchActive>
        {interactiveChildren}
      </InteractiveLink>
      <Label>Div:</Label>

      <InteractiveDiv
        onClick={() => setJumpPage((prevState) => !prevState)}
        useExtendedTouchActive
        tabIndex={0}
      >
        {interactiveChildren}
      </InteractiveDiv>
    </PageJumpEdgeCaseContainer>
  );
};
