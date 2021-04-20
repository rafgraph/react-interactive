import * as React from 'react';
import { Interactive, InteractiveState } from 'react-interactive';
import { DemoContainer, DemoHeading } from './ui';
import { styled } from './stitches.config';

const StressTestHeadingContainer = styled('div', {
  marginBottom: 10,
});

const StressTestHeading = styled(DemoHeading, {
  display: 'inline-block',
  marginBottom: 0,
  marginRight: 8,
});

const ShowStressTestButton = styled(Interactive.Button, {
  display: 'inline-block',
  textDecoration: 'underline',
  padding: '4px 5px 3px',
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
    backgroundColor: '$backgroundPurple',
    padding: '3px 4px 2px',
    border: '1px solid $colors$purple',
    borderRadius: '3px',
    textDecoration: 'none',
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
      <StressTestHeadingContainer>
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
