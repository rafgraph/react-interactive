import * as React from 'react';

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
  children: React.ReactNode;
  onStateChange?: (arg: InteractiveStateChange) => void;
}

export const Interactive: React.VFC<InteractiveProps> = ({
  children,
  onStateChange,
}) => {
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

  const handleMouseEnter = () => {
    updateIState((previous) => ({
      state: { ...previous.state, hover: true },
      prevState: previous.state,
    }));
  };

  const handleMouseLeave = () => {
    updateIState((previous) => ({
      state: { ...previous.state, hover: false },
      prevState: previous.state,
    }));
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
};
