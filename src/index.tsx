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
}

export type InteractiveStateKey = 'hover' | 'active' | 'focus';

export interface InteractiveStateChange {
  state: InteractiveState;
  prevState: InteractiveState;
}

const initialState: InteractiveState = {
  hover: false,
  active: false,
  focus: false,
};

const stateChanged = ({ state, prevState }: InteractiveStateChange) =>
  state.hover !== prevState.hover ||
  state.active !== prevState.active ||
  state.focus !== prevState.focus;

// elements triggered by the enter key
const enterKeyTrigger = ({ tagName, type }: Record<string, any>) =>
  tagName !== 'SELECT' &&
  (tagName !== 'INPUT' ||
    (type.toLowerCase() !== 'checkbox' && type.toLowerCase() !== 'radio'));

// elements triggered by the space bar
const spaceKeyTrigger = ({ tagName, type }: Record<string, any>) =>
  tagName === 'BUTTON' ||
  tagName === 'SELECT' ||
  (tagName === 'INPUT' &&
    (type.toLowerCase() === 'checkbox' ||
      type.toLowerCase() === 'radio' ||
      type.toLowerCase() === 'submit'));

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
  disabled?: boolean;
}

export const Interactive: <C extends React.ElementType = 'button'>(
  props: PolymorphicComponentProps<C, InteractiveProps>,
) => React.ReactElement | null =
  // TODO get displayName working with polymorphic props, maybe use new lib https://github.com/kripod/react-polymorphic-types
  // eslint-disable-next-line react/display-name
  React.memo(
    React.forwardRef(
      <C extends React.ElementType = 'button'>(
        {
          as,
          children,
          onStateChange,
          disabled,
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
          [iState.state.hover, iState.state.active, iState.state.focus],
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
        type StateChangeFunction = (
          ...changes: (
            | HoverStateChange
            | ActiveStateChange
            | FocusStateChange
          )[]
        ) => void;
        // stateChange is idempotent so event handlers can be dumb (don't need to know current state)
        // for example mousedown and pointerdown event handlers
        // will both call stateChange with action enter mouseActive state
        const stateChange: StateChangeFunction = React.useCallback(
          (...changes) => {
            setIState((previous) => {
              const newState = { ...previous.state };
              changes.forEach(({ iKey, state, action }) => {
                if (action === 'enter') {
                  // TS should known that iKey and state values are matched to each other
                  // based on the StateChangeFunction type above, but TS doesn't understand this
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  newState[iKey] = state;
                } else if (
                  action === 'exit' &&
                  previous.state[iKey] === state
                ) {
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
          },
          [],
        );

        const keyTracking = React.useRef<{
          enterKeyDown: boolean;
          spaceKeyDown: boolean;
        }>({ enterKeyDown: false, spaceKeyDown: false });

        const touchActiveTimeoutId = React.useRef<number | undefined>(
          undefined,
        );
        React.useEffect(
          () => () => window.clearTimeout(touchActiveTimeoutId.current),
          [],
        );

        const handleEvent = React.useCallback(
          (e: Record<string, any>) => {
            const focusFromLookup: {
              mouse: 'focusFromMouse';
              touch: 'focusFromTouch';
              key: 'focusFromKey';
            } = {
              mouse: 'focusFromMouse',
              touch: 'focusFromTouch',
              key: 'focusFromKey',
            };

            switch (e.type) {
              case 'focus':
                stateChange({
                  iKey: 'focus',
                  state: focusFromLookup[eventFrom(e)],
                  action: 'enter',
                });
                break;
              case 'blur':
                keyTracking.current.enterKeyDown = false;
                keyTracking.current.spaceKeyDown = false;
                stateChange(
                  {
                    iKey: 'focus',
                    state: false,
                    action: 'enter',
                  },
                  {
                    iKey: 'active',
                    state: 'keyActive',
                    action: 'exit',
                  },
                );
                break;
              case 'keydown':
              case 'keyup':
                if (e.key === ' ') {
                  keyTracking.current.spaceKeyDown = e.type === 'keydown';
                } else if (e.key === 'Enter') {
                  keyTracking.current.enterKeyDown = e.type === 'keydown';
                } else {
                  break;
                }
                stateChange({
                  iKey: 'active',
                  state: 'keyActive',
                  action:
                    (keyTracking.current.enterKeyDown &&
                      enterKeyTrigger(localRef.current || {})) ||
                    (keyTracking.current.spaceKeyDown &&
                      spaceKeyTrigger(localRef.current || {}))
                      ? 'enter'
                      : 'exit',
                });
                break;
              default:
                switch (eventFrom(e)) {
                  case 'mouse':
                    switch (e.type) {
                      case 'mouseenter':
                      case 'pointerenter':
                        stateChange({
                          iKey: 'hover',
                          state: true,
                          action: 'enter',
                        });
                        break;
                      case 'mouseleave':
                      case 'pointerleave':
                        stateChange(
                          {
                            iKey: 'hover',
                            state: false,
                            action: 'enter',
                          },
                          {
                            iKey: 'active',
                            state: 'mouseActive',
                            action: 'exit',
                          },
                        );
                        break;
                      case 'mousedown':
                      case 'pointerdown':
                        stateChange({
                          iKey: 'active',
                          state: 'mouseActive',
                          action: 'enter',
                        });
                        break;
                      case 'mouseup':
                      case 'pointerup':
                      case 'pointercancel':
                        stateChange({
                          iKey: 'active',
                          state: 'mouseActive',
                          action: 'exit',
                        });
                        break;
                    }
                    break;
                  case 'touch':
                    switch (e.type) {
                      case 'touchstart':
                      case 'pointerdown':
                        if (!touchActiveTimeoutId.current) {
                          touchActiveTimeoutId.current = window.setTimeout(
                            () => {
                              touchActiveTimeoutId.current = undefined;
                              stateChange({
                                iKey: 'active',
                                state: 'touchActive',
                                action: 'exit',
                              });
                            },
                            1000,
                          );
                        }
                        stateChange({
                          iKey: 'active',
                          state: 'touchActive',
                          action: 'enter',
                        });
                        break;
                      case 'touchend':
                      case 'touchcancel':
                      case 'pointerup':
                      case 'pointercancel':
                      case 'mouseenter':
                      case 'mouseleave':
                      case 'mousedown':
                      case 'mouseup':
                        if (touchActiveTimeoutId.current) {
                          window.clearTimeout(touchActiveTimeoutId.current);
                          touchActiveTimeoutId.current = undefined;
                        }
                        stateChange({
                          iKey: 'active',
                          state: 'touchActive',
                          action: 'exit',
                        });
                        break;
                    }
                    break;
                }
                break;
            }

            // call event handler for the current event if it is passed in as a prop
            if (restProps[eventMap[e.type]]) {
              restProps[eventMap[e.type]](e);
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

        // blur focused element when disabled
        React.useEffect(() => {
          if (disabled && iState.state.focus && localRef.current) {
            localRef.current.blur();
          }
        }, [disabled, iState.state.focus]);

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
    ),
  );
