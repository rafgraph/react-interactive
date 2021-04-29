import * as React from 'react';
import { Interactive, InteractiveStateChange } from 'react-interactive';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { DemoContainer, DemoHeading } from '../ui/DemoContainer';
import { styled } from '../stitches.config';

const ShowOnDemoHeading = styled(DemoHeading, {
  marginBottom: 0,
});

const InfoTextContainer = styled('div', {
  fontSize: 18,
  height: 52,
  marginBottom: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&>*': {
    textAlign: 'center',
  },
  variants: {
    showInfo: {
      false: {
        color: '$lowContrast',
      },
    },
  },
});

const InfoIconContainer = styled('div', {
  textAlign: 'center',
});

const InteractiveInfo = styled(Interactive.Span, {
  height: 30,
  display: 'inline-block',
  verticalAlign: 'top',
  outline: 'none',
  borderRadius: '50%',
  '&.hover': {
    color: '$green',
  },
  '&.touchActive': {
    color: '$blue',
  },
  '&.focusFromKey': {
    color: '$purple',
  },
});

export const ShowOn: React.VFC = () => {
  const [showInfo, setShowInfo] = React.useState(false);

  const handleOnStateChange = React.useCallback(
    ({ state }: InteractiveStateChange) => {
      setShowInfo(
        state.hover ||
          state.active === 'touchActive' ||
          state.focus === 'focusFromKey',
      );
    },
    [],
  );

  return (
    <DemoContainer id="show-on">
      <ShowOnDemoHeading>Show On</ShowOnDemoHeading>
      <InfoTextContainer showInfo={showInfo}>
        <span>
          {showInfo ? (
            'Some info to show about something'
          ) : (
            <>
              <code>hover</code>, <code>touchActive</code>, and{' '}
              <code>focusFromKey</code>
            </>
          )}
        </span>
      </InfoTextContainer>
      <InfoIconContainer>
        <InteractiveInfo
          onStateChange={handleOnStateChange}
          useExtendedTouchActive
          tabIndex={0}
        >
          <InfoCircledIcon width={30} height={30} />
        </InteractiveInfo>
      </InfoIconContainer>
    </DemoContainer>
  );
};
