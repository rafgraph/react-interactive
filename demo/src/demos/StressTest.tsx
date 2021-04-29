import * as React from 'react';
import { Interactive, InteractiveState } from 'react-interactive';
import { DemoContainer, DemoHeading } from '../ui/DemoContainer';
import { styled } from '../stitches.config';

const StressTestHeadingContainer = styled('div', {
  variants: {
    stressTestShown: {
      true: {
        marginBottom: 10,
      },
    },
  },
});

const StressTestHeading = styled(DemoHeading, {
  display: 'inline-block',
  marginBottom: 0,
  marginRight: 8,
});

const ShowStressTestButton = styled(Interactive.Button, {
  display: 'inline-block',
  textDecoration: 'underline',
  borderRadius: '3px',
  padding: '3px 4px 2px',
  marginLeft: '3px',

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
    textDecoration: 'none',
    backgroundColor: '$backgroundPurple',
    boxShadow: '0 0 0 1px $colors$purple',
    // adds a 3D drop shadow as well
    // boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
});

const StressTestItem = styled(Interactive.Button, {
  display: 'block',
  width: '100%',
  fontFamily: 'monospace',
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
    outline: '2px solid $colors$purple',
  },
});

const ArrayOfInteractive = Array(500)
  .fill(1)
  .map((_, idx) => (
    <StressTestItem key={idx} useExtendedTouchActive>
      {({ hover, active }: InteractiveState) =>
        `Interactive button ${idx + 1}${hover || active ? ' - ' : ''}${
          hover ? 'hover' : ''
        }${hover && active ? ', ' : ''}${active ? active : ''}`
      }
    </StressTestItem>
  ));

export const StressTest: React.VFC = () => {
  const [showStressTest, setShowStressTest] = React.useState<boolean>(false);

  return (
    <DemoContainer>
      <StressTestHeadingContainer
        id="stress-test"
        stressTestShown={showStressTest}
      >
        <StressTestHeading>Stress Test</StressTestHeading>–
        <ShowStressTestButton
          onClick={() => setShowStressTest((prevState) => !prevState)}
        >
          {`${showStressTest ? 'remove' : 'create'}`} 500 Interactive buttons
        </ShowStressTestButton>
      </StressTestHeadingContainer>
      {showStressTest ? ArrayOfInteractive : null}
    </DemoContainer>
  );
};
