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

const focusFromLookup: {
  mouse: 'focusFromMouse';
  touch: 'focusFromTouch';
  key: 'focusFromKey';
} = {
  mouse: 'focusFromMouse',
  touch: 'focusFromTouch',
  key: 'focusFromKey',
};

// elements triggered by the enter key, used to determine the keyActive state
const enterKeyTrigger = ({ tagName, type }: Record<string, any>) =>
  tagName !== 'SELECT' &&
  (tagName !== 'INPUT' || (type !== 'checkbox' && type !== 'radio'));

// elements triggered by the space bar, used to determine the keyActive state
const spaceKeyTrigger = ({ tagName, type }: Record<string, any>) =>
  ['BUTTON', 'SELECT'].includes(tagName) ||
  (tagName === 'INPUT' && ['checkbox', 'radio', 'submit'].includes(type));

// elements that should have cursor: pointer b/c clicking does something
const cursorPointerElement = ({ tagName, type }: Record<string, any>) =>
  ['BUTTON', 'A', 'AREA', 'SELECT'].includes(tagName) ||
  (tagName === 'INPUT' && ['checkbox', 'radio', 'submit'].includes(type));

// event listeners set by RI
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

const eventMapKeys = Object.keys(eventMap);

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
  // wrap Interactive in memo and forwardRef
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
        // what RI is rendered as in the DOM, default is <button>
        const As = as || 'button';

        ////////////////////////////////////

        // interactive state of the component (hover, active, focus)
        // save both current and previous state to pass to onStateChange prop callback
        const [iState, setIState] = React.useState<InteractiveStateChange>({
          state: initialState,
          prevState: initialState,
        });

        ////////////////////////////////////

        // onStateChange prop callback
        React.useEffect(
          () => {
            if (onStateChange) {
              onStateChange(iState);
            }
          },
          // only call this effect if the current state has changed
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [iState.state.hover, iState.state.active, iState.state.focus],
        );

        ////////////////////////////////////

        // support passed in ref prop as object or callback, and track ref locally
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

        ////////////////////////////////////

        // track enter key and space key state (down/up) as ref
        // used to determine keyActive state
        const keyTracking = React.useRef<{
          enterKeyDown: boolean;
          spaceKeyDown: boolean;
        }>({ enterKeyDown: false, spaceKeyDown: false });

        ////////////////////////////////////

        // track touchActive timer id as ref
        const touchActiveTimeoutId = React.useRef<number | undefined>(
          undefined,
        );
        // clear timer when component leaves the UI
        React.useEffect(
          () => () => window.clearTimeout(touchActiveTimeoutId.current),
          [],
        );

        ////////////////////////////////////

        // centralized stateChange function that takes an object payload indicating the state change:
        // - iStateKey: hover | active | focus
        // - state: the state value to change
        // - action: enter | exit, if the change is to enter or exit the specified state (are treated differently)
        // action: enter - always enter that state (result of enter/down/start events)
        // action: exit - exit that state (to false) only if currently in the specified state, otherwise do nothing
        // note that entering a state happens as a result of enter/down/start events,
        // while exiting a state happens as a result of leave/up/end/cancel events (and some others)

        // the stateChange function is idempotent so event handlers can be dumb (don't need to know the current state)
        // stateChange will bail on updating the state if the state hasn't changed to prevent unnecessary renders
        // for example mousedown and pointerdown (from mouse) event handlers
        // will both call stateChange with action enter mouseActive state
        // the first call will enter the mouseActive state, and the second call will cause stateChange to bail on the state update
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
        const stateChange: StateChangeFunction = React.useCallback(
          (...changes) => {
            setIState((previous) => {
              const newState = { ...previous.state };
              // stateChange accepts multiple changes in each function call
              // so update the newState for each change received
              changes.forEach(({ iStateKey, state, action }) => {
                if (action === 'enter') {
                  // TS should known that iStateKey and state values are matched to each other
                  // based on the StateChangeFunction type above, but TS doesn't understand this, so use as any
                  newState[iStateKey] = state as any;
                } else if (
                  // only exit a state (to false) if currently in that state
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
              // if the state has changed (deep equal comparison), then return the newInteractiveStateChange
              // otherwise bail on the setIState call and return the previous state (object with referential equality)
              return stateChanged(newInteractiveStateChange)
                ? newInteractiveStateChange
                : previous;
            });
          },
          [],
        );

        ////////////////////////////////////

        // handleEvent handles all events and is the only event handler used by RI
        // for example <As onMouseEnter={handleEvent} onPointerEnter={handleEvent} etc...>

        // always set all pointer/mouse/touch event listeners
        // instead of just pointer event listeners (when supported by the browser)
        // or mouse and touch listeners when pointer events is not supported
        // because
        //   - 1. the pointer events implementation is buggy on some devices
        //        so pointer events on its own is not a good option
        //        for example, on iPadOS pointer events from mouse will cease to fire for the entire page
        //        after using mouse and touch input at the same time on the same element (note that mouse events are unaffected)
        //   - 2. some browsers don't support touch events, so the only way to listen for touch input is via pointer events
        //        so only using mouse and touch events is not a good option
        //   - 3. the pointercancel event is incredibly useful for syncing the touchActive state with browser generated click events
        //        as it fires as soon as the browser uses the touch interaction for another purpose (e.g. scrolling)
        //        and this can't be replicated with touch events (touchcancel behaves differently)
        // so instead of trying to identify and work around all of the edge cases and bugs
        // the solution is to always set all listeners and make the stateChange function idempotent
        // and bail on updating state in setIState if the state hasn't changed to prevent unnecessary renders
        // also note that setting listeners for events not supported by the browser has no effect

        // useCallback so event handlers passed to <As> are referentially equivalent between renders
        // unless the event handlers received in props have changed (useCallback is dependent on them)
        const handleEvent = React.useCallback(
          (e: Record<string, any>) => {
            // nested switch statement to determine the appropriate stateChange
            // uses both e.type and eventFrom(e) in its routing logic
            // switch on e.type
            //   focus -> focus: enter focusFrom[eventFrom(e)]
            //   blur -> focus: enter false, active: exit keyActive
            //   keydown -> active: enter keyActive
            //   keyup -> active: exit keyActive
            //   default switch on eventFrom(e)
            //     eventFrom mouse
            //       switch on e.type
            //         mouse/pointer enter -> hover: enter true
            //         mouse/pointer leave -> hover: enter false, active: exit mouseActive
            //         mouse/pointer down -> active: enter mouseActive
            //         mouse/pointer up, pointercancel -> active: exit mouseActive
            //     eventFrom touch
            //       switch on e.type
            //         touchstart/pointerdown -> active: enter touchActive
            //         touchend/pointerup/touchcancel/pointercancel/any-mouse-event-from-touch -> active: exit touchActive
            switch (e.type) {
              case 'focus':
                // only enter focus state if RI is the target of the focus event (focus events bubble in react)
                if (e.target === localRef.current) {
                  stateChange({
                    iStateKey: 'focus',
                    state: focusFromLookup[eventFrom(e)],
                    action: 'enter',
                  });
                }
                break;
              case 'blur':
                // reset keyTracking when the element is blurred (can't be the target of key events)
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
                // update keyTracking and bail if the event is not from the space or enter key
                if (e.key === ' ') {
                  keyTracking.current.spaceKeyDown = e.type === 'keydown';
                } else if (e.key === 'Enter') {
                  keyTracking.current.enterKeyDown = e.type === 'keydown';
                } else {
                  // break (bail out) if e.key is not the space or enter key so stateChange isn't called
                  break;
                }
                stateChange({
                  iStateKey: 'active',
                  state: 'keyActive',
                  action:
                    // use space and enter key down state to determine the enter/exit action
                    // based on what keys trigger the the RI element
                    // some elements are triggered by the space key, some by the enter key, and some by both
                    (keyTracking.current.enterKeyDown &&
                      enterKeyTrigger(localRef.current || {})) ||
                    (keyTracking.current.spaceKeyDown &&
                      spaceKeyTrigger(localRef.current || {}))
                      ? 'enter'
                      : 'exit',
                });
                break;
              default:
                // switch on eventFrom for pointer, mouse, and touch events
                // for example, a mouse event from mouse input is very different than a mouse event from touch input
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
                          // leave events also exit mouseActive because after the mouse leaves, mouseup events are not fired on the element
                          // for example, mouse enter -> button down -> mouse leave -> button up, would leave RI stuck in the mouseActive state
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
                        // to sync the touchActive state with the click event fired by the browser
                        // only stay in the touchActive state for a max of 750ms
                        // note that most of the time another event (up/end/cancel) will exit touchActive before the timer finishes
                        // if the touchActive timer is not running, then start a new one
                        // don't reset a running timer since adding more touches shouldn't extend the touchActive state
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
                      // exit touchActive on any mouse event from touch
                      // because on android, mouse events (and focus and context menu) fire ~500ms after touch start
                      // once they fire, click will never be fired, so exit touchActive
                      // eslint-disable-next-line no-fallthrough
                      case 'mouseenter':
                      case 'mouseleave':
                      case 'mousedown':
                      case 'mouseup':
                        // clear the touchActive timer so it can be restarted if the user double taps
                        // or any rapid tapping that is faster than the touchActive timer
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

            // call event handler prop for the current event if the prop is passed in
            if (restProps[eventMap[e.type]]) {
              restProps[eventMap[e.type]](e);
            }
          },
          // handleEvent is dependent on event handler props that are also in eventMap
          // for example, restProps.onMouseEnter, restProps.onTouchStart, etc
          // this generates an array of event handler props that are also in eventMap
          // handleEvent is also dependent on stateChange, but this will always be referentially equivalent
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [...eventMapKeys.map((key) => restProps[eventMap[key]]), stateChange],
        );

        ////////////////////////////////////

        // create object with event listeners to pass to <As>
        const eventListeners = React.useMemo(
          () =>
            eventMapKeys.reduce(
              (
                objWithListeners: Record<string, React.EventHandler<any>>,
                eventMapKey,
              ) => {
                objWithListeners[eventMap[eventMapKey]] = handleEvent;
                return objWithListeners;
              },
              {},
            ),
          [handleEvent],
        );

        ////////////////////////////////////

        // compute className and style props based on the current state

        // css classes are merged into this string
        let className = restProps.className || '';

        // style objects are merged into this object with the following precedence:
        // style object <= default styles <= style prop <= (disabledStyle || hoverStyle <= commonActiveStyle <= [input]ActiveStyle <= commonFocusStyle <= focusFrom[input]Style)
        const style: React.CSSProperties = {};

        // add default styles
        if (
          // if clicking does something and RI is not disabled, then set the cursor to pointer for better UX
          !disabled &&
          (restProps.onClick ||
            restProps.onClickCapture ||
            cursorPointerElement(localRef.current || {}))
        ) {
          style.cursor = 'pointer';
        }
        if (
          // remove webkit-tap-highlight-color if the browser uses it, or if server rendering (don't know if the browser uses it)
          typeof window === 'undefined' ||
          window.CSS.supports('-webkit-tap-highlight-color: transparent')
        ) {
          style.WebkitTapHighlightColor = 'transparent';
        }

        // add style prop passed to RI
        Object.assign(style, restProps.style);

        // helper function to merge class names and style objects into the className and style props
        const addToClassAndStyleProps = (
          addClassName: string,
          addStyle?: React.CSSProperties,
        ) => {
          className = [className, addClassName].filter((cN) => cN).join(' ');
          Object.assign(style, addStyle);
        };

        // if disabled, add disabled className and style props,
        // otherwise add hover, active, and focus className/style props (only add those if not disabled)
        if (disabled) {
          addToClassAndStyleProps(disabledClassName, disabledStyle);
        } else {
          if (iState.state.hover) {
            addToClassAndStyleProps(hoverClassName, hoverStyle);
          }

          if (iState.state.active) {
            addToClassAndStyleProps(commonActiveClassName, commonActiveStyle);
            switch (iState.state.active) {
              case 'mouseActive':
                addToClassAndStyleProps(mouseActiveClassName, mouseActiveStyle);
                break;
              case 'touchActive':
                addToClassAndStyleProps(touchActiveClassName, touchActiveStyle);
                break;
              case 'keyActive':
                addToClassAndStyleProps(keyActiveClassName, keyActiveStyle);
                break;
            }
          }

          if (iState.state.focus) {
            addToClassAndStyleProps(commonFocusClassName, commonFocusStyle);
            switch (iState.state.focus) {
              case 'focusFromMouse':
                addToClassAndStyleProps(
                  focusFromMouseClassName,
                  focusFromMouseStyle,
                );
                break;
              case 'focusFromTouch':
                addToClassAndStyleProps(
                  focusFromTouchClassName,
                  focusFromTouchStyle,
                );
                break;
              case 'focusFromKey':
                addToClassAndStyleProps(
                  focusFromKeyClassName,
                  focusFromKeyStyle,
                );
                break;
            }
          }
        }

        ////////////////////////////////////

        // disable RI when it is passed a disabled prop
        // note that the RI state will continue to change when disabled
        // but the className and style props are set to disabledClassName and disabledStyle (see above),
        // and click event handlers and href props will be removed

        // disable certain props by setting the value to undefined if RI is disabled
        let disabledProps: Record<string, unknown> | null = null;
        if (disabled) {
          disabledProps = {
            onClick: undefined,
            onClickCapture: undefined,
            onDoubleClick: undefined,
            onDoubleClickCapture: undefined,
            // remove href to disable <a> and <area> tags
            // setting href to undefined makes it ok to pass to any element/component, not just <a> and <area>
            href: undefined,
          };

          // if As supports the disabled prop, then pass through the disabled prop
          // don't pass disabled prop if As is a component because don't know if the component supports it
          // for example, <SomeButton> component may not support the disabled prop even though it renders a <button> tag that does
          // which is why localRef.current.tagName is not used to determine if the disabled prop is supported
          if (
            typeof As === 'string' &&
            ['button', 'input', 'select', 'textarea'].includes(As as string)
          ) {
            disabledProps.disabled = true;
          }
        }

        // if RI is disabled and has focus (it shouldn't), then call el.blur() to blur the element
        React.useEffect(() => {
          if (disabled && iState.state.focus && localRef.current) {
            localRef.current.blur();
          }
        }, [disabled, iState.state.focus]);

        ////////////////////////////////////

        return (
          <As
            {...restProps}
            {...eventListeners}
            {...disabledProps}
            className={className === '' ? undefined : className}
            style={style}
            ref={callbackRef}
          >
            {
              // if children is a function, then pass it the current interactive state
              typeof children === 'function' ? children(iState.state) : children
            }
          </As>
        );
      },
    ),
  );

if (process.env.NODE_ENV !== 'production') {
  // TODO get displayName working with polymorphic props, maybe use new lib https://github.com/kripod/react-polymorphic-types
  // for some reason using polymorphic props typing doesn't allow displayName to be added
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Interactive.displayName = 'Interactive';
}
