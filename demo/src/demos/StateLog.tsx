import * as React from 'react';
import { deviceType } from 'detect-it';
import {
  Interactive,
  createInteractive,
  eventFrom,
  InteractiveExtendableProps,
  InteractiveState,
  InteractiveStateChange,
} from 'react-interactive';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import { CheckIcon } from '@radix-ui/react-icons';
import { DemoContainer, DemoHeading } from '../ui/DemoContainer';
import { styled } from '../stitches.config';

const StateLogContainer = styled('div', {
  height: '200px',
  padding: '0 5px',
  border: '1px solid $highContrast',
  overflowY: 'scroll',
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
  minHeight: '50px',
  border: '1px solid',
  marginBottom: '5px',
  '&.hover': {
    color: '$green',
  },
  '&.mouseActive': {
    color: '$green',
  },
  '&.touchActive': {
    color: '$blue',
  },
  '&.keyActive': {
    color: '$purple',
  },
  '&.focusFromTouch': {
    outline: '3px solid $colors$outlineBlue',
    outlineOffset: '1px',
  },
  '&.focusFromMouse': {
    outline: '3px solid $colors$outlineGreen',
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
  'active: mouseActive': 'green',
  'active: touchActive': 'blue',
  'active: keyActive': 'purple',
  'active: false': 'normal',
  'focus: focusFromMouse': 'green',
  'focus: focusFromTouch': 'blue',
  'focus: focusFromKey': 'purple',
  'focus: false': 'normal',
};

const InfoType = styled('span', {
  color: '$lowContrast',
  variants: {
    type: {
      normal: { color: '$lowContrast' },
      green: { color: '$green' },
      blue: { color: '$blue' },
      purple: { color: '$purple' },
      orange: { color: '$orange' },
    },
  },
});

const ExtendedTouchActiveOptionContainer = styled('div', {
  marginTop: '10px',
});

const ExtendedTouchActiveOptionLabel = styled(createInteractive(Label.Root), {
  cursor: 'pointer',
  fontSize: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  // required to set vertical-align because display is inline
  // and it contains an empty button (the checkbox when un-checked)
  // see https://stackoverflow.com/questions/21645695/button-element-without-text-causes-subsequent-buttons-to-be-positioned-wrong
  verticalAlign: 'top',

  // style Checkbox (which renders a button) when label is hovered/active
  '&.hover>button, &.mouseActive>button': {
    color: '$green',
    borderColor: '$green',
    boxShadow: '0 0 0 1px $colors$green',
  },
  '&.touchActive>button': {
    color: '$blue',
    borderColor: '$blue',
    boxShadow: '0 0 0 1px $colors$blue',
  },
  '&.disabled': {
    opacity: 0.5,
    cursor: 'unset',
  },
  // required because of radix checkbox bug: https://github.com/radix-ui/primitives/issues/605
  '&>input': {
    display: 'none',
  },
});

const ExtendedTouchActiveOptionCheckbox = styled(
  createInteractive(Checkbox.Root),
  {
    flexShrink: 0,
    marginRight: '4px',
    appearance: 'none',
    border: '1px solid $highContrast',
    width: '32px',
    height: '32px',
    borderRadius: '2px',
    // hover and active are styled in LabelBase so styles are applied when label is hovered/active
    // '&.hover, &.active': {...},
    '&.focusFromKey': {
      outline: 'none',
      // !important required so hover and active styles from Label are not applied
      // to border and boxShadow when in the focusFromKey state
      borderColor: '$purple !important',
      boxShadow: '0 0 0 1px $colors$purple !important',
    },
    '&.keyActive': {
      color: '$purple',
    },
  },
);

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
            <InfoType
              type={/click/.test(item) ? 'orange' : variantLookup[item]}
            >
              {item}
            </InfoType>
          </div>
        ))}
      </Interactive>
      {deviceType !== 'mouseOnly' ? (
        <ExtendedTouchActiveOptionContainer>
          <ExtendedTouchActiveOptionLabel>
            <ExtendedTouchActiveOptionCheckbox
              checked={useExtendedTouchActive}
              onCheckedChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setUseExtendedTouchActive(event.target.checked)
              }
            >
              <Checkbox.Indicator as={CheckIcon} width="30" height="30" />
            </ExtendedTouchActiveOptionCheckbox>
            <CodeBlock>useExtendedTouchActive</CodeBlock>
          </ExtendedTouchActiveOptionLabel>
        </ExtendedTouchActiveOptionContainer>
      ) : null}
    </DemoContainer>
  );
};
