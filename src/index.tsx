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
  (tagName !== 'INPUT' || (type !== 'checkbox' && type !== 'radio'));

// elements triggered by the space bar
const spaceKeyTrigger = ({ tagName, type }: Record<string, any>) =>
  ['BUTTON', 'SELECT'].includes(tagName) ||
  (tagName === 'INPUT' && ['checkbox', 'radio', 'submit'].includes(type));

// elements that should have cursor: pointer
const cursorPointerElement = ({ tagName, type }: Record<string, any>) =>
  ['BUTTON', 'A', 'AREA', 'SELECT'].includes(tagName) ||
  (tagName === 'INPUT' && ['checkbox', 'radio', 'submit'].includes(type));

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
  hoverClassName?: string;
  commonActiveClassName?: string;
  mouseActiveClassName?: string;
  touchActiveClassName?: string;
  keyActiveClassName?: string;
  commonFocusClassName?: string;
  focusFromKeyClassName?: string;
  focusFromMouseClassName?: string;
  focusFromTouchClassName?: string;
  disabledClassName?: string;
  hoverStyle?: React.CSSProperties;
  commonActiveStyle?: React.CSSProperties;
  mouseActiveStyle?: React.CSSProperties;
  touchActiveStyle?: React.CSSProperties;
  keyActiveStyle?: React.CSSProperties;
  commonFocusStyle?: React.CSSProperties;
  focusFromKeyStyle?: React.CSSProperties;
  focusFromMouseStyle?: React.CSSProperties;
  focusFromTouchStyle?: React.CSSProperties;
  disabledStyle?: React.CSSProperties;
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
          hoverClassName = 'hover',
          commonActiveClassName = 'active',
          mouseActiveClassName = 'mouseActive',
          touchActiveClassName = 'touchActive',
          keyActiveClassName = 'keyActive',
          commonFocusClassName = 'focus',
          focusFromKeyClassName = 'focusFromKey',
          focusFromMouseClassName = 'focusFromMouse',
          focusFromTouchClassName = 'focusFromTouch',
          disabledClassName = 'disabled',
          hoverStyle,
          commonActiveStyle,
          mouseActiveStyle,
          touchActiveStyle,
          keyActiveStyle,
          commonFocusStyle,
          focusFromKeyStyle,
          focusFromMouseStyle,
          focusFromTouchStyle,
          disabledStyle,
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
          iStateKey: 'hover';
          state: boolean;
          action: 'enter' | 'exit';
        }
        interface ActiveStateChange {
          iStateKey: 'active';
          state: ActiveState;
          action: 'enter' | 'exit';
        }
        interface FocusStateChange {
          iStateKey: 'focus';
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
              changes.forEach(({ iStateKey, state, action }) => {
                if (action === 'enter') {
                  // TS should known that iStateKey and state values are matched to each other
                  // based on the StateChangeFunction type above, but TS doesn't understand this
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  newState[iStateKey] = state;
                } else if (
                  action === 'exit' &&
                  previous.state[iStateKey] === state
                ) {
                  newState[iStateKey] = false;
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

            // switch
            //   focus/blur
            //   keydown/up
            //   default switch
            //     eventFrom mouse
            //       mouse/pointer enter
            //       mouse/pointer leave
            //       mouse/pointer down
            //       mouse/pointer up, pointercancel
            //     eventFrom touch
            //       touchstart/pointerdown
            //       touchend/pointerup, touchcancel, pointercancel, any mouse event from touch
            switch (e.type) {
              case 'focus':
                if (e.target === localRef.current) {
                  stateChange({
                    iStateKey: 'focus',
                    state: focusFromLookup[eventFrom(e)],
                    action: 'enter',
                  });
                }
                break;
              case 'blur':
                keyTracking.current.enterKeyDown = false;
                keyTracking.current.spaceKeyDown = false;
                stateChange(
                  {
                    iStateKey: 'focus',
                    state: false,
                    action: 'enter',
                  },
                  {
                    iStateKey: 'active',
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
                  iStateKey: 'active',
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
                          iStateKey: 'hover',
                          state: true,
                          action: 'enter',
                        });
                        break;
                      case 'mouseleave':
                      case 'pointerleave':
                        stateChange(
                          {
                            iStateKey: 'hover',
                            state: false,
                            action: 'enter',
                          },
                          {
                            iStateKey: 'active',
                            state: 'mouseActive',
                            action: 'exit',
                          },
                        );
                        break;
                      case 'mousedown':
                      case 'pointerdown':
                        stateChange({
                          iStateKey: 'active',
                          state: 'mouseActive',
                          action: 'enter',
                        });
                        break;
                      case 'mouseup':
                      case 'pointerup':
                      case 'pointercancel':
                        stateChange({
                          iStateKey: 'active',
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
                                iStateKey: 'active',
                                state: 'touchActive',
                                action: 'exit',
                              });
                            },
                            750,
                          );
                        }
                        stateChange({
                          iStateKey: 'active',
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
                          iStateKey: 'active',
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

        const defaultStyle: React.CSSProperties = {};
        if (
          !disabled &&
          (restProps.onClick ||
            restProps.onClickCapture ||
            restProps.onDoubleClick ||
            restProps.onDoubleClickCapture ||
            cursorPointerElement(localRef.current || {}))
        ) {
          defaultStyle.cursor = 'pointer';
        }
        if (
          typeof window === 'undefined' ||
          window.CSS.supports('-webkit-tap-highlight-color: transparent')
        ) {
          defaultStyle.WebkitTapHighlightColor = 'transparent';
        }

        const style: React.CSSProperties = {
          ...defaultStyle,
          ...restProps.style,
        };
        let className = restProps.className || '';

        const addToClassNameAndStyle = (
          newClassName: string,
          newStyle?: React.CSSProperties,
        ) => {
          className = [className, newClassName].filter((cN) => cN).join(' ');
          Object.assign(style, newStyle);
        };

        if (disabled) {
          addToClassNameAndStyle(disabledClassName, disabledStyle);
        } else {
          if (iState.state.hover) {
            addToClassNameAndStyle(hoverClassName, hoverStyle);
          }

          if (iState.state.active) {
            addToClassNameAndStyle(commonActiveClassName, commonActiveStyle);
            switch (iState.state.active) {
              case 'mouseActive':
                addToClassNameAndStyle(mouseActiveClassName, mouseActiveStyle);
                break;
              case 'touchActive':
                addToClassNameAndStyle(touchActiveClassName, touchActiveStyle);
                break;
              case 'keyActive':
                addToClassNameAndStyle(keyActiveClassName, keyActiveStyle);
                break;
            }
          }

          if (iState.state.focus) {
            addToClassNameAndStyle(commonFocusClassName, commonFocusStyle);
            switch (iState.state.focus) {
              case 'focusFromMouse':
                addToClassNameAndStyle(
                  focusFromMouseClassName,
                  focusFromMouseStyle,
                );
                break;
              case 'focusFromTouch':
                addToClassNameAndStyle(
                  focusFromTouchClassName,
                  focusFromTouchStyle,
                );
                break;
              case 'focusFromKey':
                addToClassNameAndStyle(
                  focusFromKeyClassName,
                  focusFromKeyStyle,
                );
                break;
            }
          }
        }

        let disabledProps: Record<string, unknown> | null = null;
        if (disabled) {
          disabledProps = {
            onClick: undefined,
            onClickCapture: undefined,
            onDoubleClick: undefined,
            onDoubleClickCapture: undefined,
            href: undefined,
          };
          if (
            typeof As === 'string' &&
            ['button', 'input', 'select', 'textarea'].includes(As as string)
          ) {
            disabledProps.disabled = true;
          }
        }

        return (
          <As
            {...restProps}
            {...eventListeners}
            {...disabledProps}
            className={className === '' ? undefined : className}
            style={style}
            ref={callbackRef}
          >
            {typeof children === 'function' ? children(iState.state) : children}
          </As>
        );
      },
    ),
  );
