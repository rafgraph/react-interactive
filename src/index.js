import React from 'react';
import detectIt from 'detect-it';
import objectAssign from 'object-assign';
import propTypes from './propTypes';
import compareProps from './compareProps';
import mergeAndExtractProps from './mergeAndExtractProps';
import extractStyle from './extractStyle';
import input from './input-tracker';
import { notifyOfNext, cancelNotifyOfNext } from './notifier';
import { knownProps, mouseEvents, touchEvents, otherEvents } from './constants';

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
      touchStartTime: Date.now() - 2000,
      touchEndTime: Date.now() - 1000,
      touchEndClick: false,
      touchDown: false,
      touches: {},
      mouseOn: false,
      buttonDown: false,
      focus: false,
      focusFrom: 'reset',
      focusTransition: 'reset',
      focusStateOnMouseDown: false,
      spaceKeyDown: false,
      enterKeyDown: false,
      drag: false,
      updateTopNode: false,
      notifyOfNext: {},
      state: this.state,
    };

    // the node returned by the ref callback
    this.refNode = null;
    // the actual top DOM node of `as`, needed when `as` is wrapped in a span (is ReactComponent)
    this.topNode = null;
    // tagName and type properties of topNode
    this.tagName = '';
    this.type = '';

    // keep track of what event handlers are set, updated in setupEventHandlers
    this.mouseEventListeners = false;
    this.touchEventListeners = false;
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
    const mouse = this.checkMousePosition('cdm');

    // enter focus state if initialState.focus - called here instead of constructor
    // because can't call focus until have ref to DOM node
    if (this.p.props.initialState && typeof this.p.props.initialState.focus === 'boolean') {
      this.forceState({
        focus: this.p.props.initialState.focus,
        focusFrom: this.p.props.initialState.focusFrom,
      });
      return;
    }

    if (mouse === 'mouseOn') {
      this.updateState(
        this.computeState(),
        this.p.props,
        // create dummy 'event' object that caused the state change, will be passed to onStateChange
        { type: 'forcestate',
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {} }
      );
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

  // determine event handlers to use based on the device type - only determined once in constructor
  setupEventHandlers() {
    const eventHandlers = {};
    Object.keys(otherEvents).forEach((event) => {
      eventHandlers[otherEvents[event]] = this.handleEvent;
    });

    if (detectIt.hasTouchEventsApi) {
      this.touchEventListeners = true;
      Object.keys(touchEvents).forEach((event) => {
        eventHandlers[touchEvents[event]] = this.handleEvent;
      });
    }
    // if the device is mouseOnly or hybrid, then set mouse listeners
    if (detectIt.deviceType !== 'touchOnly') {
      this.mouseEventListeners = true;
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

    // update state with new computed state
    this.updateState(
      this.computeState(),
      this.p.props,
      // create dummy 'event' object that caused the state change, will be passed to onStateChange
      { type: 'forcestate',
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {} }
    );
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

  checkMousePosition() {
    if (!this.mouseEventListeners) return null;
    const rect = this.topNode.getBoundingClientRect();
    const mX = input.mouse.event.clientX;
    const mY = input.mouse.event.clientY;
    if (mX >= rect.left && mX <= rect.right && mY >= rect.top && mY <= rect.bottom) {
      this.track.mouseOn = true;
      this.track.buttonDown = input.mouse.event.buttons === 1;
      return 'mouseOn';
    }
    this.track.mouseOn = false;
    this.track.buttonDown = false;
    return 'mouseOff';
  }

  handleNotifyOfNext = (e) => {
    switch (e.type) {
      case 'scroll':
        if (this.track.state.iState === 'touchActive') {
          this.forceState({ iState: 'normal' });
          delete this.track.notifyOfNext[e.type];
          return null;
        } else if (this.track.mouseOn && this.checkMousePosition() === 'mouseOn') {
          return 'reNotifyOfNext';
        }
        break;
      case 'dragstart':
        // use setTimeout because notifier drag event will fire before the drag event on RI,
        // so w/o out timeout it would go:
        // active -> force normal from notifier drag -> active from RI drag,
        // but the timeout will allow time for RI's drag event to fire before force normal
        setTimeout(() => {
          if (!this.track.drag) this.forceState({ iState: 'normal' });
        }, 30);
        delete this.track.notifyOfNext[e.type];
        return null;
      case 'mutation':
        if (this.track.mouseOn && this.checkMousePosition() === 'mouseOn') {
          return 'reNotifyOfNext';
        }
        break;
      default:
        delete this.track.notifyOfNext[e.type];
        return null;
    }

    this.updateState(this.computeState(), this.p.props, e);
    delete this.track.notifyOfNext[e.type];
    return null;
  }

  mangageNotifyOfNext(newState) {
    if (newState.iState !== 'normal' && !this.track.drag) {
      ['scroll', 'dragstart'].forEach((eType) => {
        if (!this.track.notifyOfNext[eType]) {
          this.track.notifyOfNext[eType] = notifyOfNext(eType, this.handleNotifyOfNext);
        }
      });
    } else {
      ['scroll', 'dragstart'].forEach((eType) => {
        if (this.track.notifyOfNext[eType]) {
          cancelNotifyOfNext(eType, this.track.notifyOfNext[eType]);
          delete this.track.notifyOfNext[eType];
        }
      });
    }

    if (this.track.mouseOn && !this.track.notifyOfNext.mutation) {
      this.track.notifyOfNext.mutation = notifyOfNext('mutation', this.handleNotifyOfNext);
    } else if (!this.track.mouseOn && this.track.notifyOfNext.mutation) {
      cancelNotifyOfNext('mutation', this.track.notifyOfNext.mutation);
      delete this.track.notifyOfNext.mutation;
    }
  }

  // takes a new state, calls setState and the state change callbacks
  updateState(newState, props, event) {
    this.mangageNotifyOfNext(newState);
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

    // track new state because setState is asyncrounous
    this.track.state = newState;

    // only place that setState is called
    this.setState(
      newState,
      props.setStateCallback && props.setStateCallback.bind(this, { prevState, nextState })
    );

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
  }

  // handles all events - first checks if it's a valid event, then calls the specific
  // type of event handler (to set the proper this.track properties),
  // and at the end calls this.updateState(...)
  handleEvent = (e) => {
    if (!this.isValidEvent(e)) return;

    if (mouseEvents[e.type]) {
      if (this.handleMouseEvent(e) === 'terminate') return;
    } else if (touchEvents[e.type]) {
      if (this.handleTouchEvent(e) === 'terminate') return;
    } else if (e.type === 'click') {
      if (this.touchEventListeners) {
        if (this.handleTouchEvent(e) === 'terminate') return;
      } else if (this.handleMouseEvent(e) === 'terminate') return;
    } else if (this.handleOtherEvent(e) === 'terminate') return;

    // compute the new state object and pass it as an argument to updateState,
    // which calls setState and state change callbacks if needed
    this.updateState(this.computeState(), this.p.props, e);
  }

  // checks if the event is a valid event or not, returns true / false respectivly
  isValidEvent(e) {
    // if this is a mouseEvent on a hybrid device
    if (this.touchEventListeners && (mouseEvents[e.type] || e.type === 'click')) {
      // early return if it's a click event that's preceded by a touch end click
      if (this.track.touchEndClick && e.type === 'click') {
        this.track.touchEndClick = false;
        return false;
      }

      // Call the mouse handler if not touchDown and the event occurred after 600ms
      // from the last touchend event to prevent calling mouse handlers as a result
      // of touch interactions. On some devices (notably Android) during a long press the mouse
      // events will fire before touchend while touchDown is true, so also need to check for that.
      if (!this.track.touchDown && Date.now() - this.track.touchEndTime > 600) return true;
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
      ({ input: 1, button: 1, textarea: 1, select: 1 })[this.tagName] === undefined;
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
        return 'terminate';
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
        // toggle focus unless the browser just initiated focus, for more info see:
        // https://github.com/rafrex/react-interactive/commit/b5358e8789267b75590e7d0f295e58fc1c3a0c1f
        if (!this.track.state.focus || this.track.focusTransition !== 'browserFocus') {
          toggleFocus('touchClick');
          // always return 'terminate' becasue no need for the caller to continue
          // and call updateState if can't toggle focus
          return 'terminate';
        }
        this.track.focusTransition = 'reset';
        return 'terminate';
      case 'forceStateFocusTrue':
        // setTimeout because React misses focus calls made during componentWillReceiveProps,
        // which is where forceState calls come from (the browser receives the focus call
        // but not React), so have to call focus asyncrounsly so React receives it
        setTimeout(() => {
          !this.track.state.focus && focusTransition('focus', 'forceStateFocus', 'force');
        }, 0);
        return 'terminate';
      case 'forceStateFocusFalse':
        // same as forceStateFocusTrue, but for focus false
        setTimeout(() => {
          this.track.state.focus && focusTransition('blur', 'forceStateBlur', 'force');
        }, 0);
        return 'terminate';
      case 'refCallback':
        // if in the focus state and RI has a new topDOMNode, then call focus() on `this.topNode`
        // to keep the browser focus state in sync with RI's focus state
        if (this.track.state.focus) return focusTransition('focus', 'refCallbackFocus', 'force');
        this.track.focusTransition = 'reset';
        return 'terminate';

      // focus event called from onFocus listener (via handleFocusEvent)
      case 'focus': {
        // refCallbackFocus calls focus when there is a new top DOM node and RI is already in the
        // focus state to keep the browser's focus state in sync with RI's,
        // so reset and return 'terminate'
        if (this.track.focusTransition === 'refCallbackFocus') {
          this.track.focusTransition = 'reset';
          return 'terminate';
        }

        // if focus was just toggled off on touch tap, then this is an errant focus event fired
        // by the browser, so fire a blur event to put the browser in the correct focus state
        // and then return because RI is already in the correct focus state, for more info see:
        // https://github.com/rafrex/react-interactive/commit/b5358e8789267b75590e7d0f295e58fc1c3a0c1f
        if (this.track.focusTransition === 'touchTapBlur') {
          return focusTransition('blur', 'focusForceBlur', 'force');
        }

        // set focusFrom based on the type of focusTransition
        if (/mouse/.test(this.track.focusTransition.toLowerCase())) {
          this.track.focusFrom = 'mouse';
        } else if (/touch/.test(this.track.focusTransition.toLowerCase()) || this.track.touchDown ||
        Date.now() - this.track.touchEndTime < 600) {
          this.track.focusFrom = 'touch';
        } else if (!/forcestate/.test(this.track.focusTransition.toLowerCase())) {
          this.track.focusFrom = 'tab';
        }

        // if focusTransition is 'reset', or 'browserFocus', then the focus event must
        // be from the browser, so set focusTransition to 'browserFocus', otherwise reset it
        this.track.focusTransition =
        (this.track.focusTransition === 'reset' || this.track.focusTransition === 'browserFocus') ?
        'browserFocus' : 'reset';
        return 'updateState';
      }

      // blur event called from onBlur listener (via handleFocusEvent)
      case 'blur':
        // if the focusTransition is a force blur and RI is not currently in the focus state,
        // then the force blur is to keep the browser focus state in sync with RI's focus state,
        // so reset the focusTransition and return 'terminate', no need to do anything
        // else because the blur event was only for the benefit of the browser, not RI
        if (this.track.focusTransition === 'focusForceBlur' && !this.track.state.focus) {
          this.track.focusTransition = 'reset';
          return 'terminate';
        }
        // reset focusFrom because this blur event will exit the focus state
        this.track.focusFrom = 'reset';
        // reset focus transition unless it's touchTapBlur, which is kept b/c the browser calls
        // focus after touchTapBlur and the focus handler uses it to know it's an errant focus event
        if (this.track.focusTransition !== 'touchTapBlur') this.track.focusTransition = 'reset';
        return 'updateState';
      default:
        return 'updateState';
    }
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  handleMouseEvent(e) {
    switch (e.type) {
      case 'mouseenter':
        this.p.props.onMouseEnter && this.p.props.onMouseEnter(e);
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        return 'updateState';
      case 'mouseleave':
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
  handleTouchEvent(e) {
    // reset mouse trackers
    this.track.mouseOn = false;
    this.track.buttonDown = false;
    // reset touch end click tracker unless this is a click event
    if (e.type !== 'click') this.track.touchEndClick = false;

    switch (e.type) {
      case 'touchstart':
        this.p.props.onTouchStart && this.p.props.onTouchStart(e);

        // if going from no touch to touch, set touch start time
        if (!this.track.touchDown) this.track.touchStartTime = Date.now();
        this.track.touchDown = true;

        // cancel if also touching someplace else on the screen
        if (e.touches.length !== e.targetTouches.length) this.track.touches.canceled = true;

        if (!this.track.touches.canceled) {
          // log touch start position for each touch point that is part of the touchstart event
          for (let i = 0; i < e.changedTouches.length; i++) {
            this.track.touches[e.changedTouches[i].identifier] = {
              startX: e.changedTouches[i].clientX,
              startY: e.changedTouches[i].clientY,
            };
          }
        }
        return 'updateState';
      case 'touchend':
        this.p.props.onTouchEnd && this.p.props.onTouchEnd(e);
        this.track.touchDown = e.targetTouches.length > 0;

        // cancel if also touching someplace else on the screen
        if (e.touches.length !== e.targetTouches.length) this.track.touches.canceled = true;

        if (!this.track.touches.canceled) {
          // log touch end position for each touch point that is part of the touchend event
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touchTrack = this.track.touches[e.changedTouches[i].identifier];
            if (touchTrack) {
              touchTrack.endX = e.changedTouches[i].clientX;
              touchTrack.endY = e.changedTouches[i].clientY;
            }
          }
        }

        // if there are no remaining touces, then process the touch interaction
        if (e.targetTouches.length === 0) {
          // track the touch interaction end time
          this.track.touchEndTime = Date.now();
          // determine if there was a tap and number of touch points for the tap
          const tapTouchPoints = (() => {
            // max 500ms between start and end of touch interaction to be a tap
            const tapWithinTime = (this.track.touchEndTime - this.track.touchStartTime) < 500;
            if (this.track.touches.canceled || !tapWithinTime) return 0;
            const touches = this.track.touches;
            const touchKeys = Object.keys(touches);
            const touchCount = touchKeys.length;
            // make sure each touch point hasn't moved more than the allowed tolerance
            if (touchKeys.every(touch => (
              Math.abs(touches[touch].endX - touches[touch].startX) < 15 + (3 * touchCount) &&
              Math.abs(touches[touch].endY - touches[touch].startY) < 15 + (3 * touchCount)
            ))) {
              return touchCount;
            }
            return 0;
          })();

          // reset touch interaction tracking object
          this.track.touches = {};

          switch (tapTouchPoints) {
            case 1:
              this.p.props.onTap && this.p.props.onTap(e);
              this.p.props.onClick && this.p.props.onClick(e);
              this.track.touchEndClick = true;
              return this.manageFocus('touchtap');
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
        this.p.props.onTouchCancel && this.p.props.onTouchCancel(e);
        this.track.touchDown = e.targetTouches.length > 0;
        // if there are no remaining touces, then process and reset the touch interaction
        if (e.targetTouches.length === 0) {
          this.track.touchEndTime = Date.now();
          this.track.touches = {};
        } else {
          this.track.touches.canceled = true;
        }
        return 'updateState';

      // for click events fired on touchOnly devices, listen for because synthetic
      // click events won't fire touchend event
      case 'click':
        // early return if preceded by a touch end click
        if (this.track.touchEndClick) {
          this.track.touchEndClick = false;
          return 'terminate';
        }

        // check to see if the click event is the result of a touch interaction
        // if > 600ms since last touch, then not the result of a touch interaction
        if (!this.track.touchDown && Date.now() - this.track.touchEndTime > 600) {
          this.p.props.onTap && this.p.props.onTap(e);
          this.p.props.onClick && this.p.props.onClick(e);
          return this.manageFocus('touchclick');

        // if the browser just initiated focus, then it is a legitimate click event even
        // if 600ms hasn't passed since the last touch event (e.g. repeatedly tap the screen),
        // so call tap and click handlers, this helps keep the entering and exiting of focus
        // in sync with the firing of click and tap events.
        } else if (this.track.state.focus && this.track.focusTransition === 'browserFocus') {
          this.p.props.onTap && this.p.props.onTap(e);
          this.p.props.onClick && this.p.props.onClick(e);
        }
        return 'terminate';
      default:
        return 'terminate';
    }
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  handleOtherEvent(e) {
    switch (e.type) {
      case 'focus':
        if (this.manageFocus('focus') === 'terminate') return 'terminate';
        this.p.props.onFocus && this.p.props.onFocus(e);
        this.track.focus = true;
        return 'updateState';
      case 'blur':
        if (this.manageFocus('blur') === 'terminate') return 'terminate';
        this.p.props.onBlur && this.p.props.onBlur(e);
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
    // if focus style provided, then reset browser focus style
    if (!this.p.props.useBrowserOutlineFocus && (this.p.tabFocusStyle.style ||
    this.p.mouseFocusStyle.style || this.p.touchFocusStyle.style)) {
      style.outline = '0';
      style.outlineOffset = '0';
    }
    // if touchActive or active style provided, then reset webkit tap highlight style
    if (this.p.touchActiveStyle.style && !this.p.props.useBrowserWebkitTapHighlightColor
    && detectIt.hasTouchEventsApi) {
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
    // focus has priority over normal iState, all other iStates have priority over focus
    if (this.state.iState === 'normal' && this.state.focus) {
      objectAssign(
        style,
        this.p.normalStyle.style,
        this.p[`${this.state.focusFrom}FocusStyle`].style
      );
    } else {
      objectAssign(
        style,
        this.state.focus ? this.p[`${this.state.focusFrom}FocusStyle`].style : null,
        this.p[`${this.state.iState}Style`].style
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
    if (this.p.props.onClick ||
    (this.clickHandler !== this.handleTouchEvent ? this.p.props.onMouseClick :
    (this.p.props.onTap || this.p.props.focus || this.p.props.tabIndex))) {
      props.onClick = this.handleEvent;
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
