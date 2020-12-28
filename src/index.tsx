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

    const handleEvent = (e: React.UIEvent) => {
      // call event handler for the current event if it is passed in as a prop
      if (restProps[eventMap[e.type]]) {
        restProps[eventMap[e.type]](e);
      }

      // TODO nested switch

      if (eventFrom(e) === 'mouse') {
        if (e.type === 'mouseenter') {
          updateIState((previous) => ({
            state: { ...previous.state, hover: true },
            prevState: previous.state,
          }));
        } else if (e.type === 'mouseleave') {
          updateIState((previous) => ({
            state: { ...previous.state, hover: false },
            prevState: previous.state,
          }));
        }
      }
    };

    // create object with event listeners to pass to <As>
    const eventListeners = Object.keys(eventMap).reduce(
      (
        objWithListeners: Record<string, React.EventHandler<any>>,
        listenerPropName,
      ) => {
        objWithListeners[eventMap[listenerPropName]] = handleEvent;
        return objWithListeners;
      },
      {},
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
