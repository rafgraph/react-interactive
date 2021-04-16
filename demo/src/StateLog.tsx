import * as React from 'react';
import { deviceType } from 'detect-it';
import {
  Interactive,
  eventFrom,
  InteractiveExtendableProps,
  InteractiveState,
  InteractiveStateChange,
} from 'react-interactive';
import { CheckboxBase, LabelBase } from './Interactive';
import { DemoContainer, DemoHeading } from './ui';
import { styled } from './stitches.config';

const StateLogContainer = styled('div', {
  height: '200px',
  padding: '0 5px',
  border: '1px solid $highContrast',
  overflow: 'scroll',
  fontFamily: 'monospace',
  outline: 'none',
  '&.focusFromKey': {
    outline: '3px solid $colors$purple',
    outlineOffset: '1px',
  },
});

const InteractiveButton: React.VFC<InteractiveExtendableProps<'button'>> = (
  props,
) => <Interactive {...props} as="button" />;

const DemoButton = styled(InteractiveButton, {
  fontFamily: 'monospace',
  fontSize: '20px',
  textAlign: 'center',
  width: '100%',
  height: '50px',
  border: '1px solid',
  marginBottom: '5px',
  '&.hover': {
    color: '$green',
  },
  '&.mouseActive': {
    color: '$red',
  },
  '&.touchActive': {
    color: '$blue',
  },
  '&.keyActive': {
    color: '$purple',
  },
  '&.focusFromMouse, &.focusFromTouch': {
    outline: '3px solid $colors$backgroundContrast',
    outlineOffset: '1px',
  },
  '&.focusFromKey': {
    outline: '3px solid $colors$purple',
    outlineOffset: '1px',
  },
});

const variantLookup: Record<string, any> = {
  'hover: true': 'green',
  'hover: false': 'normal',
  'active: mouseActive': 'red',
  'active: touchActive': 'blue',
  'active: keyActive': 'purple',
  'active: false': 'normal',
  'focus: focusFromMouse': 'normal',
  'focus: focusFromTouch': 'normal',
  'focus: focusFromKey': 'purple',
  'focus: false': 'normal',
};

const InfoType = styled('span', {
  color: '$lowContrast',
  variants: {
    type: {
      normal: { color: '$highContrast' },
      green: { color: '$green' },
      blue: { color: '$blue' },
      purple: { color: '$purple' },
      red: { color: '$red' },
    },
  },
});

const ExtendedTouchActiveOptionContainer = styled('div', {
  marginTop: '10px',
});

const OptionLabel = styled(LabelBase, {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '18px',
});

const OptionCheckbox = styled(CheckboxBase, {
  marginRight: '4px',
});

const CodeBlock = styled('code', {
  backgroundColor: '$backgroundContrast',
  marginTop: '2px',
  padding: '4px 6px 4px',
  borderRadius: '5px',
});

export const StateLog: React.VFC = () => {
  const [stateLog, setStateLog] = React.useState<string[]>([]);
  const [
    useExtendedTouchActive,
    setUseExtendedTouchActive,
  ] = React.useState<boolean>(false);

  const logContainerElement = React.useRef<HTMLDivElement>(null!);

  React.useEffect(() => {
    if (logContainerElement.current) {
      logContainerElement.current.scrollTop =
        logContainerElement.current.scrollHeight;
    }
  }, [stateLog]);

  const handleInteractiveStateChange = React.useCallback(
    ({ state, prevState }: InteractiveStateChange) => {
      setStateLog((prevLog) => {
        const log = [...prevLog];
        if (state.hover !== prevState.hover) {
          log.push(`hover: ${state.hover}`);
        }
        if (state.active !== prevState.active) {
          log.push(`active: ${state.active}`);
        }
        if (state.focus !== prevState.focus) {
          log.push(`focus: ${state.focus}`);
        }
        return log;
      });
    },
    [],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setStateLog((prevLog) => [
        ...prevLog,
        `click eventFrom ${eventFrom(event)}`,
      ]);
    },
    [],
  );

  const handleDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setStateLog((prevLog) => [
        ...prevLog,
        `double click eventFrom ${eventFrom(event)}`,
      ]);
    },
    [],
  );

  const childrenAsAFunction = React.useCallback(
    ({ hover, active, focus }: InteractiveState) => {
      const children: string[] = [];
      if (hover) {
        children.push('hover');
      }
      if (active) {
        children.push(active);
      }
      if (focus) {
        children.push(focus);
      }
      if (children.length === 0) {
        children.push('normal');
      }
      return children.join(', ');
    },
    [],
  );

  return (
    <DemoContainer>
      <DemoHeading>Interactive State Log</DemoHeading>
      <DemoButton
        onStateChange={handleInteractiveStateChange}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        useExtendedTouchActive={useExtendedTouchActive}
      >
        {childrenAsAFunction}
      </DemoButton>
      <Interactive
        as={StateLogContainer}
        ref={logContainerElement}
        tabIndex={0}
      >
        {stateLog.map((item, idx) => (
          <div key={idx}>
            <InfoType>{idx + 1}</InfoType>{' '}
            <InfoType type={variantLookup[item]}>{item}</InfoType>
          </div>
        ))}
      </Interactive>
      {deviceType !== 'mouseOnly' ? (
        <ExtendedTouchActiveOptionContainer>
          <OptionLabel>
            <OptionCheckbox
              checked={useExtendedTouchActive}
              onCheckedChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setUseExtendedTouchActive(event.target.checked)
              }
            />
            <CodeBlock>useExtendedTouchActive</CodeBlock>
          </OptionLabel>
        </ExtendedTouchActiveOptionContainer>
      ) : null}
    </DemoContainer>
  );
};
