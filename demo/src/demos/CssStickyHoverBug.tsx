import * as React from 'react';
import { Interactive } from 'react-interactive';
import { DemoContainer, DemoHeading } from '../ui/DemoContainer';
import { styled } from '../stitches.config';

const PseudoClassButton = styled('button', {
  display: 'block',
  padding: '8px 20px',
  marginTop: '18px',
  textAlign: 'center',
  backgroundColor: '$formElementsBackground',
  border: '1px solid',
  borderRadius: '1000px',
  outline: 'revert',
  '&:hover': {
    color: '$green',
    borderColor: '$green',
  },
  '&:active': {
    color: '$red',
    borderColor: '$red',
  },
});

const InteractiveButton = styled(Interactive.Button, {
  display: 'block',
  padding: '8px 20px',
  marginTop: '18px',
  textAlign: 'center',
  backgroundColor: '$formElementsBackground',
  border: '1px solid',
  borderRadius: '1000px',
  '&.hover': {
    color: '$green',
    borderColor: '$green',
  },
  '&.active': {
    color: '$red',
    borderColor: '$red',
  },
  '&.focusFromKey': {
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
});

const ButtonsContainer = styled('div', {
  display: 'flex',
  gap: '15px',
  marginTop: '15px',
});

export const CssStickyHoverBug: React.VFC = () => {
  return (
    <DemoContainer id="css-sticky-hover-bug">
      <DemoHeading>CSS Sticky Hover Bug</DemoHeading>
      <p>
        On touch devices the CSS <code>:hover</code> state sticks until you tap
        someplace else on the screen.
      </p>
      <ButtonsContainer>
        <div>
          <p>
            Button styled with pseudo-classes, <code>:hover</code> is green,{' '}
            <code>:active</code> is red.
          </p>
          <PseudoClassButton>Pseudo-class Button</PseudoClassButton>
        </div>
        <div>
          <p>
            Button styled with React Interactive, <code>.hover</code> is green,{' '}
            <code>.active</code> is red.
          </p>
          <InteractiveButton
            // useExtendedTouchActive to match css :active functionality
            // which stays in the :active state as long a the touch point is on the screen,
            // React Interactive's default is to exit the touchActive state when a click is no longer possible
            useExtendedTouchActive
          >
            React Interactive Button
          </InteractiveButton>
        </div>
      </ButtonsContainer>
    </DemoContainer>
  );
};
