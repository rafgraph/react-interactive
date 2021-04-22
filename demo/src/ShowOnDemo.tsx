import * as React from 'react';
import { Interactive, InteractiveStateChange } from 'react-interactive';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { DemoContainer, DemoHeading } from './ui';
import { styled } from './stitches.config';

const InfoTextContainer = styled('div', {
  textAlign: 'center',
  fontSize: 18,
  marginTop: 16,
  marginBottom: 20,
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
  outline: 'none',
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

export const ShowOnDemo: React.VFC = () => {
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
    <DemoContainer>
      <DemoHeading>Show On</DemoHeading>
      <InfoTextContainer showInfo={showInfo}>
        {showInfo ? (
          'Some info to show about something important'
        ) : (
          <>
            <code>hover</code>, <code>touchActive</code>, and{' '}
            <code>focusFromKey</code>
          </>
        )}
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
