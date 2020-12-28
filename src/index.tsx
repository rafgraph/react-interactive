import * as React from 'react';
import { eventFrom } from 'event-from';
import { PolymorphicComponentProps } from './polymorphicAsType';

export type ActiveState = 'mouseActive' | 'touchActive' | 'keyActive' | false;
export type FocusState =
  | 'focusFromMouse'
  | 'focusFromTouch'
  | 'focusFromKey'
  | false;

export interface InteractiveState {
  hover: boolean;
  active: ActiveState;
  focus: FocusState;
  disabled: boolean;
}

export interface InteractiveStateChange {
  state: InteractiveState;
  prevState: InteractiveState;
}

const initialState: InteractiveState = {
  hover: false,
  active: false,
  focus: false,
  disabled: false,
};

const stateChanged = ({ state, prevState }: InteractiveStateChange) =>
  state.hover !== prevState.hover ||
  state.active !== prevState.active ||
  state.focus !== prevState.focus ||
  state.disabled !== prevState.disabled;

interface InteractiveProps {
  // don't add 'as' prop to interface, it is provided by type AsProp as part of PolymorphicComponentProps
  // don't add children prop to interface, e.g. children?: React.ReactNode;
  // let 'as' prop type determine if children are supported/required
  onStateChange?: ({ state, prevState }: InteractiveStateChange) => void;
}

export const Interactive: <C extends React.ElementType = 'button'>(
  props: PolymorphicComponentProps<C, InteractiveProps>,
) => React.ReactElement | null = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    {
      as,
      children,
      onStateChange,
      ...restProps
    }: PolymorphicComponentProps<C, InteractiveProps>,
    ref: typeof restProps.ref,
  ) => {
    const As = as || 'button';

    const [iState, updateIState] = React.useState<InteractiveStateChange>({
      state: initialState,
      prevState: initialState,
    });

    React.useEffect(
      () => {
        if (onStateChange && stateChanged(iState)) {
          onStateChange(iState);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        iState.state.hover,
        iState.state.active,
        iState.state.focus,
        iState.state.disabled,
      ],
    );

    const handleMouseEnter = (e: React.MouseEvent<unknown, MouseEvent>) => {
      if (eventFrom(e) !== 'mouse') return;
      updateIState((previous) => ({
        state: { ...previous.state, hover: true },
        prevState: previous.state,
      }));
    };

    const handleMouseLeave = (e: React.MouseEvent<unknown, MouseEvent>) => {
      if (eventFrom(e) !== 'mouse') return;
      updateIState((previous) => ({
        state: { ...previous.state, hover: false },
        prevState: previous.state,
      }));
    };

    return (
      <As
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref}
        {...restProps}
        style={{ color: 'blue', display: 'block' }}
      >
        {children}
      </As>
    );
  },
);
