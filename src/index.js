import React from 'react';
import objectAssign from 'object-assign';
import { propTypes, defaultProps } from './propTypes';
import compareProps from './compareProps';
import mergeAndExtractProps from './mergeAndExtractProps';
import {
  extractStyle,
  setActiveAndFocusProps,
  joinClasses,
} from './extractStyle';
import recursiveNodeCheck from './recursiveNodeCheck';
import input, { updateMouseFromRI, focusRegistry } from './inputTracker';
import { notifyOfNext, cancelNotifyOfNext } from './notifier';
import syntheticClick from './syntheticClick';
import {
  knownProps,
  mouseEvents,
  touchEvents,
  otherEvents,
  dummyEvent,
  deviceType,
  deviceHasTouch,
  deviceHasMouse,
  passiveEventSupport,
  nonBlurrableTags,
  knownRoleTags,
  enterKeyTrigger,
  spaceKeyTrigger,
  queueTime,
  childInteractiveProps,
} from './constants';

class Interactive extends React.Component {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  constructor(props) {
    super(props);

    // state is always an object with two keys, `iState` and `focus`
    this.state = {
      // iState is always 1 of 5 strings:
      // 'normal', 'hover', 'hoverActive', 'touchActive', 'keyActive'
      iState: 'normal',
      // focus is always 1 of 4 values: false, 'tab', 'mouse' or 'touch'
      focus: false,
    };

    // things to keep track of so RI knows what to do when
    this.track = {
      touchDown: false,
      recentTouch: false,
      touches: { points: {}, active: 0 },
      mouseOn: false,
      buttonDown: false,
      clickType: 'reset',
      focus: false,
      previousFocus: false,
      reinstateFocus: false,
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
    // tagName and type properties of topNode, updated in refCallback
    this.tagName = (typeof props.as === 'string' && props.as) || '';
    this.type = props.type || '';
    // if the topNode is triggered by the enter key, and/or the space bar
    this.enterKeyTrigger = false;
    this.spaceKeyTrigger = false;

    // maximum number of touch points where a tap is still possible, updated in propsSetup
    this.maxTapPoints = 1;

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
    if (
      this.p.props.initialState &&
      this.p.props.initialState.focus !== undefined
    ) {
      this.forceState({ focus: this.p.props.initialState.focus });
    }
  }

  componentWillReceiveProps(nextProps) {
    // set if the `topNode` needs to be updated in componentDidUpdate => `as` is different
    // and not a string, note that if `as` is a new string, then the `refCallback`
    // will be called by React so no need to do anything in componentDidUpdate
    this.track.updateTopNode =
      this.props.as !== nextProps.as &&
      typeof this.props.as !== 'string' &&
      typeof nextProps.as !== 'string';

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
      (!this.p.sameProps && nextProps !== this.props) ||
      // always update if there are interactive children
      nextProps.interactiveChild ||
      // if `iState` changed, AND the `style` or `className` for the new `iState` is different,
      // prevents renders when switching b/t two states that have the same `style` and `className`
      (nextState.iState !== this.state.iState &&
        (this.p[`${nextState.iState}Style`].style !==
          this.p[`${this.state.iState}Style`].style ||
          this.p[`${nextState.iState}Style`].className !==
            this.p[`${this.state.iState}Style`].className)) ||
      // if `focus` state changed (always update to work with default style)
      nextState.focus !== this.state.focus
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
    Object.keys(this.track.notifyOfNext).forEach(eType => {
      cancelNotifyOfNext(eType, this.track.notifyOfNext[eType]);
    });
    Object.keys(this.track.timeoutIDs).forEach(timer => {
      window.clearTimeout(this.track.timeoutIDs[timer]);
    });
  }

  // determine event handlers to use based on the device type - only determined once in constructor
  setupEventHandlers() {
    const eventHandlers = {};
    Object.keys(otherEvents).forEach(event => {
      eventHandlers[otherEvents[event]] = this.handleEvent;
    });

    // if the device has touch, set touch event listeners
    if (deviceHasTouch) {
      Object.keys(touchEvents).forEach(event => {
        eventHandlers[touchEvents[event]] = this.handleEvent;
      });
    }
    // if the device has a mouse, set mouse event listeners
    if (deviceHasMouse) {
      Object.keys(mouseEvents).forEach(event => {
        eventHandlers[mouseEvents[event]] = this.handleEvent;
      });
    }
    return eventHandlers;
  }

  // returns true if a click listener should be set, called from propsSetup and refCallback
  setClickListener(props) {
    // set click listener when there is an onClick prop
    if (props.onClick) return true;
    if (deviceHasTouch) {
      // set click listener when the element is focusable - this is to correct a bug
      // in Chrome on iOS where it will sometimes, when it is under stress, fire focus and
      // click events without firing a touch event on the document - the result is the focus event
      // will cause RI to enter the focus from tab state errantly, and then the click event will
      // toggle focus off making the correction, so have to listen for click events
      if (props.tabIndex) return true;
      // set click listener when the element has a knownRoleTag, i.e. the browser
      // has a click event handler so preventDefault() needs to be called when the
      // browser sends a click event after RI has canceled tap (e.g. touchTapTimer expired, etc)
      if (knownRoleTags[this.tagName]) return true;
    }
    return false;
  }

  // find and set the top DOM node of `as`
  refCallback = node => {
    this.refNode = node;
    if (node) {
      const prevTopNode = this.topNode;
      // if `as` is a component, then the `refNode` is the span wrapper, so get its firstChild
      if (typeof this.p.props.as !== 'string') this.topNode = node.firstChild;
      else this.topNode = node;
      this.tagName = this.topNode.tagName.toLowerCase();
      this.type = this.topNode.type && this.topNode.type.toLowerCase();
      this.enterKeyTrigger = enterKeyTrigger(this.tagName, this.type);
      this.spaceKeyTrigger = spaceKeyTrigger(this.tagName, this.type);
      // if as is a react component then won't have access to tag in componentWillReceiveProps,
      // so check if click listener needs to be set again here (after this.tagName is set)
      if (this.setClickListener(this.p.props))
        this.p.passThroughProps.onClick = this.handleEvent;
      // if node is a new node then call manageFocus to keep browser in sync with RI,
      // note: above assignments can't be in this if statement b/c node could have mutated,
      // node should maintain focus state when mutated
      if (prevTopNode !== this.topNode) {
        this.manageFocus('refCallback');
        // if refDOMNode prop, pass along new DOM node
        this.p.props.refDOMNode && this.p.props.refDOMNode(this.topNode);
      }
    }
  };

  // setup `this.p`, only called from constructor and componentWillReceiveProps
  propsSetup(props) {
    const { mergedProps, passThroughProps } = mergeAndExtractProps(
      props,
      knownProps,
    );
    setActiveAndFocusProps(mergedProps);

    // if focus state prop and no tabIndex, then add a tabIndex so RI is focusable by browser
    if (passThroughProps.tabIndex === null) delete passThroughProps.tabIndex;
    else if (
      !passThroughProps.tabIndex &&
      (mergedProps.focus ||
        mergedProps.focusFromTab ||
        mergedProps.focusFromMouse ||
        mergedProps.focusFromTouch ||
        mergedProps.onClick)
    ) {
      mergedProps.tabIndex = '0';
      passThroughProps.tabIndex = '0';
    }

    // if onClick prop but it's not clear what the role of the element is then add role="button"
    if (passThroughProps.role === null) delete passThroughProps.role;
    else if (
      mergedProps.onClick &&
      !mergedProps.role &&
      typeof mergedProps.as === 'string' &&
      !knownRoleTags[mergedProps.as]
    ) {
      mergedProps.role = 'button';
      passThroughProps.role = 'button';
    }

    // maximum number of touch points where a tap is still possible
    this.maxTapPoints =
      (mergedProps.onTapFour && 4) ||
      (mergedProps.onTapThree && 3) ||
      (mergedProps.onTapTwo && 2) ||
      1;

    // add onClick handler to passThroughProps if it's required
    if (this.setClickListener(mergedProps))
      passThroughProps.onClick = this.handleEvent;

    //  add onTouchMove handler to passThroughProps if it's required
    if (
      deviceHasTouch &&
      (mergedProps.touchActiveTapOnly ||
        mergedProps.onLongPress ||
        mergedProps.onTouchMove)
    ) {
      passThroughProps.onTouchMove = this.handleEvent;
    }

    // add other event handlers to passThroughProps
    objectAssign(passThroughProps, this.eventHandlers);

    this.p.normalStyle = extractStyle(mergedProps, 'normal');
    this.p.hoverStyle = extractStyle(mergedProps, 'hover');
    this.p.hoverActiveStyle = extractStyle(mergedProps, 'hoverActive');
    this.p.touchActiveStyle = extractStyle(mergedProps, 'touchActive');
    this.p.keyActiveStyle = extractStyle(mergedProps, 'keyActive');
    this.p.tabFocusStyle = extractStyle(mergedProps, 'focusFromTab');
    this.p.mouseFocusStyle = extractStyle(mergedProps, 'focusFromMouse');
    this.p.touchFocusStyle = extractStyle(mergedProps, 'focusFromTouch');
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

  cancelTimeout(type) {
    if (this.track.timeoutIDs[type] !== undefined) {
      window.clearTimeout(this.track.timeoutIDs[type]);
      delete this.track.timeoutIDs[type];
    }
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
    if (newState.iState !== undefined) this.forceTrackIState(newState.iState);

    // if new focus state, call manageFocus and return b/c focus calls updateState
    if (
      newState.focus !== undefined &&
      newState.focus !== this.track.state.focus
    ) {
      this.track.focus = newState.focus;
      this.manageFocus(
        newState.focus ? 'forceStateFocusTrue' : 'forceStateFocusFalse',
      );
      return;
    }

    // update state with new computed state and dummy 'event' that caused state change
    this.updateState(
      this.computeState(),
      this.p.props,
      dummyEvent('forcestate'),
    );
  }

  // compute the state based on what's set in `this.track`, returns a new state object
  // note: use the respective active state when drag is true (i.e. dragging the element)
  computeState() {
    const { mouseOn, buttonDown, touchDown, focus, drag } = this.track;
    const focusKeyDown =
      focus &&
      ((this.track.enterKeyDown && this.enterKeyTrigger) ||
        (this.track.spaceKeyDown && this.spaceKeyTrigger));
    const newState = { focus };
    if (!mouseOn && !buttonDown && !touchDown && !focusKeyDown && !drag)
      newState.iState = 'normal';
    else if (mouseOn && !buttonDown && !touchDown && !focusKeyDown && !drag) {
      newState.iState = 'hover';
    } else if (
      (mouseOn && buttonDown && !touchDown && !focusKeyDown) ||
      (drag && !touchDown)
    ) {
      newState.iState = 'hoverActive';
    } else if (focusKeyDown && !touchDown) newState.iState = 'keyActive';
    else if (touchDown || drag) newState.iState = 'touchActive';
    return newState;
  }

  // takes a new state, calls setState and the state change callbacks
  updateState(newState, props, event, dontManageNotifyOfNext) {
    if (!dontManageNotifyOfNext) this.manageNotifyOfNext(newState);
    const prevIState = this.track.state.iState;
    const nextIState = newState.iState;
    const iStateChange = nextIState !== prevIState;
    const focusChange = newState.focus !== this.track.state.focus;

    // early return if state doesn't need to change
    if (!iStateChange && !focusChange) return;

    // create new prev and next state objects with immutable values
    const prevState = {
      iState: prevIState,
      focus: this.track.state.focus,
    };
    const nextState = {
      iState: nextIState,
      focus: newState.focus,
    };

    // call onStateChange prop callback
    props.onStateChange && props.onStateChange({ prevState, nextState, event });

    // track new state because setState is asyncrounous
    this.track.state = newState;

    // only place that setState is called
    this.setState(
      newState,
      props.setStateCallback &&
        props.setStateCallback.bind(this, { prevState, nextState }),
    );
  }

  // handles all events - first checks if it's a valid event, then calls the specific
  // type of event handler (to set the proper this.track properties),
  // and at the end calls this.updateState(...)
  handleEvent = e => {
    if (!this.isValidEvent(e)) return;

    if (mouseEvents[e.type]) {
      if (this.handleMouseEvent(e) === 'terminate') return;
    } else if (
      touchEvents[e.type] ||
      e.type === 'touchmove' ||
      e.type === 'touchtapcancel'
    ) {
      if (this.handleTouchEvent(e) === 'terminate') return;
    } else if (e.type === 'click') {
      if (this.handleClickEvent(e) === 'terminate') return;
    } else if (this.handleOtherEvent(e) === 'terminate') return;

    // compute the new state object and pass it as an argument to updateState,
    // which calls setState and state change callbacks if needed
    this.updateState(this.computeState(), this.p.props, e);
  };

  // checks if the event is a valid event or not, returns true / false respectivly
  isValidEvent(e) {
    // if it's a known click event then return true
    if (e.type === 'click' && this.track.clickType !== 'reset') return true;
    // if it's a focus/blur event and this Interactive instance is not the target then return true
    if ((e.type === 'focus' || e.type === 'blur') && e.target !== this.topNode)
      return true;

    // refCallbackFocus calls focus when there is a new top DOM node and RI is already in the
    // focus state to keep the browser's focus state in sync with RI's, so reset and return false
    if (
      e.type === 'focus' &&
      this.track.focusTransition === 'refCallbackFocus'
    ) {
      e.stopPropagation();
      this.track.focusTransition = 'reset';
      return false;
    }

    // if the focusTransition is a force blur and RI is not currently in the focus state,
    // then the force blur is to keep the browser focus state in sync with RI's focus state,
    // so reset the focusTransition and return false, no need to do anything
    // else because the blur event was only for the benefit of the browser, not RI
    if (
      e.type === 'blur' &&
      this.track.focusTransition === 'focusForceBlur' &&
      !this.track.state.focus
    ) {
      e.stopPropagation();
      this.track.focusTransition = 'reset';
      return false;
    }

    // if the device is touchOnly or a hybrid
    if (deviceHasTouch) {
      // reject click events that are from touch interactions, unless no active or touchActive prop
      // if no active or touchActive prop, then let the browser determine what is a click from touch
      // this allows for edge taps that don't fire touch events on RI (only click events)
      // so the click event is allowed through when WebkitTapHightlightColor indicates a click
      if (
        e.type === 'click' &&
        (input.touch.recentTouch || input.touch.touchOnScreen) &&
        (this.p.props.active || this.p.props.touchActive)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // reject unknown focus events from touch interactions
      if (e.type === 'focus') {
        if (
          this.track.focusTransition === 'reset' &&
          (input.touch.recentTouch ||
            (!this.track.touchDown && input.touch.touchOnScreen))
        ) {
          e.preventDefault();
          e.stopPropagation();
          this.manageFocus('focusForceBlur');
          return false;
        }
      }
    }

    if (deviceType === 'hybrid') {
      // reject mouse events from touch interactions
      if (
        /mouse/.test(e.type) &&
        (input.touch.touchOnScreen || input.touch.recentTouch)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    return true;
  }

  // notifyOfNext plugs the holes in the events fired by the browser on the RI element,
  // in some situations the browser fails to fire the necessary event leaving RI stuck
  // in the wrong state (a not normal iState), so sign up to be notified of the next global event
  // and do some checks (in handleNotifyOfNext) to confirm RI is in the correct state,
  // note that notifyOfNext only while not in the normal state makes the notifier O(1) instead of
  // O(n), where n is the number of mounted RI components
  manageNotifyOfNext(newState) {
    // set notifyOfNext
    const setNON = eType => {
      if (!this.track.notifyOfNext[eType]) {
        this.track.notifyOfNext[eType] = notifyOfNext(
          eType,
          this.handleNotifyOfNext,
        );
      }
    };
    // cancel notifyOfNext
    const cancelNON = eType => {
      if (this.track.notifyOfNext[eType]) {
        cancelNotifyOfNext(eType, this.track.notifyOfNext[eType]);
        delete this.track.notifyOfNext[eType];
      }
    };

    if (deviceHasMouse) {
      // if not in the normal state and not dragging, then set notifyOfNext, otherwise cancel
      const shouldSetNON = newState.iState !== 'normal' && !this.track.drag;

      // check mouse position on document mouseenter to prevent from sticking in
      // the hover state after switching to another app/window, moving the mouse,
      // and then switching  back (so the mouse is no longer over the element)
      shouldSetNON ? setNON('mouseenter') : cancelNON('mouseenter');

      // the dragstart event on an element fires after a short delay, so it is possible to
      // start dragging an element and have the mouseenter another element putting it in the
      // hoverActive state before the dragstart event fires (after the dragstart event
      // no other mouse events are fired), so sign up for next global dragstart to force intro
      // normal state while another element is being dragged
      shouldSetNON ? setNON('dragstart') : cancelNON('dragstart');

      // the scroll listener provides a minor improvement to accuracy by exiting the hover state
      // as soon as the mouse is scrolled off an element instead of waiting for the scrolling to end
      // only set as a passive listener as the improvement is not worth it if it hurts performance
      if (passiveEventSupport) {
        shouldSetNON ? setNON('scroll') : cancelNON('scroll');
      }

      // if the mouse is on RI, then sign up for next DOM mutation event, which could
      // move the mouse off of RI (by changing the layout of the page)
      // without firing a mouseleave event (because the mouse never moved)
      this.track.mouseOn ? setNON('mutation') : cancelNON('mutation');
    }

    if (deviceHasTouch) {
      // cancel tap when touch someplace else on the screen
      newState.iState === 'touchActive'
        ? this.p.props.extraTouchNoTap && setNON('touchstart')
        : cancelNON('touchstart');
    }

    // notify of next setup for maintaining correct focusFrom when switching apps/windows,
    // if exiting the focus state, notify of the next window blur (leaving the app/window/tab)
    // event if it immediately follows this event, otherwise cancel the notify of next
    if (this.track.state.focus && !newState.focus) {
      setNON('blur');
      this.manageSetTimeout(
        'elementBlur',
        () => {
          this.track.previousFocus = false;
          cancelNON('blur');
        },
        queueTime,
      );
    }
  }

  handleNotifyOfNext = e => {
    let updateState = false;

    switch (e.type) {
      case 'scroll':
      case 'mouseenter':
      case 'mutation':
        // check mouse position, if it's still on RI, then reNotifyOfNext, else updateState
        if (this.track.mouseOn && this.checkMousePosition() === 'mouseOn') {
          return 'reNotifyOfNext';
        }
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        updateState = true;
        break;

      case 'touchstart':
        // cancel tap if extra touch point, or when touch someplace else on the screen
        // check topNode and children to make sure they weren't the target
        if (this.p.props.extraTouchNoTap) {
          if (
            this.track.touches.active < this.maxTapPoints &&
            recursiveNodeCheck(this.topNode, node => e.target === node)
          ) {
            return 'reNotifyOfNext';
          }
          updateState =
            this.handleTouchEvent({ type: 'touchtapcancel' }) === 'updateState';
        }
        break;

      case 'dragstart':
        // use setTimeout because notifier drag event will fire before the drag event on RI,
        // so w/o timeout when this intance of RI is dragged it would go:
        // active -> force normal from notifier drag -> active from RI's drag event,
        // but the timeout will allow time for RI's drag event to fire before force normal
        this.manageSetTimeout(
          'dragstart',
          () => {
            if (!this.track.drag) {
              this.forceTrackIState('normal');
              this.updateState(this.computeState(), this.p.props, e, true);
            }
          },
          30,
        );
        break;

      // window focus event
      case 'focus':
        // reinstate previous focus state if this window focus event is followed by
        // an element focus event, otherwise cancel focus reinstatement
        if (this.track.previousFocus !== false) {
          this.track.reinstateFocus = true;
          this.manageSetTimeout(
            'windowFocus',
            () => {
              this.track.reinstateFocus = false;
            },
            queueTime,
          );
        }
        break;

      // window blur event to preserve the focus state
      case 'blur':
        // clear the timer set in manageNotifyOfNext that was set to cancel this notification
        this.cancelTimeout('elementBlur');
        // notifiy of the next window focus event (re-entering the app/window/tab)
        if (!this.track.notifyOfNext.focus) {
          this.track.notifyOfNext.focus = notifyOfNext(
            'focus',
            this.handleNotifyOfNext,
          );
        }
        break;
      default:
    }

    if (updateState)
      this.updateState(this.computeState(), this.p.props, e, true);
    delete this.track.notifyOfNext[e.type];
    return null;
  };

  // check the mouse position relative to the RI element on the page
  checkMousePosition(e) {
    if (!deviceHasMouse) return null;

    const mouseX = (e && e.clientX) || input.mouse.clientX;
    const mouseY = (e && e.clientY) || input.mouse.clientY;
    function mouseOnNode(node) {
      const rect = node.getBoundingClientRect();
      return (
        mouseX >= rect.left - 1 &&
        mouseX <= rect.right + 1 &&
        mouseY >= rect.top - 1 &&
        mouseY <= rect.bottom + 1
      );
    }

    let mouseOn = true;

    if (!input.mouse.mouseOnDocument) {
      mouseOn = false;
    } else if (!this.p.props.nonContainedChild) {
      mouseOn = mouseOnNode(this.topNode);
    } else {
      // if the nonContainedChild prop is present, then do a recursive check of the node and its
      // children until the mouse is on a node or all children are checked,
      // this is useful when the children aren't inside of the parent on the page
      mouseOn = recursiveNodeCheck(this.topNode, mouseOnNode);
    }

    return mouseOn ? 'mouseOn' : 'mouseOff';
  }

  // check to see if a focusTransition is necessary and update this.track.focusTransition
  // returns 'terminate' if handleEvent should terminate, returns 'updateState'
  // if handleEvent should continue and call updateState this time through
  // focus event lifecycle:
  // - browser calls focus -> onFocus listener triggered
  // - RI calls focus (using manageFocus) -> set focusTransition -> onFocus listener triggered
  // - RI event handler uses track.focusTransition to determine if the focus event is:
  //   - not a valid event (in isValidEvent)
  //     - sent from RI to keep browser focus in sync with RI -> reset focusTransition -> end
  //     - errant -> call blur to keep browser in sync, set focusTransition to focusForceBlur -> end
  //   - a valid event
  //     - sent from RI -> reset focusTransition -> RI enters the focus state w/ focus
  //       based on the focusTransition
  //     - sent from browser -> RI enters the focus state w/ focus set to 'tab'
  // - browser calls blur -> onBlur listener triggered
  // - RI calls blur (using manageFocus) -> set focusTransition -> onBlur listener triggered
  // - RI event handler uses track.focusTransition to determine if the blur event is:
  //   - not a valid event (in isValidEvent)
  //     - a force blur to keep the browser focus state in sync -> reset focusTransition -> end
  //       (if it's a force blur meant for both RI and the browser, then it's a valid event)
  //   - eveything else -> reset focusTransition -> RI leaves focus state
  manageFocus(type, e) {
    // if this exact event has already been used for focus/blur by another instance of Interactive
    // i.e. a child and the event is bubbling, then don't manage focus and return updateState
    if (e && (focusRegistry.focus === e || focusRegistry.blur === e))
      return 'updateState';

    // is the DOM node tag blurable for toggle focus
    const tagIsBlurable =
      !nonBlurrableTags[this.tagName] && !this.p.props.focusToggleOff;
    // is the node focusable, if there is a focus or tabIndex prop, or it's non-blurable, then it is
    const tagIsFocusable = this.p.props.tabIndex || knownRoleTags[this.tagName];

    // calls focus/blur to transition focus, returns 'terminate' if focus/blur call is made
    // because focus/blur event handler called updateState,
    // returns 'updateState' if not allowed to make specified transition, so RI will continue
    // to updateState this time through handleEvent
    const focusTransition = (event, transitionAs, force) => {
      if (
        force === 'force' ||
        (event === 'focus' && tagIsFocusable) ||
        (event === 'blur' && tagIsBlurable)
      ) {
        // if the manageFocus call is from a browser event (i.e. will bubble), register it
        if (e) {
          focusRegistry[event] = e;
          // reset event registry after bubbling has finished because React reuses events so
          // future event equality checks may give a false positive if not reset
          this.manageSetTimeout(
            'focusRegistry',
            () => {
              focusRegistry[event] = null;
            },
            0,
          );
        }
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

    // toggles focus by calling focusTransition, returns focusTransition's return
    const toggleFocus = (toggleAs, force) => {
      if (this.track.state.focus)
        return focusTransition('blur', `${toggleAs}Blur`, force);
      return focusTransition('focus', `${toggleAs}Focus`, force);
    };

    switch (type) {
      case 'mousedown':
        return focusTransition('focus', 'mouseDownFocus');
      case 'mouseup':
        // blur only if focus was not initiated on the preceding mousedown,
        if (this.track.focusStateOnMouseDown)
          return focusTransition('blur', 'mouseUpBlur');
        this.track.focusTransition = 'reset';
        return 'updateState';
      case 'touchclick':
        return toggleFocus('touchClick');
      case 'forceStateFocusTrue':
        // setTimeout because React misses focus calls made during componentWillReceiveProps,
        // which is where forceState calls come from (the browser receives the focus call
        // but not React), so have to call focus asyncrounsly so React receives it
        this.manageSetTimeout(
          'forceStateFocusTrue',
          () => {
            !this.track.state.focus &&
              focusTransition('focus', 'forceStateFocus', 'force');
          },
          0,
        );
        return 'terminate';
      case 'forceStateFocusFalse':
        // same as forceStateFocusTrue, but for focus false
        this.manageSetTimeout(
          'forceStateFocusFalse',
          () => {
            this.track.state.focus &&
              focusTransition('blur', 'forceStateBlur', 'force');
          },
          0,
        );
        return 'terminate';
      case 'refCallback':
        // if in the focus state and RI has a new topDOMNode, then call focus() on `this.topNode`
        // to keep the browser focus state in sync with RI's focus state
        if (this.track.state.focus)
          return focusTransition('focus', 'refCallbackFocus', 'force');
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
        if (this.track.mouseOn && this.track.buttonDown === (e.buttons === 1))
          return 'terminate';
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        return 'updateState';
      case 'mousedown':
        this.p.props.onMouseDown && this.p.props.onMouseDown(e);
        this.track.mouseOn = true;
        this.track.buttonDown = true;
        // track focus state on mousedown to know if should blur on mouseup
        this.track.focusStateOnMouseDown = this.track.state.focus;
        return this.manageFocus('mousedown', e);
      case 'mouseup': {
        this.p.props.onMouseUp && this.p.props.onMouseUp(e);
        this.track.buttonDown = false;
        const manageFocusReturn = this.manageFocus('mouseup', e);
        this.manageClick('mouseClick');
        return manageFocusReturn;
      }
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

    // reset touch interaction tracking, called when there are no more touches on the target
    const resetTouchInteraction = () => {
      this.track.touchDown = false;
      this.track.touches = { points: {}, active: 0 };
      // clear the touchTapTimer if it's running
      this.cancelTimeout('touchTapTimer');
    };

    // track recent touch, called from touchend and touchcancel
    const recentTouch = () => {
      this.track.recentTouch = true;
      this.manageSetTimeout(
        'recentTouchTimer',
        () => {
          this.track.recentTouch = false;
        },
        queueTime,
      );
    };

    // returns true if there are extra touches on the screen
    const extraTouches = () =>
      // if extraTouchNoTap prop and also touching someplace else on the screen, or
      (this.p.props.extraTouchNoTap &&
        e.touches.length !== this.track.touches.active) ||
      // more touches on RI than maxTapPoints
      this.track.touches.active > this.maxTapPoints;

    // returns true if a touch point has moved more than is allowed for a tap
    const touchMoved = (endTouch, startTouch, numberOfPoints) =>
      Math.abs(endTouch.clientX - startTouch.startX) >=
        15 + 3 * numberOfPoints ||
      Math.abs(endTouch.clientY - startTouch.startY) >= 15 + 3 * numberOfPoints;

    // log touch position for each touch point that is part of the touch event
    const logTouchCoordsAs = logAs => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const point =
          this.track.touches.points[e.changedTouches[i].identifier] || {};
        point[`${logAs}X`] = e.changedTouches[i].clientX;
        point[`${logAs}Y`] = e.changedTouches[i].clientY;
        this.track.touches.points[e.changedTouches[i].identifier] = point;
      }
    };

    switch (e.type) {
      case 'touchstart': {
        this.p.props.onTouchStart && this.p.props.onTouchStart(e);
        // update number of active touches
        this.track.touches.active += e.changedTouches.length;
        if (this.track.touches.tapCanceled) return 'terminate';
        const newTouchDown = !this.track.touchDown;
        this.track.touchDown = true;
        // cancel tap if there was already a touchend in this interaction or there are extra touches
        if (this.track.touches.touchend || extraTouches()) {
          // recursively call handleTouchEvent with a touchtapcancel event to set track properties,
          // call handleTouchEvent directly don't go through handleEvent so updateState isn't called
          return this.handleTouchEvent({ type: 'touchtapcancel' }) ===
            'updateState' || newTouchDown
            ? 'updateState'
            : 'terminate';
        }

        // if going from no touch to touch, set touchTapTimer
        if (newTouchDown) {
          e.persist();
          this.manageSetTimeout(
            'touchTapTimer',
            () => {
              // if the timer finishes then call onLongPress callback and
              // fire a touchtapcancel event to cancel the tap,
              // because this goes through handleEvent, updateState will be called if needed
              this.p.props.onLongPress && this.p.props.onLongPress(e);
              this.handleEvent(dummyEvent('touchtapcancel'));
            },
            this.p.props.tapTimeCutoff,
          );
        }

        // log touch start position
        logTouchCoordsAs('start');
        return 'updateState';
      }

      case 'touchmove':
        this.p.props.onTouchMove && this.p.props.onTouchMove(e);
        if (this.track.touches.tapCanceled) return 'terminate';
        // cancel tap if there are extra touches
        if (extraTouches())
          return this.handleTouchEvent({ type: 'touchtapcancel' });

        // if touchActiveTapOnly or onLongPress prop,
        // check to see if the touch moved enough to cancel tap
        if (this.p.props.touchActiveTapOnly || this.p.props.onLongPress) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = this.track.touches.points[
              e.changedTouches[i].identifier
            ];
            if (
              touch &&
              touchMoved(e.changedTouches[i], touch, this.maxTapPoints)
            ) {
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
        // if a touch event was dropped somewhere, i.e.
        // cumulative length of changed touches for touchstarts !== touchends, then reset
        if (
          this.track.touches.active < 0 ||
          (e.touches.length === 0 && this.track.touches.active > 0)
        ) {
          resetTouchInteraction();
          return 'updateState';
        }

        // track that there has been a touchend in this touch interaction
        this.track.touches.touchend = true;

        // check to see if tap is already canceled or should be canceled
        if (
          this.track.touches.active === 0 &&
          (this.track.touches.tapCanceled || extraTouches())
        ) {
          resetTouchInteraction();
          return 'updateState';
        } else if (this.track.touches.tapCanceled) return 'terminate';
        else if (extraTouches())
          return this.handleTouchEvent({ type: 'touchtapcancel' });

        // log touch end position
        logTouchCoordsAs('client');

        // if there are no remaining touches, then process the touch interaction
        if (this.track.touches.active === 0) {
          const touches = this.track.touches.points;
          const touchKeys = Object.keys(touches);
          const count = touchKeys.length;

          // determine if there was a tap and number of touch points for the tap
          // if every touch point hasn't moved, set tapTouchPoints to count
          const tapTouchPoints = touchKeys.every(
            touch => !touchMoved(touches[touch], touches[touch], count),
          )
            ? count
            : 0;

          // reset the touch interaction
          resetTouchInteraction();

          switch (tapTouchPoints) {
            case 1: {
              let manageFocusReturn = 'updateState';
              // if no active or touchActive prop, let the browser handle click events
              if (this.p.props.active || this.p.props.touchActive) {
                manageFocusReturn = this.manageFocus('touchclick', e);
                this.manageClick('tapClick');
              }
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
        this.cancelTimeout('touchTapTimer');
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
      default:
        return 'terminate';
    }
  }

  // called in anticipation of a click event (before it's fired) to track the source
  // of the click event (mouse, touch, key), and synthetically call node.click() if needed
  manageClick(type) {
    // clear clickType timer if it's running
    this.cancelTimeout('clickType');

    // timer to reset the clickType,
    // when it's left to the browser to call click(), the browser has queueTime
    // to add the click event to the queue for it to be recognized as a known click event
    const setClickTypeTimer = () => {
      this.manageSetTimeout(
        'clickType',
        () => {
          this.track.clickType = 'reset';
        },
        queueTime,
      );
    };

    switch (type) {
      case 'mouseClick':
        this.track.clickType = 'mouseClick';
        // let the browser call click() for mouse interactions
        setClickTypeTimer();
        break;
      case 'tapClick':
        this.track.clickType = 'tapClick';
        // for touch interactions, use syntheticClick to call node.click() now and
        // block the subsequent click event created by the browser if there is one
        syntheticClick(this.topNode);
        this.track.clickType = 'reset';
        break;
      case 'keyClick':
        this.track.clickType = 'keyClick';
        // if the element has a known interactive role (a, button, input, etc),
        // then let the browser call click() for keyClick interactions (enter key and/or space bar)
        if (knownRoleTags[this.tagName]) {
          setClickTypeTimer();

          // if the element doesn't have a known interactive role, but there is an onClick prop,
          // then call node.click() directly as the browser won't fire a click event
          // from a keyClick interaction
        } else if (this.p.props.onClick) {
          this.topNode.click();
          this.track.clickType = 'reset';
        }
        break;
      default:
    }
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  // in almost cases this will return terminate as click events don't change state,
  // the one exception is an unknown but valid click event from a touch interaction,
  // which will need to manageFocus, and then return whatever manageFocus says to do
  handleClickEvent(e) {
    // clear clickType timer if running
    this.cancelTimeout('clickType');
    let returnValue = 'terminate';
    // if this is an unknown click event, make some assumptions
    if (this.track.clickType === 'reset') {
      // unknown click event on a form submit input with a recentEnterKeyDown on the document
      // is considered to be a keyClick (when you press enter to submit a form
      // but focus is not on the submit button)
      const enterKeyFormSubmit =
        this.tagName === 'input' &&
        this.type === 'submit' &&
        input.key.recentEnterKeyDown;
      if (enterKeyFormSubmit) this.track.clickType = 'keyClick';
      else if (
        input.touch.recentTouch ||
        input.touch.touchOnScreen ||
        deviceType === 'touchOnly'
      ) {
        // if there is a recent touch on the document,
        // or this is a unknown synthetic click event on a touchOnly device
        returnValue = this.manageFocus('touchclick', e);
        this.track.keyClick = 'tapClick';
        // else this is a unknown synthetic click event on a mouseOnly or hybrid device
      } else this.track.keyClick = 'mouseClick';
    }

    // focus is not called on touch tap with links that open in a new window
    // on pages that have been navigated to with pushState (only tested react router).
    // So need to simulate a previous focus state of touch and a window blur event by
    // signing up to be notified of next window focus event.
    // Note that if navigated to www.example.tld/some-page with pushState link (e.g. RR Link)
    // then focus is not called on tap, but if do a fresh page load for www.example.tld/some-page
    // then focus is called on tap before opening the link in a new window (which is really weird).
    // Note that focus not called means the browser doesn't respect focus calls generated by RI
    // (and the browser may not generate a focus call itself, results varied by browser).
    // This is only a problem on Android Chrome because despite not calling focus on link tap,
    // upon returning to the window, focus is called on the element putting it
    // into the focusFromTab state, when it should be in the focusFromTouch state.
    if (
      this.p.props.target === '_blank' &&
      this.track.clickType === 'tapClick' &&
      !this.track.notifyOfNext.focus
    ) {
      this.track.previousFocus = 'touch';
      this.track.notifyOfNext.focus = notifyOfNext(
        'focus',
        this.handleNotifyOfNext,
      );
    }

    // call onClick handler and pass in clickType (mouseClick, tapClick, keyClick) as 2nd argument
    this.p.props.onClick && this.p.props.onClick(e, this.track.clickType);
    this.track.clickType = 'reset';
    return returnValue;
  }

  // returns 'terminate' if the caller (this.handleEvent) should not call updateState(...)
  handleOtherEvent(e) {
    switch (e.type) {
      case 'focus':
        this.p.props.onFocus && this.p.props.onFocus(e);

        // if this instance of RI is not the focus target, then don't enter the focus state
        if (e.target !== this.topNode) return 'terminate';

        // if this is a known focusTransition or focus is false,
        // then set focus based on the type of focusTransition,
        if (this.track.focusTransition !== 'reset' || !this.track.focus) {
          const focusTransition = this.track.focusTransition.toLowerCase();
          if (/mouse/.test(focusTransition)) {
            this.track.focus = 'mouse';
          } else if (/touch/.test(focusTransition) || this.track.touchDown) {
            this.track.focus = 'touch';
          } else if (this.track.reinstateFocus) {
            this.track.focus = this.track.previousFocus;
          } else if (!/forcestate/.test(focusTransition)) {
            this.track.focus = 'tab';
          }
        }

        // if there was a timer set by a recent window focus event, clear it
        this.cancelTimeout('windowFocus');
        // only reinstate focus from window blur/focus for next focus event
        this.track.reinstateFocus = false;

        this.track.focusTransition = 'reset';
        return 'updateState';
      case 'blur':
        this.p.props.onBlur && this.p.props.onBlur(e);
        if (e.target !== this.topNode) return 'terminate';
        this.track.focusTransition = 'reset';
        this.track.previousFocus = this.track.focus;
        this.track.focus = false;
        this.track.spaceKeyDown = false;
        this.track.enterKeyDown = false;
        return 'updateState';
      case 'keydown':
        this.p.props.onKeyDown && this.p.props.onKeyDown(e);
        if (!this.track.focus) return 'terminate';
        if (e.key === ' ') this.track.spaceKeyDown = true;
        else if (e.key === 'Enter') {
          this.track.enterKeyDown = true;
          if (this.enterKeyTrigger) this.manageClick('keyClick');
        } else return 'terminate';
        return 'updateState';
      case 'keyup':
        this.p.props.onKeyUp && this.p.props.onKeyUp(e);
        if (!this.track.focus) return 'terminate';
        if (e.key === 'Enter') this.track.enterKeyDown = false;
        else if (e.key === ' ') {
          this.track.spaceKeyDown = false;
          if (this.spaceKeyTrigger) this.manageClick('keyClick');
        } else return 'terminate';
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
    // if focusFromTab prop provided, then reset browser focus style,
    // otherwise only reset it when focus is not from tab
    if (
      !this.p.props.useBrowserOutlineFocus &&
      (this.p.props.focusFromTab ||
        (this.state.focus !== 'tab' && !nonBlurrableTags[this.tagName]))
    ) {
      style.outline = 0;
      style.outlineOffset = 0;
    }
    // if touchActive or active prop provided, then reset webkit tap highlight style
    if ((this.p.props.touchActive || this.p.props.active) && deviceHasTouch) {
      style.WebkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
    }
    // set cursor to pointer if clicking does something
    const lowerAs =
      typeof this.p.props.as === 'string' && this.p.props.as.toLowerCase();
    if (
      !this.p.props.useBrowserCursor &&
      ((this.p.props.onClick ||
        (lowerAs !== 'input' &&
          this.p.props.tabIndex &&
          (this.p.mouseFocusStyle.style || this.p.mouseFocusStyle.className)) ||
        (lowerAs === 'input' &&
          (this.p.props.type === 'checkbox' ||
            this.p.props.type === 'radio' ||
            this.p.props.type === 'submit')) ||
        lowerAs === 'button' ||
        lowerAs === 'a' ||
        lowerAs === 'area' ||
        lowerAs === 'select') &&
        !this.p.props.disabled)
    ) {
      style.cursor = 'pointer';
    }

    // add style prop styles second:
    objectAssign(style, this.p.props.style);

    // add iState and focus state styles third:
    // focus has priority over iState styles unless overridden in stylePriority
    const hasPriority =
      this.state.iState === 'keyActive' ||
      (this.p.props.stylePriority &&
        this.p.props.stylePriority[this.state.iState]);
    const iStateStyle = this.p[`${this.state.iState}Style`].style;
    const focusStyle = this.state.focus
      ? this.p[`${this.state.focus}FocusStyle`].style
      : null;
    if (hasPriority) {
      objectAssign(style, focusStyle, iStateStyle);
    } else {
      objectAssign(style, iStateStyle, focusStyle);
    }
    return style;
  }

  computeClassName() {
    // build className string, union of class names from className prop, iState className,
    // and focus className (if in the focus state)
    return joinClasses(
      this.p.props.className || '',
      this.p[`${this.state.iState}Style`].className,
      this.state.focus ? this.p[`${this.state.focus}FocusStyle`].className : '',
    );
  }

  // compute children when there is an interactiveChild prop, returns the new children
  computeChildren() {
    // convert this.state.focus to the string focusFrom[Type] for use later
    const focusFrom =
      this.state.focus &&
      `focusFrom${this.state.focus
        .charAt(0)
        .toUpperCase()}${this.state.focus.slice(1)}`;
    // does the current iState style have priority over the focus state style
    const iStateStylePriority =
      this.p.props.stylePriority &&
      this.p.props.stylePriority[this.state.iState];

    const computeChildStyle = props => {
      const style = props.style ? { ...props.style } : {};
      setActiveAndFocusProps(props);
      const iStateStyle = extractStyle(props, this.state.iState);
      const focusStyle = this.state.focus && extractStyle(props, focusFrom);

      return {
        className: joinClasses(
          props.className || '',
          iStateStyle.className,
          (focusStyle && focusStyle.className) || '',
        ),
        style:
          (iStateStylePriority &&
            objectAssign(style, focusStyle.style, iStateStyle.style)) ||
          objectAssign(style, iStateStyle.style, focusStyle.style),
      };
    };

    // recurse and map children, if child is an Interactive component, then don't recurse into
    // it's children
    const recursiveMap = children =>
      React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        // if the child should not be shown, then return null
        if (child.props.showOnParent) {
          const showOn = child.props.showOnParent.split(' ');
          if (
            !showOn.some(
              el =>
                el === this.state.iState ||
                (/Active/.test(this.state.iState) && el === 'active') ||
                (this.state.focus && (el === focusFrom || el === 'focus')),
            )
          ) {
            return null;
          }
        }

        const childPropKeys = Object.keys(child.props);

        // if the child doesn't have any interactive child props, then return the child
        if (!childPropKeys.some(key => childInteractiveProps[key])) {
          if (child.type === Interactive) return child;
          // if the child is not an Interactive component, then still recuse into its children
          return React.cloneElement(
            child,
            {},
            recursiveMap(child.props.children),
          );
        }

        const newChildProps = {};
        const childStyleProps = {};
        // separate child props to pass through (newChildProps), from props used
        // to compute the child's style (childStyleProps)
        childPropKeys.forEach(key => {
          if (!childInteractiveProps[key])
            newChildProps[key] = child.props[key];
          else if (key !== 'showOnParent') {
            childStyleProps[
              `${key.slice(8).charAt(0).toLowerCase()}${key.slice(9)}`
            ] =
              child.props[key];
          }
        });

        childStyleProps.style = child.props.style;
        childStyleProps.className = child.props.className;
        const { style, className } = computeChildStyle(childStyleProps);
        newChildProps.style = style;
        if (className) newChildProps.className = className;

        // can't use cloneElement because not possible to delete existing child prop,
        // e.g. need to delete the prop onParentHover from the child
        return React.createElement(
          child.type,
          newChildProps,
          child.type === Interactive
            ? child.props.children
            : recursiveMap(child.props.children),
        );
      });

    return recursiveMap(this.p.props.children);
  }

  render() {
    // props to pass down:
    // passThroughProps (includes event handlers)
    // style
    // className
    this.p.passThroughProps.style = this.computeStyle();
    const className = this.computeClassName();
    if (className) this.p.passThroughProps.className = className;

    const children = this.p.props.interactiveChild
      ? this.computeChildren()
      : this.p.props.children;

    // if `as` is a string (i.e. DOM tag name), then add the ref to props and render `as`
    if (typeof this.p.props.as === 'string') {
      this.p.passThroughProps.ref = this.refCallback;
      return React.createElement(
        this.p.props.as,
        this.p.passThroughProps,
        children,
      );
    }
    // If `as` is a ReactClass or a ReactFunctionalComponent, then wrap it in a span
    // so can access the DOM node without breaking encapsulation
    return React.createElement(
      'span',
      {
        ref: this.refCallback,
        style: this.p.props.wrapperStyle,
        className: this.p.props.wrapperClassName,
      },
      React.createElement(this.p.props.as, this.p.passThroughProps, children),
    );
  }
}

export default Interactive;
