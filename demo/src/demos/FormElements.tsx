import * as React from 'react';
import {
  Interactive,
  createInteractive,
  InteractiveStateChange,
} from 'react-interactive';
import { primaryInput } from 'detect-it';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixLabel from '@radix-ui/react-label';
import { CheckIcon } from '@radix-ui/react-icons';
import { DemoContainer, DemoHeading } from '../ui/DemoContainer';
import { styled } from '../stitches.config';

const TextInput = styled(Interactive.Input, {
  display: 'block',
  width: '100%',
  margin: '8px 0',
  backgroundColor: '$formElementsBackground',
  border: '1px solid $colors$highContrast',
  borderRadius: '4px',
  padding: '4px 6px',

  '&.hover, &.mouseActive': {
    borderColor: '$green',
  },
  '&.touchActive': {
    borderColor: '$blue',
    boxShadow: '0 0 0 1px $colors$blue',
  },
  '&.focusFromTouch': {
    borderColor: '$blue',
    boxShadow: '0 0 0 1px $colors$blue',
  },
  '&.focusFromMouse': {
    borderColor: '$green',
    boxShadow: '0 0 0 1px $colors$green',
  },
  '&.focusFromKey': {
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.disabled': {
    opacity: 0.5,
  },
});

const CheckboxLabel = styled(createInteractive(RadixLabel.Root), {
  cursor: 'pointer',
  margin: '6px 1px',
  display: 'inline-flex',
  alignItems: 'center',
  // line-height needs to be the same as (or less than) the height of the checkbox
  // for the check mark to center vertically inside the checkbox
  lineHeight: '17px',
  // need to set vertical-align property because display is inline
  // and it contains an empty button (the checkbox when un-checked)
  // see https://stackoverflow.com/questions/21645695/button-element-without-text-causes-subsequent-buttons-to-be-positioned-wrong
  verticalAlign: 'top',

  // style the <Checkbox> (which renders a button) when label is hovered/active
  '&.hover>button': {
    color: '$green',
    borderColor: '$green',
    backgroundColor: '$formElementsBackground',
  },
  '&.mouseActive>button': {
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

const Checkbox = styled(createInteractive(RadixCheckbox.Root), {
  width: '17px',
  height: '17px',
  flexShrink: 0,
  marginRight: '4px',
  backgroundColor: '$formElementsBackground',
  border: '1px solid $highContrast',
  borderRadius: '2px',

  // hover and active styles in LabelBase so styles are applied when label is hovered/active
  // '&.hover, &.active': {...},
  '&.focusFromKey': {
    // !important required so hover and active styles from Label are not applied
    // to border and boxShadow when in the focusFromKey state
    borderColor: '$purple !important',
    boxShadow:
      '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38) !important',
  },
  '&.keyActive': {
    color: '$purple',
    boxShadow:
      '0 0 0 1px $colors$purple, 1px 2px 3px 0px rgba(0, 0, 0, 0.38) !important',
  },
});

// select css styling adapted from https://moderncss.dev/custom-select-styles-with-pure-css/
const SelectContainer = styled('div', {
  display: 'grid',
  gridTemplateAreas: '"select"',
  alignItems: 'center',
  margin: '8px 0',
  // select custom arrow created with clip-path
  '&::after': {
    content: '',
    gridArea: 'select',
    justifySelf: 'end',
    width: '14px',
    height: '8px',
    marginRight: '8px',
    backgroundColor: '$highContrast',
    clipPath: 'polygon(100% 0%, 50% 35%, 0 0%, 50% 100%)',
    pointerEvents: 'none',
  },
  variants: {
    disabled: {
      true: { opacity: 0.5 },
    },
  },
});

const Select = styled(Interactive.Select, {
  gridArea: 'select',
  width: '100%',
  backgroundColor: '$formElementsBackground',
  border: '1px solid $colors$highContrast',
  borderRadius: '4px',
  padding: '4px 24px 4px 6px',

  '&.hover': {
    borderColor: '$green',
  },
  '&.mouseActive': {
    boxShadow: '0 0 0 1px $colors$green',
  },
  '&.touchActive': {
    borderColor: '$blue',
    boxShadow: '0 0 0 1px $colors$blue',
  },
  '&.focusFromKey': {
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.disabled': {
    opacity: 0.5,
  },
  '&>option': {
    // only works in desktop edge, desktop firefox, and chrome on windows
    color: '$highContrast',
    background: '$colors$pageBackground',
  },
});

const Button = styled(Interactive.Button, {
  display: 'block',
  padding: '8px 26px',
  margin: '18px 0 14px',
  textAlign: 'center',
  backgroundColor: '$formElementsBackground',
  border: '1px solid',
  borderRadius: '1000px',

  '&.hover': {
    borderColor: '$green',
    boxShadow: '2px 3px 3px 0px rgba(0, 0, 0, 0.38)',
  },
  // focusFromKey styles are overridden by active styles (below), but not hover styles (above)
  '&.focusFromKey': {
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.mouseActive': {
    color: '$green',
    borderColor: '$green',
    boxShadow: '0 0 0 1px $colors$green, 1px 2px 3px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.touchActive': {
    color: '$blue',
    borderColor: '$blue',
    boxShadow: '0 0 0 1px $colors$blue, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.keyActive': {
    color: '$purple',
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 1px 2px 3px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.disabled': {
    opacity: 0.5,
  },
});

// checking for fish easter egg
const Ocean = styled('div', {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'royalblue',
  opacity: 0.2,
  pointerEvents: 'none',
  zIndex: 1,
});

const Fish = styled(Interactive.Button, {
  position: 'fixed',
  fontSize: '9vmin',
  lineHeight: '7vmin',
  '&.focusFromKey': {
    filter: 'drop-shadow(6px 6px 3px royalblue) hue-rotate(50deg)',
  },
  zIndex: 2,
});

interface FishType {
  id: number;
  top: number;
  left: number;
}

const createOneFish: (id: number) => FishType = (id) => ({
  id,
  top: Math.floor(Math.random() * 81),
  left: Math.floor(Math.random() * 91),
});

export const FormElements: React.VFC = () => {
  const [textInputState, setTextInputState] = React.useState('');
  const [textInputInputText, setTextInputInfoText] = React.useState('');
  const [checkboxState, setCheckboxState] = React.useState(false);
  const [anotherCheckboxState, setAnotherCheckboxState] = React.useState(false);
  const [selectInputState, setSelectInputState] = React.useState('placeholder');
  const [disableElements, setDisabledElements] = React.useState(false);

  if (disableElements) {
    textInputState !== '' && setTextInputState('');
    checkboxState && setCheckboxState(false);
    anotherCheckboxState && setAnotherCheckboxState(false);
    selectInputState !== 'placeholder' && setSelectInputState('placeholder');
  }

  // checking for fish easter egg
  const [fishes, setFishes] = React.useState<FishType[]>([]);

  const createNewFishes = React.useCallback(() => {
    const newFishes = Array(10)
      .fill(1)
      .map((_, idx) => createOneFish(idx));
    setFishes(newFishes);
  }, []);

  React.useEffect(() => {
    if (fishes.length === 1) {
      setFishes((fishes) => [createOneFish(fishes[0].id)]);
      const intervalId = window.setInterval(
        () => {
          setFishes((fishes) => [createOneFish(fishes[0].id)]);
        },
        // if the device is primarily a touch device then make the fish jump faster
        // because a user's touch response is usually faster the their mouse response
        primaryInput === 'touch' ? 700 : 1000,
      );
      return () => window.clearInterval(intervalId);
    }
  }, [fishes.length]);

  return (
    <DemoContainer id="form-elements">
      <DemoHeading>Form Elements</DemoHeading>

      <TextInput
        type="text"
        value={textInputState}
        disabled={disableElements}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTextInputState(e.target.value)
        }
        onStateChange={({ state }: InteractiveStateChange) => {
          let infoText = '';
          if (state.focus) {
            infoText = 'This has focus for typing';
          } else if (disableElements && (state.hover || state.active)) {
            infoText = 'Un-disable form elements to use this text input';
          }
          setTextInputInfoText(infoText);
        }}
        placeholder={textInputInputText}
      />

      <CheckboxLabel disabled={disableElements}>
        <Checkbox
          disabled={disableElements}
          checked={checkboxState}
          onCheckedChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setCheckboxState(event.target.checked)
          }
        >
          <RadixCheckbox.Indicator as={CheckIcon} width="15" height="15" />
        </Checkbox>
        A checkbox for checking
      </CheckboxLabel>

      <CheckboxLabel disabled={disableElements}>
        <Checkbox
          disabled={disableElements}
          checked={anotherCheckboxState}
          onCheckedChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setAnotherCheckboxState(event.target.checked)
          }
        >
          <RadixCheckbox.Indicator as={CheckIcon} width="15" height="15" />
        </Checkbox>
        Another checkbox for double checking
      </CheckboxLabel>

      <SelectContainer disabled={disableElements}>
        <Select
          disabled={disableElements}
          value={selectInputState}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectInputState(e.target.value);
            if (e.target.value === 'fishes') {
              createNewFishes();
            }
          }}
          // have to also use onMouseDown to setSelectInputState because of
          // firefox bug: https://github.com/facebook/react/issues/12584#issuecomment-383233455
          // note that other browsers don't fire a mousedown event when the select is open
          onMouseDown={(e: any) => {
            if (e.target.value) {
              setSelectInputState(e.target.value);
            }
          }}
        >
          <option value="placeholder" disabled hidden>
            Select your favorite type of checking
          </option>
          <option value="interest">Interest checking</option>
          <option value="hockey">Hockey checking</option>
          <option value="todo">Checking off a todo item</option>
          <option value="double">Double checking everything</option>
          <option value="fishes">Checking for fish 🐟🐟🐟🐇</option>
        </Select>
      </SelectContainer>

      {fishes.length > 0 ? (
        <>
          <Ocean />
          {fishes.map((fish, _, fishes) => (
            <Fish
              key={fish.id}
              css={{ top: `${fish.top}vh`, left: `${fish.left}vw` }}
              onClick={() => {
                setFishes(fishes.filter((f) => f.id !== fish.id));
              }}
            >
              🐟
            </Fish>
          ))}
        </>
      ) : null}

      <Button disabled={disableElements}>Button</Button>

      <CheckboxLabel css={{ marginBottom: 0 }}>
        <Checkbox
          onCheckedChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setDisabledElements(event.target.checked)
          }
        >
          <RadixCheckbox.Indicator as={CheckIcon} width="15" height="15" />
        </Checkbox>
        Disable form elements
      </CheckboxLabel>
    </DemoContainer>
  );
};
