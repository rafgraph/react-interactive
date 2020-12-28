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

export type InteractiveStateKey = 'hover' | 'active' | 'focus' | 'disabled';

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

const eventMap: Record<string, any> = {
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  pointerenter: 'onPointerEnter',
  pointerleave: 'onPointerLeave',
  pointerdown: 'onPointerDown',
  pointerup: 'onPointerUp',
  pointercancel: 'onPointerCancel',
  touchstart: 'onTouchStart',
  touchend: 'onTouchEnd',
  touchcancel: 'onTouchCancel',
  keydown: 'onKeyDown',
  keyup: 'onKeyUp',
  focus: 'onFocus',
  blur: 'onBlur',
};

interface InteractiveProps {
  // don't add 'as' prop to interface, it is provided by type AsProp as part of PolymorphicComponentProps
  children?: React.ReactNode | ((state: InteractiveState) => React.ReactNode);
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

    const [iState, setIState] = React.useState<InteractiveStateChange>({
      state: initialState,
      prevState: initialState,
    });

    // onStateChange prop callback
    React.useEffect(
      () => {
        if (
          onStateChange &&
          // check if stateChanged so onStateChange is not called on the initial render
          // which is the only time iState.state deep=== iState.prevState
          stateChanged(iState)
        ) {
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

    const keyTracking = React.useRef<{
      enterKeyDown: boolean;
      spaceKeyDown: boolean;
    }>({ enterKeyDown: false, spaceKeyDown: false });

    const touchActiveTimeoutId = React.useRef<number | undefined>(undefined);
    React.useEffect(
      () => () => window.clearTimeout(touchActiveTimeoutId.current),
      [],
    );

    interface HoverStateChange {
      iKey: 'hover';
      state: boolean;
      action: 'enter' | 'exit';
    }
    interface ActiveStateChange {
      iKey: 'active';
      state: ActiveState;
      action: 'enter' | 'exit';
    }
    interface FocusStateChange {
      iKey: 'focus';
      state: FocusState;
      action: 'enter' | 'exit';
    }
    interface DisabledStateChange {
      iKey: 'disabled';
      state: boolean;
      action: 'enter' | 'exit';
    }
    type StateChangeFunction = (
      changes: (
        | HoverStateChange
        | ActiveStateChange
        | FocusStateChange
        | DisabledStateChange
      )[],
    ) => void;
    // stateChange is idempotent so event handlers can be dumb (don't need to know current state)
    // for example mousedown and pointerdown event handlers
    // will both call stateChange with action enter mouseActive state
    const stateChange: StateChangeFunction = React.useCallback(
      (changes) => {
        // first check if changes are different from current state
        if (
          changes.some(({ iKey, state, action }) =>
            action === 'enter'
              ? iState.state[iKey] !== state
              : iState.state[iKey] === state,
          )
        ) {
          setIState((previous) => {
            const newState = { ...previous.state };
            changes.forEach(({ iKey, state, action }) => {
              if (action === 'enter') {
                // TS should known that iKey and state values are matched to each other
                // based on the StateChangeFunction type above, but TS doesn't understand this
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                newState[iKey] = state;
              } else if (action === 'exit' && previous.state[iKey] === state) {
                newState[iKey] = false;
              }
            });
            const newInteractiveStateChange = {
              state: newState,
              prevState: previous.state,
            };
            return stateChanged(newInteractiveStateChange)
              ? newInteractiveStateChange
              : previous;
          });
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

    const handleEvent = React.useCallback(
      (e: React.UIEvent) => {
        // call event handler for the current event if it is passed in as a prop
        if (restProps[eventMap[e.type]]) {
          restProps[eventMap[e.type]](e);
        }

        // TODO nested switch

        if (eventFrom(e) === 'mouse') {
          if (e.type === 'mouseenter') {
            stateChange([{ iKey: 'hover', state: true, action: 'enter' }]);
          } else if (e.type === 'mouseleave') {
            stateChange([{ iKey: 'hover', state: false, action: 'enter' }]);
          }
        }
      },
      // handleEvent is only dependent on event handler props that are also in eventMap
      // for example, restProps.onMouseEnter, restProps.onTouchStart, etc
      // useCallback so handleEvent is not re-created if event handler props are unchanged (e.g. on Interactive state change)
      // and also so handleEvent can be used as a dependent in useMemo/useCallback, e.g. eventListeners
      // this generates an array of event handler props that are also in eventMap
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        ...Object.keys(eventMap).map((key) => restProps[eventMap[key]]),
        stateChange,
      ],
    );

    // create object with event listeners to pass to <As>
    const eventListeners = React.useMemo(
      () =>
        Object.keys(eventMap).reduce(
          (
            objWithListeners: Record<string, React.EventHandler<any>>,
            listenerPropName,
          ) => {
            objWithListeners[eventMap[listenerPropName]] = handleEvent;
            return objWithListeners;
          },
          {},
        ),
      [handleEvent],
    );

    // support ref prop as object or callback, and track ref locally
    const localRef = React.useRef<HTMLElement | null>(null);
    const callbackRef = React.useCallback(
      (node: HTMLElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    return (
      <As
        ref={callbackRef}
        {...restProps}
        {...eventListeners}
        style={{ color: 'blue', display: 'block' }}
      >
        {typeof children === 'function' ? children(iState.state) : children}
      </As>
    );
  },
);
