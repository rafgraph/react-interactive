import * as React from 'react';
import { eventFrom, setEventFrom } from 'event-from';
import {
  stateChanged,
  enterKeyTrigger,
  spaceKeyTrigger,
  cursorPointerElement,
  setUserSelectOnBody,
} from './utils';
import {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithoutRef,
  PolymorphicPropsWithRef,
  PolymorphicMemoExoticComponent,
} from 'react-polymorphic-types';

export { eventFrom, setEventFrom };

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

// event listeners set by RI
const eventMap: Record<string, string> = {
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
  dragstart: 'onDragStart',
  dragend: 'onDragEnd',
};

const eventListenerPropNames = Object.values(eventMap);

const defaultAs = 'button';

export interface InteractiveOwnProps {
  children?: React.ReactNode | ((state: InteractiveState) => React.ReactNode);
  onStateChange?: ({ state, prevState }: InteractiveStateChange) => void;
  disabled?: boolean;
  useExtendedTouchActive?: boolean;
  useWebkitTapHighlightColor?: boolean;
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

/**
 * Usage: `InteractiveProps<'button'>`, or `InteractiveProps<typeof Component>`
 *
 * Only use the `InteractiveProps` type when typing props that are directly passed to an `<Interactive>` component.
 * `InteractiveProps` includes the `as` prop and `ref` prop and should not be used for
 * typing components that wrap an `<Interactive>` component.
 *
 * For typing components that wrap an `<Interactive>` component use the type `InteractiveComposableProps`
 *
 * For more see: https://github.com/rafgraph/react-interactive#using-with-typescript
 */
export type InteractiveProps<
  T extends React.ElementType = typeof defaultAs
> = PolymorphicPropsWithRef<InteractiveOwnProps, T>;

export type InteractivePropsWithoutRef<
  T extends React.ElementType = typeof defaultAs
> = PolymorphicPropsWithoutRef<InteractiveOwnProps, T>;

/**
 * Usage: `InteractiveComposableProps<'button'>`, or `InteractiveComposableProps<typeof Component>`
 *
 * Use the `InteractiveComposableProps` type when typing components that wrap an `<Interactive>` component
 * where the props are passed through to the `<Interactive>` component.
 *
 * For more see: https://github.com/rafgraph/react-interactive#using-with-typescript
 */
export type InteractiveComposableProps<
  T extends React.ElementType = typeof defaultAs
> = Omit<InteractivePropsWithoutRef<T>, 'as'>;

// InteractiveNotMemoized is wrapped in React.memo() and exported at the end of this file
export const InteractiveNotMemoized: PolymorphicForwardRefExoticComponent<
  InteractiveOwnProps,
  typeof defaultAs
> = React.forwardRef(function <T extends React.ElementType = typeof defaultAs>(
  {
    as,
    children,
    onStateChange,
    disabled = false,
    useExtendedTouchActive = false,
    useWebkitTapHighlightColor = false,
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
  }: PolymorphicPropsWithoutRef<InteractiveOwnProps, T>,
  ref: React.ForwardedRef<typeof restProps.ref>,
) {
  ////////////////////////////////////

  // what RI is rendered as in the DOM, default is <button>
  const As = as || defaultAs;

  ////////////////////////////////////

  // interactive state of the component (hover, active, focus)
  // save both current and previous state to pass to onStateChange prop callback
  const [iState, setIState] = React.useState<InteractiveStateChange>({
    state: initialState,
    prevState: initialState,
  });

  // used as a dependency for useEffect, as well as for logic involving useExtendedTouchActive
  const inTouchActiveState = iState.state.active === 'touchActive';

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

  // track if the element is being dragged
  // used to stay in the respective active state while dragging
  const dragTracking = React.useRef<{
    isDragging: boolean;
  }>({ isDragging: false });

  ////////////////////////////////////

  // centralized stateChange function that takes a payload indicating the state change:
  // - iStateKey: hover | active | focus
  // - state: the state value to change
  // - action: enter | exit
  // action: enter - always enter that state
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
    ...changes: (HoverStateChange | ActiveStateChange | FocusStateChange)[]
  ) => void;
  const stateChange: StateChangeFunction = React.useCallback((...changes) => {
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
          previous.state[iStateKey] === state &&
          // if currently dragging the element, then don't exit the active state
          (!dragTracking.current.isDragging || iStateKey !== 'active')
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
  }, []);

  ////////////////////////////////////

  // handleEvent handles all events that change the interactive state of the component
  // for example <As onMouseEnter={handleEvent} onPointerEnter={handleEvent} etc...>

  // always set all pointer/mouse/touch event listeners
  // instead of just pointer event listeners (when supported by the browser)
  // or mouse and touch listeners when pointer events are not supported
  // because
  //   - 1. the pointer events implementation is buggy on some devices
  //        so pointer events on its own is not a good option
  //        for example, on iPadOS pointer events from mouse will cease to fire for the entire page
  //        after using mouse and touch input at the same time on the same element (note that mouse events are unaffected)
  //   - 2. the pointercancel event is useful for syncing the touchActive state with browser generated click events
  //        as it fires as soon as the browser uses the touch interaction for another purpose (e.g. scrolling)
  //        and this can't be replicated with touch events (touchcancel behaves differently)
  //   - 3. the touchend/cancel event is useful to support useExtendedTouchActive as it won't fire until the
  //        the touch point is removed from the screen, which can only be replicated with pointer events
  //        if touch-action: none is set on the element, which has unwanted side effects (e.g. can't scroll if the touch started on the element)
  // so instead of trying to identify and work around all of the edge cases and bugs and set different listeners in each situation
  // the solution is to always set all listeners and make the stateChange function idempotent
  // and bail on updating state in setIState if the state hasn't changed to prevent unnecessary renders
  // also note that setting listeners for events not supported by the browser has no effect

  // useCallback so event handlers passed to <As> are referentially equivalent between renders
  const handleEvent = React.useCallback(
    (
      e:
        | React.MouseEvent
        | React.PointerEvent
        | React.TouchEvent
        | React.KeyboardEvent
        | React.FocusEvent
        | React.DragEvent,
    ) => {
      // nested switch statement to determine the appropriate stateChange
      // uses both e.type and eventFrom(e) in its routing logic
      // switch on e.type
      //   focus -> focus: enter focusFrom[eventFrom(e)]
      //   blur -> focus: enter false, active: exit keyActive
      //   keydown -> active: enter keyActive
      //   keyup -> active: exit keyActive
      //   dragstart -> active: enter `${eventFrom(e)}Active`
      //   dragend -> active: enter false
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
              state: `focusFrom${eventFrom(e).replace(/^\w/, (c) =>
                c.toUpperCase(),
              )}` as FocusState,
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
          if ((e as React.KeyboardEvent).key === ' ') {
            keyTracking.current.spaceKeyDown = e.type === 'keydown';
          } else if ((e as React.KeyboardEvent).key === 'Enter') {
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
        case 'dragstart':
          dragTracking.current.isDragging = true;
          stateChange({
            iStateKey: 'active',
            state: `${eventFrom(e)}Active` as ActiveState,
            action: 'enter',
          });
          break;
        case 'dragend':
          dragTracking.current.isDragging = false;
          stateChange({
            iStateKey: 'active',
            state: false,
            action: 'enter',
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
                  // if useExtendedTouchActive then only exit touchActive on touchend and touchcancel events
                  // which won't fire until the touch point is removed from the screen
                  if (
                    !useExtendedTouchActive ||
                    ['touchend', 'touchcancel'].includes(e.type)
                  ) {
                    stateChange({
                      iStateKey: 'active',
                      state: 'touchActive',
                      action: 'exit',
                    });
                  }
                  break;
              }
              break;
          }
          break;
      }

      // call event handler prop for the current event if the prop is passed in
      if (restProps[eventMap[e.type] as any]) {
        restProps[eventMap[e.type] as any](e);
      }
    },
    // handleEvent is dependent on event handler props that are also in eventMap
    // for example, restProps.onMouseEnter, restProps.onTouchStart, etc
    // this generates an array of event handler props that are also in eventMap
    // handleEvent is also dependent on stateChange, but this will always be referentially equivalent
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...eventListenerPropNames.map(
        (listenerPropName) => restProps[listenerPropName as any],
      ),
      useExtendedTouchActive,
      stateChange,
    ],
  );

  ////////////////////////////////////

  // prevent the context menu from popping up on long touch when useExtendedTouchActive is true
  const { onContextMenu } = restProps;
  const handleContextMenuEvent = React.useCallback(
    (e: React.MouseEvent) => {
      if (inTouchActiveState && useExtendedTouchActive) {
        e.preventDefault();
      }
      if (onContextMenu) {
        (onContextMenu as React.MouseEventHandler)(e);
      }
    },
    [inTouchActiveState, useExtendedTouchActive, onContextMenu],
  );

  ////////////////////////////////////

  // create object with event listeners to pass to <As {...eventListeners}>
  const eventListeners: Record<string, React.ReactEventHandler> = {
    onContextMenu: handleContextMenuEvent,
  };
  eventListenerPropNames.forEach((listenerPropName) => {
    eventListeners[listenerPropName] = handleEvent;
  });

  ////////////////////////////////////

  // to sync the touchActive state with the click event fired by the browser
  // only stay in the touchActive state for a max of 750ms
  // note that most of the time another event (up/end/cancel) will exit touchActive before the timer finishes
  // in which case the effect clean up will run (because inTouchActiveState state changed)
  // and the timer will be cleared

  // track touchActive timer id as ref
  const touchActiveTimeoutId = React.useRef<number | undefined>(undefined);

  // effect run on touchActive state change, or if useExtendedTouchActive prop changes
  // it will always clear the existing timer before potentially setting a new one
  React.useEffect(() => {
    if (inTouchActiveState && !useExtendedTouchActive) {
      touchActiveTimeoutId.current = window.setTimeout(() => {
        stateChange({
          iStateKey: 'active',
          state: 'touchActive',
          action: 'exit',
        });
      }, 750);

      return () => window.clearTimeout(touchActiveTimeoutId.current);
    }
    return;
  }, [inTouchActiveState, useExtendedTouchActive, stateChange]);

  ////////////////////////////////////

  // set user-select: none when useExtendedTouchActive and in the touchActive state
  // to prevent the browser from selecting text on long touch
  // note that it needs to be set on the body not the RI element
  // because iOS will still select nearby text if it is only set on the element
  React.useEffect(() => {
    if (inTouchActiveState && useExtendedTouchActive) {
      setUserSelectOnBody('none');
      return () => setUserSelectOnBody('');
    }
    return;
  }, [inTouchActiveState, useExtendedTouchActive]);

  ////////////////////////////////////

  // compute className and style props based on the current state

  // css classes are merged into this string
  let className = restProps.className || '';

  // style objects are merged into this object with the following precedence:
  // style object <= default styles <= style prop <= (disabledStyle || hoverStyle <= commonActiveStyle <= [input]ActiveStyle <= commonFocusStyle <= focusFrom[input]Style)
  const style: React.CSSProperties = {};

  // add default styles
  if (!useWebkitTapHighlightColor) {
    // style.WebkitTapHighlightColor = 'transparent';
  }
  if (
    // if clicking does something and RI is not disabled, then set the cursor to pointer for better UX
    !disabled &&
    (restProps.onClick ||
      restProps.onClickCapture ||
      cursorPointerElement(localRef.current || {}))
  ) {
    style.cursor = 'pointer';
  }
  if (inTouchActiveState && useExtendedTouchActive) {
    // set webkit-touch-callout: none to prevent the iOS "context menu" from popping up on long touch
    // note that iOS doesn't fire contextmenu events so need to set webkit-touch-callout
    style.WebkitTouchCallout = 'none';
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
  // otherwise add hover, active, and focus className/style props
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
          addToClassAndStyleProps(focusFromMouseClassName, focusFromMouseStyle);
          break;
        case 'focusFromTouch':
          addToClassAndStyleProps(focusFromTouchClassName, focusFromTouchStyle);
          break;
        case 'focusFromKey':
          addToClassAndStyleProps(focusFromKeyClassName, focusFromKeyStyle);
          break;
      }
    }
  }

  // memoize style object so it remains referentially equivalent if the style hasn't changed
  const memoizedStyle = React.useMemo(
    () => style,
    // join styles into string b/c react errors if the dependency array is not the same length each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Object.entries(style).join()],
  );

  ////////////////////////////////////

  // disable RI when it is passed a disabled prop
  // note that the RI state will continue to change when disabled
  // but the className and style props are set to disabledClassName and disabledStyle (see above),
  // and click event handlers and href props will be removed

  // disable certain props by setting the value to undefined if RI is disabled
  let disabledProps: Record<string, undefined | boolean> | null = null;
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

    // if the As DOM element supports the disabled prop, then pass through the disabled prop
    if (
      ['button', 'input', 'select', 'textarea'].includes(
        typeof As === 'string'
          ? (As as string)
          : localRef.current
          ? localRef.current.tagName.toLowerCase()
          : '',
      )
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
      // if useExtendedTouchActive then prevent long touch from dragging links
      // allow draggable to be overridden by passed in draggable prop from restProps
      draggable={
        inTouchActiveState && useExtendedTouchActive ? false : undefined
      }
      {...restProps}
      {...eventListeners}
      {...disabledProps}
      className={className === '' ? undefined : className}
      style={memoizedStyle}
      ref={callbackRef}
    >
      {
        // if children is a function, then pass it the current interactive state
        typeof children === 'function' ? children(iState.state) : children
      }
    </As>
  );
});

export const Interactive: PolymorphicMemoExoticComponent<
  InteractiveOwnProps,
  typeof defaultAs
> = React.memo(InteractiveNotMemoized);

if (process.env.NODE_ENV !== 'production') {
  Interactive.displayName = 'Interactive';
}
