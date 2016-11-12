import React from 'react';
import objectAssign from 'object-assign';
import propTypes from './propTypes';
import compareProps from './compareProps';
import mergeAndExtractProps from './mergeAndExtractProps';
import extractStyle from './extractStyle';
import input, { updateMouseFromRI } from './inputTracker';
import { notifyOfNext, cancelNotifyOfNext } from './notifier';
import { knownProps, mouseEvents, touchEvents, otherEvents, dummyEvent, deviceType,
  hasTouchEventsApi } from './constants';

class ReactInteractive extends React.Component {
  static propTypes = propTypes;

  constructor(props) {
    super(props);

    // state is always an object with three keys, `iState`, `focus`, and `focusFrom`
    this.state = {
      // iState is always 1 of 5 strings:
      // 'normal', 'hover', 'hoverActive', 'touchActive', 'keyActive'
      iState: 'normal',
      // focus is always a boolean
      focus: false,
      // focusFrom is undefined if focus is false, otherwise it's 1 of 3 strings:
      // 'tab', 'mouse', 'touch'
      focusFrom: undefined,
    };

    // things to keep track of so RI knows what to do when
    this.track = {
      touchDown: false,
      recentTouch: false,
      touches: { points: {}, active: 0 },
      mouseOn: false,
      buttonDown: false,
      focus: false,
      focusFrom: 'reset',
      previousFocusFrom: 'reset',
      focusTransition: 'reset',
      focusStateOnMouseDown: false,
      spaceKeyDown: false,
      enterKeyDown: false,
      drag: false,
      updateTopNode: false,
      notifyOfNext: {},
      timeoutIDs: {},
      state: this.state,
    };

    // the node returned by the ref callback
    this.refNode = null;
    // the actual top DOM node of `as`, needed when `as` is wrapped in a span (is ReactComponent)
    this.topNode = null;
    // tagName and type properties of topNode
    this.tagName = '';
    this.type = '';

    // the event handlers to pass down as props to the element/component
    this.eventHandlers = this.setupEventHandlers();

    // this.p is used to store things that are a deterministic function of props
    // to avoid recalculating every time they are needed, it can be thought of as a pure
    // extension to props and is only updated in the constructor and componentWillReceiveProps
    this.p = { sameProps: false };
    // set properties of `this.p`
    this.propsSetup(props);
    // if initialState prop, update state.iState for initial render, note that state.focus
    // will be updated in componentDidMount b/c can't call focus until have ref to DOM node
    if (this.p.props.initialState && this.p.props.initialState.iState) {
      this.forceTrackIState(this.p.props.initialState.iState);
      this.state = this.computeState();
    }
  }

  componentDidMount() {
    // enter focus state if initialState.focus - called here instead of constructor
    // because can't call focus until have ref to DOM node
    if (this.p.props.initialState && typeof this.p.props.initialState.focus === 'boolean') {
      this.forceState({
        focus: this.p.props.initialState.focus,
        focusFrom: this.p.props.initialState.focusFrom,
      });
      return;
    }
  }

  componentWillReceiveProps(nextProps) {
    // set if the `topNode` needs to be updated in componentDidUpdate => `as` is different
    // and not a string, note that if `as` is a new string, then the `refCallback`
    // will be called by React so no need to do anything in componentDidUpdate
    this.track.updateTopNode = (this.props.as !== nextProps.as && typeof this.props.as !== 'string'
    && typeof nextProps.as !== 'string');

    // check if nextProps are the same as this.props
    this.p.sameProps = false;
    if (!nextProps.mutableProps && compareProps(this.props, nextProps)) {
      this.p.sameProps = true;
    } else {
      // if not same props, do props setup => set properties of `this.p`
      this.propsSetup(nextProps);
    }

    // if `forceState` prop, then force update state
    if (this.p.props.forceState) this.forceState(this.p.props.forceState);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // or statement, returns true on first true value, returns false if all are false
    return (
      // return true if props have changed since last render
      (!this.p.sameProps && nextProps !== this.props)
      ||
      // if `iState` changed, AND the `style` or `className` for the new `iState` is different,
      // prevents renders when switching b/t two states that have the same `style` and `className`
      (nextState.iState !== this.state.iState &&
      (this.p[`${nextState.iState}Style`].style !== this.p[`${this.state.iState}Style`].style ||
      this.p[`${nextState.iState}Style`].className !==
      this.p[`${this.state.iState}Style`].className))
      ||
      // if `focus` state changed, AND `focus` state has `style` or `className` associiated with it
      ((nextState.focus !== this.state.focus) &&
      (this.p[`${nextState.focus ? nextState.focusFrom : this.state.focusFrom}FocusStyle`].style
        !== null ||
      this.p[`${nextState.focus ? nextState.focusFrom : this.state.focusFrom}FocusStyle`].className
        !== '')
      )
    );
  }

  componentDidUpdate() {
    // `refCallback` isn't called by React when `as` is a component because the span wrapper
    // remains the same element and is not re-mounted in the DOM, so need to call refCallback here
    // if `as` is new and a component (`updateTopNode` was set in componentWillReceiveProps).
    if (this.track.updateTopNode) {
      this.track.updateTopNode = false;
      this.refCallback(this.refNode);
    }
  }

  componentWillUnmount() {
    Object.keys(this.track.notifyOfNext).forEach((eType) => {
      cancelNotifyOfNext(eType, this.track.notifyOfNext[eType]);
    });
    Object.keys(this.track.timeoutIDs).forEach((timer) => {
      window.clearTimeout(this.track.timeoutIDs[timer]);
    });
  }

  // determine event handlers to use based on the device type - only determined once in constructor
  setupEventHandlers() {
    const eventHandlers = {};
    Object.keys(otherEvents).forEach((event) => {
      eventHandlers[otherEvents[event]] = this.handleEvent;
    });

    if (hasTouchEventsApi) {
      Object.keys(touchEvents).forEach((event) => {
        eventHandlers[touchEvents[event]] = this.handleEvent;
      });
    }
    // if the device is mouseOnly or hybrid, then set mouse listeners
    if (deviceType !== 'touchOnly') {
      Object.keys(mouseEvents).forEach((event) => {
        eventHandlers[mouseEvents[event]] = this.handleEvent;
      });
    }
    return eventHandlers;
  }

  // find and set the top DOM node of `as`
  refCallback = (node) => {
    this.refNode = node;
    if (node) {
      const prevTopNode = this.topNode;
      // if `as` is a component, then the `refNode` is the span wrapper, so get its firstChild
      if (typeof this.p.props.as !== 'string') this.topNode = node.firstChild;
      else this.topNode = node;
      this.tagName = this.topNode.tagName.toLowerCase();
      this.type = this.topNode.type && this.topNode.type.toLowerCase();
      // if node is a new node then call manageFocus to keep browser in sync with RI,
      // note: above assignments can't be in this if statement b/c node could have mutated,
      // node should maintain focus state when mutated
      if (prevTopNode !== this.topNode) {
        this.manageFocus('refCallback');
        // if refDOMNode prop, pass along new DOM node
        this.p.props.refDOMNode && this.p.props.refDOMNode(this.topNode);
      }
    }
  }

  // setup `this.p`, only called from constructor and componentWillReceiveProps
  propsSetup(props) {
    const { mergedProps, passThroughProps } = mergeAndExtractProps(props, knownProps);

    // use the `active` prop for `[type]Active` if no `[type]Active` prop
    if (mergedProps.active) {
      if (!mergedProps.hoverActive) mergedProps.hoverActive = mergedProps.active;
      if (!mergedProps.touchActive) mergedProps.touchActive = mergedProps.active;
      if (!mergedProps.keyActive) mergedProps.keyActive = mergedProps.active;
    }

    // if focus state prop and no tabIndex, then add a tabIndex so RI is focusable by browser
    if (passThroughProps.tabIndex === null) delete passThroughProps.tabIndex;
    else if (!passThroughProps.tabIndex &&
    (mergedProps.focus || mergedProps.onClick || mergedProps.onEnterKey)) {
      mergedProps.tabIndex = '0';
      passThroughProps.tabIndex = '0';
    }

    this.p.normalStyle = extractStyle(mergedProps, 'normal');
    this.p.hoverStyle = extractStyle(mergedProps, 'hover');
    this.p.hoverActiveStyle = extractStyle(mergedProps, 'hoverActive');
    this.p.touchActiveStyle = extractStyle(mergedProps, 'touchActive');
    this.p.keyActiveStyle = extractStyle(mergedProps, 'keyActive');
    this.p.tabFocusStyle = extractStyle(mergedProps, 'focus', 'focusFromTab');
    this.p.mouseFocusStyle = extractStyle(mergedProps, 'focus', 'focusFromMouse');
    this.p.touchFocusStyle = extractStyle(mergedProps, 'focus', 'focusFromTouch');
    this.p.passThroughProps = passThroughProps;
    this.p.props = mergedProps;
  }

  // keep track of running timeouts so can clear in componentWillUnmount
  manageSetTimeout(type, cb, delay) {
    if (this.track.timeoutIDs[type] !== undefined) {
      window.clearTimeout(this.track.timeoutIDs[type]);
    }
    this.track.timeoutIDs[type] = window.setTimeout(() => {
      delete this.track.timeoutIDs[type];
      cb();
    }, delay);
  }

  // force set this.track properties based on iState
  forceTrackIState(iState) {
    if (this.computeState().iState !== iState) {
      this.track.mouseOn = iState === 'hover' || iState === 'hoverActive';
      this.track.buttonDown = iState === 'hoverActive';
      this.track.touchDown = iState === 'touchActive';
      this.track.spaceKeyDown = iState === 'keyActive';
      this.track.enterKeyDown = iState === 'keyActive';
      this.track.drag = false;
    }
  }

  // force set new state
  forceState(newState) {
    // set this.track properties to match new iState
    if (newState.iState) this.forceTrackIState(newState.iState);

    // if new focus state, call manageFocus and return b/c focus calls updateState
    if (typeof newState.focus === 'boolean' && newState.focus !== this.track.state.focus) {
      if (newState.focus) this.track.focusFrom = newState.focusFrom || 'tab';
      this.manageFocus(newState.focus ? 'forceStateFocusTrue' : 'forceStateFocusFalse');
      return;
    }

    // update state with new computed state and dummy 'event' that caused state change
    this.updateState(this.computeState(), this.p.props, dummyEvent('forcestate'));
  }

  // compute the state based on what's set in `this.track`, returns a new state object
  // note: use the respective active state when drag is true (i.e. dragging the element)
  computeState() {
    const { mouseOn, buttonDown, touchDown, focus, focusFrom, drag } = this.track;
    const focusKeyDown = focus && (() => {
      const tag = this.tagName;
      const type = this.type;
      if (this.track.enterKeyDown && tag !== 'select' &&
      (tag !== 'input' || (type !== 'checkbox' && type !== 'radio'))) {
        return true;
      }
      if (this.track.spaceKeyDown && (tag === 'button' || tag === 'select' ||
      (tag === 'input' && (type === 'checkbox' || type === 'radio' || type === 'submit')))) {
        return true;
      }
      return false;
    })();
    const newState = { focus, focusFrom: focus ? focusFrom : undefined };
    if (!mouseOn && !buttonDown && !touchDown && !focusKeyDown && !drag) newState.iState = 'normal';
    else if (mouseOn && !buttonDown && !touchDown && !focusKeyDown && !drag) {
      newState.iState = 'hover';
    } else if ((mouseOn && buttonDown && !touchDown && !focusKeyDown) || (drag && !touchDown)) {
      newState.iState = 'hoverActive';
    } else if (focusKeyDown && !touchDown) newState.iState = 'keyActive';
    else if (touchDown || drag) newState.iState = 'touchActive';
    return newState;
  }

  // check the mouse position relative to the RI element on the page
  checkMousePosition() {
    if (deviceType === 'touchOnly') return null;

    const mouseX = input.mouse.clientX;
    const mouseY = input.mouse.clientY;
    function mouseOnNode(node) {
      const rect = node.getBoundingClientRect();
      return (
        mouseX >= (rect.left - 1) &&
        mouseX <= (rect.right + 1) &&
        mouseY >= (rect.top - 1) &&
        mouseY <= (rect.bottom + 1)
      );
    }

    let mouseOn = true;

    if (!input.mouse.mouseOnDocument) {
      mouseOn = false;
    } else if (!this.p.props.checkDOMChildren) {
      mouseOn = mouseOnNode(this.topNode);
    } else {
      // if the checkDOMChildren prop is present, then do a recursive check of the node and its
      // children until the mouse is on a node or all children are checked,
      // this is useful when the children aren't inside of the parent on the page
      const recursiveCheck = (node) => {
        if (mouseOnNode(node)) return true;
        for (let i = 0; i < node.children.length; i++) {
          if (recursiveCheck(node.children[i])) return true;
        }
        return false;
      };
      mouseOn = recursiveCheck(this.topNode);
    }

    // set appropriate track properties and return mouseOn/Off
    if (mouseOn) {
      this.track.mouseOn = true;
      this.track.buttonDown = input.mouse.buttons === 1;
      return 'mouseOn';
    }
    this.track.mouseOn = false;
    this.track.buttonDown = false;
    return 'mouseOff';
  }

  handleNotifyOfNext = (e) => {
    let updateState = false;

    switch (e.type) {
      case 'scroll':
      case 'mouseenter':
      case 'mutation':
        // check mouse position, if it's still on RI, then reNotifyOfNext, else updateDate
        if (this.track.mouseOn && this.checkMousePosition() === 'mouseOn') {
          return 'reNotifyOfNext';
        }
        updateState = true;
        break;

      case 'dragstart':
        // use setTimeout because notifier drag event will fire before the drag event on RI,
        // so w/o timeout when this intance of RI is dragged it would go:
        // active -> force normal from notifier drag -> active from RI's drag event,
        // but the timeout will allow time for RI's drag event to fire before force normal
        this.manageSetTimeout('dragstart', () => {
          if (!this.track.drag) {
            this.forceTrackIState('normal');
            this.updateState(this.computeState(), this.p.props, e, true);
          }
        }, 30);
        break;

      // window focus event
      case 'focus':
        // if the window focus event is not followed by an element focus event, then reset focusFrom
        if (this.track.focusFrom !== 'reset') {
          this.manageSetTimeout('windowFocus', () => {
            this.track.focusFrom = 'reset';
          }, 600);
        }
        break;

      // window blur event to preserve the focusFrom state
      case 'blur':
        // clear the timer set in mangageNotifyOfNext that was set to cancel this notification
        window.clearTimeout(this.track.timeoutIDs.elementBlur);
        delete this.track.timeoutIDs.elementBlur;
        // notifiy of the next window focus event (re-entering the app/window/tab)
        this.track.notifyOfNext.focus = notifyOfNext('focus', this.handleNotifyOfNext);
        // reinstate focusFrom to it's previous value to preserve the focusFrom state
        this.track.focusFrom = this.track.previousFocusFrom;
        break;
      default:
    }

    if (updateState) this.updateState(this.computeState(), this.p.props, e, true);
    delete this.track.notifyOfNext[e.type];
    return null;
  }

  mangageNotifyOfNext(newState) {
    if (newState.iState !== 'normal' && !this.track.drag) {
      ['scroll', 'dragstart', 'mouseenter'].forEach((eType) => {
        if ((eType !== 'mouseenter' && eType !== 'scroll') || deviceType !== 'touchOnly') { // TODO better way to handle mousenter
          if (!this.track.notifyOfNext[eType]) {
            this.track.notifyOfNext[eType] = notifyOfNext(eType, this.handleNotifyOfNext);
          }
        }
      });
    } else {
      ['scroll', 'dragstart', 'mouseenter'].forEach((eType) => {
        if ((eType !== 'mouseenter' && eType !== 'scroll') || deviceType !== 'touchOnly') { // TODO better way to handle mousenter
          if (this.track.notifyOfNext[eType]) {
            cancelNotifyOfNext(eType, this.track.notifyOfNext[eType]);
            delete this.track.notifyOfNext[eType];
          }
        }
      });
    }

    // notify of next setup for maintaining correct focusFrom when switching apps/windows,
    // if exiting the focus state, notify of the next window blur (leaving the app/window/tab)
    // event if it immediatly follows this event, otherwise cancel the notify of next
    if (!newState.focus && this.track.state.focus) {
      this.track.notifyOfNext.blur = notifyOfNext('blur', this.handleNotifyOfNext);
      this.manageSetTimeout('elementBlur', () => {
        if (this.track.notifyOfNext.blur) {
          cancelNotifyOfNext('blur', this.track.notifyOfNext.blur);
          delete this.track.notifyOfNext.blur;
        }
      }, 600);
    }

    if (this.track.mouseOn && !this.track.notifyOfNext.mutation) {
      this.track.notifyOfNext.mutation = notifyOfNext('mutation', this.handleNotifyOfNext);
    } else if (!this.track.mouseOn && this.track.notifyOfNext.mutation) {
      cancelNotifyOfNext('mutation', this.track.notifyOfNext.mutation);
      delete this.track.notifyOfNext.mutation;
    }
  }

  // takes a new state, calls setState and the state change callbacks
  updateState(newState, props, event, dontMangageNotifyOfNext) {
    if (!dontMangageNotifyOfNext) this.mangageNotifyOfNext(newState);
    const prevIState = this.track.state.iState;
    const nextIState = newState.iState;
    const iStateChange = (nextIState !== prevIState);
    const focusChange = (newState.focus !== this.track.state.focus);

    // early return if state doesn't need to change
    if (!iStateChange && !focusChange) return;

    // create new prev and next state objects with immutable values
    const prevState = {
      iState: prevIState,
      focus: this.track.state.focus,
      focusFrom: this.track.state.focusFrom,
    };
    const nextState = {
      iState: nextIState,
      focus: newState.focus,
      focusFrom: newState.focusFrom,
    };

    // call onStateChange prop callback
    props.onStateChange && props.onStateChange({ prevState, nextState, event });

    // call onEnter and onLeave callbacks
    if (iStateChange) {
      props[prevIState] && props[prevIState].onLeave && props[prevIState].onLeave(prevIState);
      props[nextIState] && props[nextIState].onEnter && props[nextIState].onEnter(nextIState);
    }
    if (focusChange) {
      const transition = newState.focus ? 'onEnter' : 'onLeave';
      const focusFrom = newState.focus ? newState.focusFrom : prevState.focusFrom;
      props.focus && props.focus[transition] &&
      props.focus[transition]('focus', focusFrom);
    }

    // track new state because setState is asyncrounous
    this.track.state = newState;

    // only place that setState is called
    this.setState(
      newState,
      props.setStateCallback && props.setStateCallback.bind(this, { prevState, nextState })
    );
  }

  // handles all events - first checks if it's a valid event, then calls the specific
  // type of event handler (to set the proper this.track properties),
  // and at the end calls this.updateState(...)
  handleEvent = (e) => {
    if (!this.isValidEvent(e)) return;

    if (mouseEvents[e.type]) {
      if (this.handleMouseEvent(e) === 'terminate') return;
    } else if (touchEvents[e.type] || e.type === 'touchmove' || e.type === 'touchtapcancel') {
      if (this.handleTouchEvent(e) === 'terminate') return;
    } else if (e.type === 'click') {
      if (deviceType === 'touchOnly') {
        if (this.handleTouchEvent(e) === 'terminate') return;
      } else if (this.handleMouseEvent(e) === 'terminate') return;
    } else if (this.handleOtherEvent(e) === 'terminate') return;

    // compute the new state object and pass it as an argument to updateState,
    // which calls setState and state change callbacks if needed
    this.updateState(this.computeState(), this.p.props, e);
  }

  // checks if the event is a valid event or not, returns true / false respectivly
  isValidEvent(e) {
    // refCallbackFocus calls focus when there is a new top DOM node and RI is already in the
    // focus state to keep the browser's focus state in sync with RI's, so reset and return false
    if (e.type === 'focus' && this.track.focusTransition === 'refCallbackFocus') {
      e.stopPropagation();
      this.track.focusTransition = 'reset';
      return false;
    }

    // if the focusTransition is a force blur and RI is not currently in the focus state,
    // then the force blur is to keep the browser focus state in sync with RI's focus state,
    // so reset the focusTransition and return false, no need to do anything
    // else because the blur event was only for the benefit of the browser, not RI
    if (e.type === 'blur' && this.track.focusTransition === 'focusForceBlur' && !this.track.state.focus) {
      e.stopPropagation();
      this.track.focusTransition = 'reset';
      return false;
    }

    // if the device is touchOnly or a hybrid
    if (deviceType !== 'mouseOnly') {
      // reject click events that are from touch interactions,
      // unless no active or touchActive props, then only reject if recent touch on RI,
      // this allows for edge taps that don't fire touch events on RI (only click events)
      // so the click event is allowed through when WebkitTapHightlightColor indicates a click
      if (e.type === 'click' && input.touch.recentTouch && (this.p.props.active ||
      this.p.props.touchActive || this.track.recentTouch)) {
        e.stopPropagation();
        return false;
      }
      // reject unknown focus events from touch interactions
      if (e.type === 'focus') {
        if (this.track.focusTransition === 'reset' && (input.touch.recentTouch ||
        (!this.track.touchDown && input.touch.touchOnScreen))) {
          e.stopPropagation();
          this.manageFocus('focusForceBlur');
          return false;
        }
      }
    }

    if (deviceType === 'hybrid') {
      // reject mouse events from touch interactions
      if (/mouse/.test(e.type) && (input.touch.touchOnScreen || input.touch.recentTouch)) {
        e.stopPropagation();
        return false;
      }
    }

    return true;
  }

  // check to see if a focusTransition is necessary and update this.track.focusTransition
  // returns 'terminate' if handleEvent should terminate, returns 'updateState'
  // if hanldeEvent should continue and call updateState this time through
  // focus event lifecycle:
  // - browser calls focus -> onFocus listener triggered
  // - RI calls focus -> set track.focusTransition to transition type -> onFocus listener triggered
  // - RI focus event handler uses track.focusTransition to determine if the focus event is:
  //   - sent from RI to keep browser focus in sync with RI -> reset focusTransition -> end
  //   - errant -> call blur to keep browser in sync, set focusTransition to focusForceBlur -> end
  //   - sent from RI -> reset focusTransition -> RI enters the focus state
  //   - sent from browser -> set focusTransition to browserFocus -> RI enters the focus state
  // - browser calls blur -> onBlur listener triggered
  // - RI calls blur -> set track.focusTransition to transition type -> onBlur listener triggered
  // - RI blur event handler uses track.focusTransition to determine if the blur event is:
  //   - a force blur to keep the browser focus state in sync -> reset focusTransition -> end
  //     (if it's a force blur meant for both RI and the browser, then it proceeds normally)
  //   - eveything else -> reset focusTransition (unless it's touchTapBlur) -> RI leaves focus state
  //     (don't reset touchTapBlur focusTransition because focus event handler uses it to detect a
  //     subsequent errant focus event sent by the browser)
  manageFocus(type) {
    // is the DOM node tag blurable, the below tags won't be blurred by RI
    const tagIsBlurable =
      (({ input: 1, button: 1, textarea: 1, select: 1 })[this.tagName] === undefined) &&
      !this.p.props.focusToggleOff;
    // is the node focusable, if there is a foucs or tabIndex prop, or it's non-blurable, then it is
    const tagIsFocusable = this.p.props.focus || this.p.props.tabIndex ||
    this.tagName === 'a' || !tagIsBlurable;

    // calls focus/blur to transition focus, returns 'terminate' if focus/blur call is made
    // because focus/blur event handler called updateState,
    // returns 'updateState' if not allowed to make specified transition, so RI will continue
    // to updateState this time through handleEvent
    const focusTransition = (event, transitionAs, force) => {
      if (force === 'force' ||
      (event === 'focus' && tagIsFocusable && !this.track.state.focus) ||
      (event === 'blur' && tagIsBlurable && this.track.state.focus)) {
        this.track.focusTransition = transitionAs;
        this.topNode[event]();
        // if focusTransition has changed, then the focus/blur call was sucessful so terminate
        if (this.track.focusTransition !== transitionAs) {
          return 'terminate';
        }
      }
      this.track.focusTransition = 'reset';
      return 'updateState';
    };

    // toggles focus and calls focusTransition, returns true if transition is made, false otherwise
    const toggleFocus = (toggleAs, force) => {
      if (this.track.state.focus) return focusTransition('blur', `${toggleAs}Blur`, force);
      return focusTransition('focus', `${toggleAs}Focus`, force);
    };

    switch (type) {
      case 'mousedown':
        return focusTransition('focus', 'mouseDownFocus');
      case 'mouseup':
        // blur only if focus was not initiated on the preceding mousedown,
        if (this.track.focusStateOnMouseDown) return focusTransition('blur', 'mouseUpBlur');
        this.track.focusTransition = 'reset';
        return 'updateState';
      case 'touchtap':
        return toggleFocus('touchTap');
      case 'touchclick':
        // always return 'terminate' becasue no need for the caller to continue
        // and call updateState if can't toggle focus
        toggleFocus('touchClick');
        return 'terminate';
      case 'forceStateFocusTrue':
        // setTimeout because React misses focus calls made during componentWillReceiveProps,
        // which is where forceState calls come from (the browser receives the focus call
        // but not React), so have to call focus asyncrounsly so React receives it
        this.manageSetTimeout('forceStateFocusTrue', () => {
          !this.track.state.focus && focusTransition('focus', 'forceStateFocus', 'force');
        }, 0);
        return 'terminate';
      case 'forceStateFocusFalse':
        // same as forceStateFocusTrue, but for focus false
        this.manageSetTimeout('forceStateFocusFalse', () => {
          this.track.state.focus && focusTransition('blur', 'forceStateBlur', 'force');
        }, 0);
        return 'terminate';
      case 'refCallback':
        // if in the focus state and RI has a new topDOMNode, then call focus() on `this.topNode`
        // to keep the browser focus state in sync with RI's focus state
        if (this.track.state.focus) return focusTransition('focus', 'refCallbackFocus', 'force');
        this.track.focusTransition = 'reset';
        return 'terminate';
      case 'focusForceBlur':
        return focusTransition('blur', 'focusForceBlur', 'force');
      default:
        return 'updateState';
    }
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  handleMouseEvent(e) {
    switch (e.type) {
      case 'mouseenter':
        updateMouseFromRI(e);
        this.p.props.onMouseEnter && this.p.props.onMouseEnter(e);
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        return 'updateState';
      case 'mouseleave':
        updateMouseFromRI(e);
        this.p.props.onMouseLeave && this.p.props.onMouseLeave(e);
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        return 'updateState';
      case 'mousemove':
        this.p.props.onMouseMove && this.p.props.onMouseMove(e);
        // early return for mouse move
        if (this.track.mouseOn && this.track.buttonDown === (e.buttons === 1)) return 'terminate';
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        return 'updateState';
      case 'mousedown':
        this.p.props.onMouseDown && this.p.props.onMouseDown(e);
        this.track.mouseOn = true;
        this.track.buttonDown = true;
        // track focus state on mousedown to know if should blur on mouseup
        this.track.focusStateOnMouseDown = this.track.state.focus;
        // attempt to initiate focus, if successful return b/c focus called updateState
        return this.manageFocus('mousedown');
      case 'mouseup':
        this.p.props.onMouseUp && this.p.props.onMouseUp(e);
        this.track.buttonDown = false;
        // attempt to end focus, if successful return b/c blur called updateState
        return this.manageFocus('mouseup');
      case 'click':
        this.p.props.onMouseClick && this.p.props.onMouseClick(e);
        this.p.props.onClick && this.p.props.onClick(e);
        // click doesn't change state, so return
        return 'terminate';
      default:
        return 'terminate';
    }
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  // note that a touch interaction lasts from the start of the first touch point on RI,
  // until removal of the last touch point on RI, and then the touch interaction is reset
  handleTouchEvent(e) {
    // reset mouse trackers
    this.track.mouseOn = false;
    this.track.buttonDown = false;

    // maximum number of touch points where a tap is still possible
    const maxTapPoints = (this.p.props.onTapFour && 4) || (this.p.props.onTapThree && 3) ||
    (this.p.props.onTapTwo && 2) || 1;

    // reset touch interaction tracking, called when there are no more touches on the target
    const resetTouchInteraction = () => {
      this.track.touchDown = false;
      this.track.touches = { points: {}, active: 0 };
      // clear the touchTapTimer if it's running
      if (this.track.timeoutIDs.touchTapTimer !== undefined) {
        window.clearTimeout(this.track.timeoutIDs.touchTapTimer);
        delete this.track.timeoutIDs.touchTapTimer;
      }
    };

    // track recent touch, called from touchend and touchcancel
    const recentTouch = () => {
      this.track.recentTouch = true;
      this.manageSetTimeout('recentTouchTimer', () => {
        this.track.recentTouch = false;
      }, 600);
    };

    // returns true if there are extra touches on the screen
    const extraTouches = () => (
      //  if also touching someplace else on the screen, or
      (e.touches.length !== this.track.touches.active) ||
      // if there is a touchActiveTapOnly prop and more touches than maxTapPoints
      (this.p.props.touchActiveTapOnly && this.track.touches.active > maxTapPoints)
    );

    // returns true if a touch point has moved more than is allowed for a tap
    const touchMoved = (endTouch, startTouch, numberOfPoints) => (
      Math.abs(endTouch.clientX - startTouch.startX) >= 15 + (3 * numberOfPoints) ||
      Math.abs(endTouch.clientY - startTouch.startY) >= 15 + (3 * numberOfPoints)
    );

    // log touch position for each touch point that is part of the touch event
    const logTouchCoordsAs = (logAs) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const point = this.track.touches.points[e.changedTouches[i].identifier] || {};
        point[`${logAs}X`] = e.changedTouches[i].clientX;
        point[`${logAs}Y`] = e.changedTouches[i].clientY;
        this.track.touches.points[e.changedTouches[i].identifier] = point;
      }
    };

    switch (e.type) {
      case 'touchstart':
        this.p.props.onTouchStart && this.p.props.onTouchStart(e);
        // update number of active touches
        this.track.touches.active += e.changedTouches.length;
        if (this.track.touches.tapCanceled) return 'terminate';
        // cancel tap if there was already a touchend in this interaction or there are extra touches
        if (this.track.touches.touchend || extraTouches()) {
          // recursively call handleTouchEvent with a touchtapcancel event to set track properties,
          // call handleTouchEvent directly don't go through handleEvent so updateState isn't called
          // return whatever touchtapcancel says todo (either terminate or updateState)
          return this.handleTouchEvent({ type: 'touchtapcancel' });
        }

        // if going from no touch to touch, set touchTapTimer
        if (!this.track.touchDown) {
          this.manageSetTimeout('touchTapTimer', () => {
            // if the timer finishes then fire a touchtapcancel event to cancel the tap,
            // because this goes through handleEvent, updateState will be called if needed
            this.handleEvent(dummyEvent('touchtapcancel'));
          }, 600);
        }

        // set touchDown
        this.track.touchDown = true;
        // log touch start position
        logTouchCoordsAs('start');
        return 'updateState';

      case 'touchmove':
        this.p.props.onTouchMove && this.p.props.onTouchMove(e);
        if (this.track.touches.tapCanceled) return 'terminate';
        // cancel tap if there are extra touches
        if (extraTouches()) return this.handleTouchEvent({ type: 'touchtapcancel' });

        // if touchActiveTapOnly prop, check to see if the touch moved enough to cancel tap
        if (this.p.props.touchActiveTapOnly) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = this.track.touches.points[e.changedTouches[i].identifier];
            if (touch && touchMoved(e.changedTouches[i], touch, maxTapPoints)) {
              return this.handleTouchEvent({ type: 'touchtapcancel' });
            }
          }
        }
        return 'terminate';

      case 'touchend':
        // start recent touch timer
        recentTouch();
        this.p.props.onTouchEnd && this.p.props.onTouchEnd(e);
        // update number of active touches
        this.track.touches.active -= e.changedTouches.length;
        // track that there has need a touchend in this touch interaction
        this.track.touches.touchend = true;

        // check to see if tap is already canceled or should be canceled
        if (this.track.touches.active === 0 &&
        (!this.track.touchDown || this.track.touches.tapCanceled || extraTouches())) {
          resetTouchInteraction();
          return 'updateState';
        } else if (this.track.touches.tapCanceled) return 'terminate';
        else if (extraTouches()) return this.handleTouchEvent({ type: 'touchtapcancel' });

        // log touch end position
        logTouchCoordsAs('client');

        // if there are no remaining touches, then process the touch interaction
        if (this.track.touches.active === 0) {
          // determine if there was a tap and number of touch points for the tap
          const tapTouchPoints = (() => {
            const touches = this.track.touches.points;
            const touchKeys = Object.keys(touches);
            const count = touchKeys.length;

            // if every touch point hasn't moved, then return the count
            if (touchKeys.every(touch => (!touchMoved(touches[touch], touches[touch], count)))) {
              return count;
            }
            return 0;
          })();

          // reset the touch interaction
          resetTouchInteraction();

          switch (tapTouchPoints) {
            case 1: {
              const manageFocusReturn = this.manageFocus('touchtap');
              this.p.props.onTap && this.p.props.onTap(e);
              this.p.props.onClick && this.p.props.onClick(e);
              return manageFocusReturn;
            }
            case 2:
              this.p.props.onTapTwo && this.p.props.onTapTwo(e);
              break;
            case 3:
              this.p.props.onTapThree && this.p.props.onTapThree(e);
              break;
            case 4:
              this.p.props.onTapFour && this.p.props.onTapFour(e);
              break;
            default:
          }
        }
        return 'updateState';

      case 'touchcancel':
        recentTouch();
        this.p.props.onTouchCancel && this.p.props.onTouchCancel(e);
        this.track.touches.active -= e.changedTouches.length;

        // if there are no remaining touches, then reset the touch interaction
        if (this.track.touches.active === 0) {
          resetTouchInteraction();
          return 'updateState';
        }

        // cancel tap and return whatever touchtapcancel says todo
        return this.handleTouchEvent({ type: 'touchtapcancel' });

      // cancel tap for this touch interaction
      case 'touchtapcancel':
        // clear the touchTapTimer if it's running
        if (this.track.timeoutIDs.touchTapTimer) {
          window.clearTimeout(this.track.timeoutIDs.touchTapTimer);
          delete this.track.timeoutIDs.touchTapTimer;
        }
        if (this.track.touchDown) {
          // set the tap event to canceled
          this.track.touches.tapCanceled = true;
          if (this.p.props.touchActiveTapOnly) {
            // if touchActiveTapOnly prop, exit the touchActive state and updateState
            this.track.touchDown = false;
            return 'updateState';
          }
        }
        return 'terminate';

      // for click events fired on touchOnly devices, listen for because synthetic
      // click events won't fire touchend event
      case 'click': {
        const manageFocusReturn = this.manageFocus('touchclick');
        this.p.props.onTap && this.p.props.onTap(e);
        this.p.props.onClick && this.p.props.onClick(e);
        return manageFocusReturn;
      }
      default:
        return 'terminate';
    }
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  handleOtherEvent(e) {
    switch (e.type) {
      case 'focus':
        // if there was a timer set by a recent window focus event, clear it
        if (this.track.timeoutIDs.windowFocus) {
          window.clearTimeout(this.track.timeoutIDs.windowFocus);
          delete this.track.timeoutIDs.windowFocus;
        }

        // if this is a known focusTransition or focusFrom is reset,
        // then set focusFrom based on the type of focusTransition,
        if (this.track.focusTransition !== 'reset' || this.track.focusFrom === 'reset') {
          const focusTransition = this.track.focusTransition.toLowerCase();
          if (/mouse/.test(focusTransition)) {
            this.track.focusFrom = 'mouse';
          } else if (/touch/.test(focusTransition) || this.track.touchDown) {
            this.track.focusFrom = 'touch';
          } else if (!/forcestate/.test(focusTransition)) {
            this.track.focusFrom = 'tab';
          }
        }

        this.track.focusTransition = 'reset';
        this.p.props.onFocus && this.p.props.onFocus(e);
        this.track.focus = true;
        return 'updateState';
      case 'blur':
        this.track.focusTransition = 'reset';
        this.p.props.onBlur && this.p.props.onBlur(e);
        this.track.previousFocusFrom = this.track.focusFrom;
        this.track.focusFrom = 'reset';
        this.track.focus = false;
        this.track.spaceKeyDown = false;
        this.track.enterKeyDown = false;
        return 'updateState';
      case 'keydown':
        this.p.props.onKeyDown && this.p.props.onKeyDown(e);
        if (e.key === ' ') this.track.spaceKeyDown = true;
        else if (e.key === 'Enter') {
          this.track.enterKeyDown = true;
          this.p.props.onEnterKey && this.p.props.onEnterKey(e);
          this.p.props.onClick && this.p.props.onClick(e);
        } else return 'terminate';
        return 'updateState';
      case 'keyup':
        this.p.props.onKeyUp && this.p.props.onKeyUp(e);
        if (e.key === ' ') this.track.spaceKeyDown = false;
        else if (e.key === 'Enter') this.track.enterKeyDown = false;
        else return 'terminate';
        return 'updateState';
      case 'dragstart':
        this.p.props.onDragStart && this.p.props.onDragStart(e);
        this.track.drag = true;
        return 'updateState';
      case 'dragend':
        this.p.props.onDragEnd && this.p.props.onDragEnd(e);
        this.forceTrackIState('normal');
        return 'updateState';
      default:
        return 'terminate';
    }
  }

  computeStyle() {
    // build style object, priority order: state styles, style prop, default styles
    const style = {};
    // add default styles first:
    // if focus prop provided, then reset browser focus style
    if (!this.p.props.useBrowserOutlineFocus && this.p.props.focus) {
      style.outline = '0';
      style.outlineOffset = '0';
    }
    // if touchActive or active prop provided, then reset webkit tap highlight style
    if ((this.p.props.touchActive || this.p.props.active) && hasTouchEventsApi) {
      style.WebkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
    }
    // set cursor to pointer if clicking does something
    const lowerAs = typeof this.p.props.as === 'string' && this.p.props.as.toLowerCase();
    if (!this.p.props.useBrowserCursor && (
      (this.p.props.onClick || this.p.props.onMouseClick ||
        (
          lowerAs !== 'input' &&
          (this.p.props.focus || this.p.props.tabIndex) &&
          (this.p.mouseFocusStyle.style || this.p.mouseFocusStyle.className)
        ) || (
          lowerAs === 'input' && (this.p.props.type === 'checkbox' ||
          this.p.props.type === 'radio' || this.p.props.type === 'submit')
        ) || lowerAs === 'button' || lowerAs === 'a' || lowerAs === 'select'
      ) && !(
        this.p.props.disabled
    ))) {
      style.cursor = 'pointer';
    }

    // add style prop styles second:
    objectAssign(style, this.p.props.style);

    // add iState and focus state styles third:
    // focus has priority over iState styles unless overridden in stylePriority
    const stylePriority = this.p.props.stylePriority;
    if (stylePriority && stylePriority.indexOf(this.state.iState) !== -1) {
      objectAssign(
        style,
        this.state.focus ? this.p[`${this.state.focusFrom}FocusStyle`].style : null,
        this.p[`${this.state.iState}Style`].style
      );
    } else {
      objectAssign(
        style,
        this.p[`${this.state.iState}Style`].style,
        this.state.focus ? this.p[`${this.state.focusFrom}FocusStyle`].style : null
      );
    }
    return style;
  }

  computeClassName() {
    // build className string, union of class names from className prop, iState className,
    // and focus className (if in the focus state)
    function joinClasses(className, iStateClass, focusClass) {
      let joined = className;
      joined += (joined && iStateClass) ? ` ${iStateClass}` : `${iStateClass}`;
      joined += (joined && focusClass) ? ` ${focusClass}` : `${focusClass}`;
      return joined;
    }
    return joinClasses(
      this.p.props.className || '',
      this.p[`${this.state.iState}Style`].className,
      this.state.focus ? this.p[`${this.state.focusFrom}FocusStyle`].className : ''
    );
  }

  render() {
    // props to pass down:
    // eventHandlers
    // style
    // className
    // passThroughProps
    const props = { ...this.p.passThroughProps, ...this.eventHandlers };
    props.style = this.computeStyle();
    const className = this.computeClassName();
    if (className) props.className = className;

    // only set onClick listener if it's required
    if (this.p.props.onClick || (deviceType !== 'touchOnly' && this.p.props.onMouseClick) ||
    (hasTouchEventsApi && (this.p.props.onTap || this.p.props.focus || this.p.props.tabIndex))) {
      props.onClick = this.handleEvent;
    }

    //  only set onTouchMove listener if it's required
    if (hasTouchEventsApi && (this.p.props.touchActiveTapOnly || this.p.props.onTouchMove)) {
      props.onTouchMove = this.handleEvent;
    }

    // if `as` is a string (i.e. DOM tag name), then add the ref to props and render `as`
    if (typeof this.p.props.as === 'string') {
      props.ref = this.refCallback;
      return React.createElement(this.p.props.as, props, this.p.props.children);
    }
    // If `as` is a ReactClass or a ReactFunctionalComponent, then wrap it in a span
    // so can access the DOM node without breaking encapsulation
    return React.createElement('span', { ref: this.refCallback },
      React.createElement(this.p.props.as, props, this.p.props.children)
    );
  }
}

export default ReactInteractive;
