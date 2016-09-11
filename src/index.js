import React, { PropTypes } from 'react';
import detectIt from 'detect-it';
import objectAssign from 'object-assign';

class ReactInteractive extends React.Component {
  static propTypes = {
    as: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
      PropTypes.element,
    ]).isRequired,
    children: PropTypes.node,
    normal: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['hover', 'active', 'hoverActive', 'touchActive', 'keyActive', 'focus']),
    ]),
    hover: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'active', 'hoverActive', 'touchActive', 'keyActive', 'focus']),
    ]),
    active: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'hoverActive', 'touchActive', 'keyActive', 'focus']),
    ]),
    hoverActive: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'active', 'touchActive', 'keyActive', 'focus']),
    ]),
    touchActive: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'active', 'hoverActive', 'keyActive', 'focus']),
    ]),
    keyActive: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'active', 'hoverActive', 'touchActive', 'focus']),
    ]),
    focus: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'active', 'hoverActive', 'touchActive', 'keyActive']),
    ]),
    forceState: PropTypes.shape({
      iState: PropTypes.oneOf(['normal', 'hover', 'hoverActive', 'touchActive', 'keyActive']),
      focus: PropTypes.bool,
    }),
    style: PropTypes.object,
    className: PropTypes.string,
    onStateChange: PropTypes.func,
    setStateCallback: PropTypes.func,
    onClick: PropTypes.func,
    onMouseClick: PropTypes.func,
    onTap: PropTypes.func,
    onTapTwo: PropTypes.func,
    onTapThree: PropTypes.func,
    onTapFour: PropTypes.func,

    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchEnd: PropTypes.func,
    onTouchCancel: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,

    mutableProps: PropTypes.bool,
    tabIndex: PropTypes.string,
  }

  constructor(props) {
    super(props);

    // state is always an object with two keys, `iState` and `focus`
    this.state = props.forceState || {
      // iState is always 1 of 5 strings:
      // 'normal', 'hover', 'hoverActive', 'touchActive', 'keyActive'
      iState: 'normal',
      // focus is always a boolean
      focus: false,
    };

    // things to keep track of so RI knows what to do when
    this.track = {
      touchStartTime: Date.now() - 2000,
      touchEndTime: Date.now() - 1000,
      touchDown: false,
      touches: {},
      mouseOn: false,
      buttonDown: false,
      focus: false,
      focusTransition: 'reset',
      focusStateOnMouseDown: false,
      spaceKeyDown: false,
      enterKeyDown: false,
      updateTopNode: false,
      state: this.state,
    };

    // the node returned by the ref callback
    this.refNode = null;
    // the actual top DOM node of `as`, needed when `as` is wrapped in a span
    this.topNode = null;

    // the listeners to pass down as props to the element/component
    this.listeners = this.determineListeners();
    this.clickListener = this.determineClickHandler();

    // this.p is used store things that are a deterministic function of props
    // to avoid recalculating every time they are needed, it can be thought of as a pure
    // extension to props and is only updated in the constructor and componentWillReceiveProps
    this.p = { sameProps: false };
    // set properties of `this.p`
    this.propsSetup(props);
  }

  componentWillReceiveProps(nextProps) {
    // set if the `topNode` needs to be updated in componentDidUpdate => `as` is different
    // and not a string, note that if `as` is a new string, then the `refCallback`
    // will be called by React so no need to do anything in componentDidUpdate
    this.track.updateTopNode = (this.props.as !== nextProps.as && typeof this.props.as !== 'string'
    && typeof nextProps.as !== 'string');

    // check if nextProps are the same as this.props
    this.p.sameProps = false;
    if (!nextProps.mutableProps && this.sameProps(this.props, nextProps)) this.p.sameProps = true;
    // if not same props, do props setup => set properties of `this.p`
    else this.propsSetup(nextProps);

    // if `forceState` prop, then update state
    if (this.p.props.forceState) {
      // toggle focus if it changed - required to keep browser's focus state in sync with RI's
      if (this.p.props.forceState.focus !== this.track.state.focus) this.toggleFocus('forceState');
      this.updateState(
        this.p.props.forceState,
        this.p.props,
        // create dummy 'event' object that caused the state change, will be passed to onStateChange
        { type: 'forcestate', persist: () => {} }
      );
    }
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
      (nextState.focus !== this.state.focus &&
      (this.p.focusStyle.style !== null || this.p.focusStyle.className !== ''))
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

  // find and set the top DOM node of `as`
  refCallback = (node) => {
    this.refNode = node;
    if (node) {
      // if `as` is a component, then the `refNode` is the span wrapper, so get its firstChild
      if (typeof this.p.props.as !== 'string') this.topNode = node.firstChild;
      else this.topNode = node;
      if (this.track.state.focus) {
        // if in the focus state, then call focus() on `this.topNode` so the browser focus state
        // is in sync with RI's focus state
        this.focusTransition('focus', 'refCallbackFocus');
      }
    }
  }

  // shallow compare of two sets of props, can be called recursivly
  sameProps(propsA, propsB) {
    // If children are ReactElements, e.g. JSX as opposed to strings,
    // they will not be equal even if they are the same because React.createElement(...)
    // returns a new instance every time and is called on every render,
    // so unless there is a deep compare of the ReactElement tree of children,
    // it doesn't make sense to continue checking other props.
    // Note, that when nothing has changed in props,
    // the only thing that's not equal are the children, so check first.
    if (propsA.children !== propsB.children) return false;

    const keysB = Object.keys(propsB);

    // don't include forceState when comparing props
    // forceState is handled in componentWillReceiveProps
    const nextPOffset = propsB.forceState ? -1 : 0;
    const pOffset = propsA.forceState ? -1 : 0;
    if ((keysB.length + nextPOffset) !== (Object.keys(propsA).length + pOffset)) return false;

    // shallow compare of state props => check style, className, onEnter, onLeave
    const sameStateProp = (iState) => {
      const iStateKeys = ['style', 'className', 'onEnter', 'onLeave'];
      if (!iStateKeys.some(key => propsB[iState][key])) return false;
      if (iStateKeys.some(key => propsB[iState][key] !== propsA[iState][key])) return false;
      return true;
    };

    // loop through props
    for (let i = 0; i < keysB.length; i++) {
      // skip if prop is forceState
      if (keysB[i] !== 'forceState') {
        // do propsA and propsB both have the property as their own?
        if (!Object.prototype.hasOwnProperty.call(propsA, keysB[i])) return false;
        // if the two props aren't equal, do some additional checks before returning false
        if (propsB[keysB[i]] !== propsA[keysB[i]]) {
          // list of state props to compare one level deeper
          const stateProps = {
            normal: true,
            hover: true,
            active: true,
            hoverActive: true,
            touchActive: true,
            keyActive: true,
            focus: true,
          };
          if (keysB[i] === 'as') {
            if (React.isValidElement(propsA.as) && React.isValidElement(propsB.as)) {
              // If `as` is JSX/ReactElement, shallowly compare it's props
              // with a recursive call to sameProps - this should only recurse one time
              // because the JSX/ReactElement shouldn't have the `as` prop.
              if (!this.sameProps(propsA.as.props, propsB.as.props)) return false;
            } else {
              return false;
            }
            // if the prop is a state, check one level deeper if the props are equal
          } else if (!(stateProps[keysB[i]] && sameStateProp(keysB[i]))) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // setup `this.p`, only called from constructor and componentWillReceiveProps
  propsSetup(props) {
    const { mergedProps, passThroughProps } = this.mergeAndExtractProps(props);
    this.p.normalStyle = this.extractStyle(mergedProps, 'normal');
    this.p.hoverStyle = this.extractStyle(mergedProps, 'hover');
    this.p.hoverActiveStyle = this.extractStyle(mergedProps, 'hoverActive');
    this.p.touchActiveStyle = this.extractStyle(mergedProps, 'touchActive');
    this.p.keyActiveStyle = this.extractStyle(mergedProps, 'keyActive');
    this.p.focusStyle = this.extractStyle(mergedProps, 'focus');
    this.p.passThroughProps = passThroughProps;
    this.p.props = mergedProps;
  }

  // extract passThroughProps and merge RI's props with `as`'s props if `as` is a JSX/ReactElement
  mergeAndExtractProps(props) {
    /* eslint-disable */
    // known props to not pass through, every prop not on this list is passed through
    const knownProps = {
      children:true, as:true, normal:true, hover:true, active:true, hoverActive:true,
      touchActive:true, keyActive:true, focus:true, forceState:true, style:true, className:true,
      onStateChange:true, setStateCallback:true, onClick:true, onMouseClick:true, onTap:true,
      onTapTwo:true, onTapThree:true, onTapFour:true, onMouseEnter:true, onMouseLeave:true,
      onMouseMove:true, onMouseDown:true, onMouseUp:true, onTouchStart:true, onTouchEnd:true,
      onTouchCancel:true, onFocus:true, onBlur:true, onKeyDown:true, onKeyUp:true,
      mutableProps:true,
    }
    /* eslint-enable */
    const mergedProps = {};
    const passThroughProps = {};
    Object.keys(props).forEach((key) => {
      mergedProps[key] = props[key];
      if (!knownProps[key]) passThroughProps[key] = props[key];
    });
    if (React.isValidElement(props.as)) {
      // if `as` is JSX/ReactElement, then merge in it's props
      Object.keys(props.as.props).forEach((key) => {
        mergedProps[key] = props.as.props[key];
        if (!knownProps[key]) passThroughProps[key] = props.as.props[key];
      });
      // set `as` to the JSX/ReactElement's `type`:
      // if the ReactElement is a ReactDOMElement then `type` will be a string, e.g. 'div', 'span'
      // if the ReactElement is a ReactComponentElement, then `type` will be
      // either a ReactClass or a ReactFunctionalComponent, e.g. as={<MyComponent />}
      // https://facebook.github.io/react/docs/glossary.html
      mergedProps.as = props.as.type;
    } else {
      mergedProps.as = props.as;
    }
    // use the `active` prop for `[type]Active` if no `[type]Active` prop
    if (mergedProps.active) {
      if (!mergedProps.hoverActive) mergedProps.hoverActive = mergedProps.active;
      if (!mergedProps.touchActive) mergedProps.touchActive = mergedProps.active;
      if (!mergedProps.keyActive) mergedProps.keyActive = mergedProps.active;
    }
    // if focus state prop and no tabIndex, then add a tabIndex so RI is focusable by browser
    if (mergedProps.focus && !mergedProps.tabIndex) passThroughProps.tabIndex = '0';
    return { mergedProps, passThroughProps };
  }

  // extract and return the style object and className string for the state given
  extractStyle(props, state) {
    if (!props[state]) return { style: null, className: '' };

    // if the state prop is a string pointing to another state prop to use for its style and
    // className, then loop until the state prop to use is found (i.e. it's not a string)
    let stateProps = typeof props[state] === 'string' ? props[props[state]] : props[state];
    let times = 0;
    while (typeof stateProps === 'string' && times < 4) {
      stateProps = props[stateProps];
      times++;
    }
    // if the state prop to use wasn't found, then return a blank style and className object
    if (typeof stateProps !== 'object') return { style: null, className: '' };

    const extract = {};
    // if the state prop object has one of these 4 keys then it's an options object,
    // otherwise it's a style object
    if (stateProps.style || stateProps.className || stateProps.onEnter || stateProps.onLeave) {
      extract.style = stateProps.style || null;
      extract.className = stateProps.className || '';
    } else {
      extract.style = stateProps;
      extract.className = '';
    }
    return extract;
  }

  // determine event listeners to set based on the device type - only determined once in constructor
  determineListeners() {
    const listeners = {};
    ['onFocus', 'onBlur', 'onKeyDown', 'onKeyUp'].forEach(
      (onEvent) => { listeners[onEvent] = this.handleFocusEvent; }
    );

    if (detectIt.hasTouchEventsApi) {
      ['onTouchStart', 'onTouchEnd', 'onTouchCancel'].forEach(
        (onEvent) => { listeners[onEvent] = this.handleTouchEvent; }
      );
    }
    // if the device is mouseOnly or hybrid, then set mouse listeners
    if (detectIt.deviceType !== 'touchOnly') {
      // if the device is a hybrid with the touch events api, then use the hybrid mouse handler,
      // note that a device can be a hybrid with touch capabilities only accessed through
      // the pointer events api, but in that case RI treats it as a mouseOnly device
      // because React doesn't support pointer events
      const handler = (detectIt.hasTouchEventsApi && detectIt.deviceType === 'hybrid') ?
        this.handleHybridMouseEvent : this.handleMouseEvent;
      ['onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseDown', 'onMouseUp']
      .forEach((onEvent) => { listeners[onEvent] = handler; });
    }
    return listeners;
  }

  // determine the handler to use for click events based on the deviceType
  determineClickHandler() {
    const dIt = detectIt;
    if (dIt.deviceType === 'touchOnly') return this.handleTouchEvent;
    if (dIt.deviceType === 'hybrid' && dIt.hasTouchEventsApi) return this.handleHybridMouseEvent;
    return this.handleMouseEvent;
  }

  // compute the state based on what's set in `this.track`, returns a new state object
  computeState() {
    const { mouseOn, buttonDown, touchDown, focus } = this.track;
    const focusKeyDown = focus && (this.track.spaceKeyDown || this.track.enterKeyDown);
    const newState = { focus };
    if (!mouseOn && !buttonDown && !touchDown && !focusKeyDown) newState.iState = 'normal';
    else if (mouseOn && !buttonDown && !touchDown && !focusKeyDown) newState.iState = 'hover';
    else if (mouseOn && buttonDown && !touchDown && !focusKeyDown) newState.iState = 'hoverActive';
    else if (focusKeyDown && !touchDown) newState.iState = 'keyActive';
    else if (touchDown) newState.iState = 'touchActive';
    return newState;
  }

  // takes a new state, calls setState and the state change callbacks
  updateState(newState, props, event) {
    const prevIState = this.track.state.iState;
    const nextIState = newState.iState;
    const iChange = (nextIState !== prevIState);
    const fChange = (newState.focus !== this.track.state.focus);

    // early return if state doesn't need to change
    if (!iChange && !fChange) return;

    // create new prev and next state objects with immutable values
    const prevState = {
      iState: prevIState,
      focus: this.track.state.focus,
    };
    const nextState = {
      iState: nextIState,
      focus: newState.focus,
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
    if (iChange) {
      if (prevIState !== 'hover') {
        props[prevIState] && props[prevIState].onLeave && props[prevIState].onLeave(prevIState);
      }
      if (/hover/.test(prevIState.toLowerCase()) && !/hover/.test(nextIState.toLowerCase())) {
        props.hover && props.hover.onLeave && props.hover.onLeave('hover');
      }
      if (/hover/.test(nextIState.toLowerCase()) && !/hover/.test(prevIState.toLowerCase())) {
        props.hover && props.hover.onEnter && props.hover.onEnter('hover');
      }
      if (nextIState !== 'hover') {
        props[nextIState] && props[nextIState].onEnter && props[nextIState].onEnter(nextIState);
      }
    }
    if (fChange) {
      const transition = newState.focus ? 'onEnter' : 'onLeave';
      props.focus && props.focus[transition] && props.focus[transition]('focus');
    }
  }

  // transition to a new focus state and track what initiated the transition
  focusTransition(event, transitionAs) {
    this.track.focusTransition = transitionAs;
    this.topNode[event]();
  }

  // toggle focus if it's allowed, returns a boolean representing if focus was toggled
  toggleFocus(toggleAs) {
    // only toggle out of focus if the tag is blurable (not input, button or textarea)
    if (this.track.state.focus && this.tagIsBlurable()) {
      this.focusTransition('blur', `${toggleAs}Blur`);
      return true;
    }
    // only toggle into focus if RI is focusable
    if (!this.track.state.focus &&
    (this.p.props.focus || this.p.props.tabIndex || !this.tagIsBlurable())) {
      this.focusTransition('focus', `${toggleAs}Focus`);
      return true;
    }
    return false;
  }

  // returns true if the tag is allowed to be blurred, false otherwise
  tagIsBlurable() {
    const nonBlurable = { INPUT: 1, BUTTON: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1 };
    return nonBlurable[this.topNode.tagName] === undefined;
  }

  handleMouseEvent = (e) => {
    switch (e.type) {
      case 'mouseenter':
        this.p.props.onMouseEnter && this.p.props.onMouseEnter(e);
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        break;
      case 'mouseleave':
        this.p.props.onMouseLeave && this.p.props.onMouseLeave(e);
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        break;
      case 'mousemove':
        this.p.props.onMouseMove && this.p.props.onMouseMove(e);
        // early return for mouse move
        if (this.track.mouseOn && this.track.buttonDown === (e.buttons === 1)) return;
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        break;
      case 'mousedown':
        this.p.props.onMouseDown && this.p.props.onMouseDown(e);
        this.track.mouseOn = true;
        this.track.buttonDown = true;
        // track focus state on mousedown to know if should blur on mouseup
        this.track.focusStateOnMouseDown = this.track.state.focus;
        // initiate focus if RI is not in focus and is focusable
        if (!this.track.state.focus && (this.p.props.focus || this.p.props.tabIndex)) {
          // focus() will call updateState so early return to prevent multiple updateState calls
          this.focusTransition('focus', 'mouseDownFocus');
          return;
        }
        break;
      case 'mouseup':
        this.p.props.onMouseUp && this.p.props.onMouseUp(e);
        this.track.buttonDown = false;
        // blur only if focus was not initiated on the preceding mousedown,
        // and RI is in focus and eligible to be blurred
        if (this.track.state.focus && this.track.focusStateOnMouseDown && this.tagIsBlurable()) {
          // focus() will call updateState so early return to prevent multiple updateState calls
          this.focusTransition('blur', 'mouseUpBlur');
          return;
        }
        break;
      case 'click':
        this.p.props.onMouseClick && this.p.props.onMouseClick(e);
        this.p.props.onClick && this.p.props.onClick(e);
        // click doesn't change state, so return
        return;
      default:
        return;
    }

    // compute the new state object and pass it as argument to updateState,
    // which calls setState and state change callbacks if needed
    this.updateState(this.computeState(), this.p.props, e);
  }

  handleHybridMouseEvent = (e) => {
    // Call the mouse handler if not touchDown and the event occurred after 600ms
    // from the last touchend event to prevent calling mouse handlers as a result
    // of touch interactions. On some devices (notably Android) during a long press the mouse
    // events will fire before touchend while touchDown is true, so also need to check for that.
    !this.track.touchDown && Date.now() - this.track.touchEndTime > 600 && this.handleMouseEvent(e);
  }

  // determine if the touch interaction resulted in a tap, returns the number of
  // touch points that resulted in a tap, or false if no tap occurred
  hasTaps() {
    if (this.track.touches.canceled) return false;
    const touches = this.track.touches;
    const touchKeys = Object.keys(touches);
    const touchCount = touchKeys.length;

    // max 500ms between start and end of touch interaction to be a tap
    const tapWithinTime = () => ((this.track.touchEndTime - this.track.touchStartTime) < 500);

    // make sure each touch point hasn't moved more than the allowed tolerance
    const touchesNotMoved = () => (
      touchKeys.every((touch) => (
        Math.abs(touches[touch].endX - touches[touch].startX) < 15 + (3 * touchCount) &&
        Math.abs(touches[touch].endY - touches[touch].startY) < 15 + (3 * touchCount)
      ))
    );

    if (tapWithinTime() && touchesNotMoved()) return touchCount;
    return false;
  }

  handleTouchEvent = (e) => {
    // reset mouse trackers
    this.track.mouseOn = false;
    this.track.buttonDown = false;

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
        break;
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
          const tapTouchPoints = this.hasTaps();
          // reset touch interaction tracking object
          this.track.touches = {};

          switch (tapTouchPoints) {
            case 1:
              this.p.props.onTap && this.p.props.onTap(e);
              this.p.props.onClick && this.p.props.onClick(e);
              // attempt to toggle focus, if successful, return b/c focus/blur called updateState
              if (this.toggleFocus('touchEnd')) return;
              break;
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
        break;

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
        break;

      // for click events fired on touchOnly devices, listen for because synthetic
      // click events won't fire touchend event
      case 'click': {
        // check to see if the click event is the result of a touch interaction
        // if > 600ms since last touch, then not the result of a touch interaction
        if (!this.track.touchDown && Date.now() - this.track.touchEndTime > 600) {
          this.p.props.onTap && this.p.props.onTap(e);
          this.p.props.onClick && this.p.props.onClick(e);
          // toggle focus unless the browser just initiated focus, for more info see:
          // https://github.com/rafrex/react-interactive/commit/b5358e8789267b75590e7d0f295e58fc1c3a0c1f
          if (!this.track.state.focus || this.track.focusTransition !== 'browserFocus') {
            // attempt to toggle focus, if successful, return b/c focus/blur called updateState
            if (this.toggleFocus('touchEnd')) return;
          }
          this.track.focusTransition = 'reset';

        // if the browser just initiated focus, then it is a legitimate click event
        // even if 600ms hasn't passed since the last touch event (e.g. repeatedly tap the screen),
        // so call tap and click handlers, this helps keep the entering and exiting of focus
        // in sync with the firing of click and tap events.
        } else if (this.track.state.focus && this.track.focusTransition === 'browserFocus') {
          this.p.props.onTap && this.p.props.onTap(e);
          this.p.props.onClick && this.p.props.onClick(e);
          this.track.focusTransition = 'reset';
        }
        return;
      }
      default:
        return;
    }

    // compute the new state object and pass it as argument to updateState,
    // which calls setState and state change callbacks if needed
    this.updateState(this.computeState(), this.p.props, e);
  }

  handleFocusEvent = (e) => {
    switch (e.type) {
      case 'focus':
        if (this.track.state.focus) return;

        // if focus was just toggled off on touchend, then this is an errant focus event
        // fired by the browser, so fire a blur event to put the browser in the correct focus state
        // and then return because RI is already in the correct focus state, for more info see:
        // https://github.com/rafrex/react-interactive/commit/b5358e8789267b75590e7d0f295e58fc1c3a0c1f
        if (this.track.focusTransition === 'touchEndBlur') {
          this.focusTransition('blur', 'focusForceBlur');
          return;
        }

        this.p.props.onFocus && this.p.props.onFocus(e);

        // if focusTransition is 'reset', 'browserFocus', or contains 'Blur', the focus event must
        // be from the browser, so set focusTransition to 'browserFocus', otherwise reset it
        this.track.focusTransition =
        (this.track.focusTransition === 'reset' || this.track.focusTransition === 'browserFocus' ||
        /Blur/.test(this.track.focusTransition)) ? 'browserFocus' : 'reset';

        this.track.focus = true;
        break;
      case 'blur':
        // if the focusTransition is a force blur to keep the browser focus state in sync
        // with RI's focus state, then reset the focusTransition and return, no need to do anything
        // else because the blur event was only for the benefit of the browser, not RI
        if (this.track.focusTransition === 'focusForceBlur' && !this.track.state.focus) {
          this.track.focusTransition = 'reset';
          return;
        }
        if (!this.track.state.focus) return;
        this.p.props.onBlur && this.p.props.onBlur(e);
        this.track.focus = false;
        break;
      case 'keydown':
        this.p.props.onKeyDown && this.p.props.onKeyDown(e);
        if (e.key === ' ') this.track.spaceKeyDown = true;
        else if (e.key === 'Enter') this.track.enterKeyDown = true;
        break;
      case 'keyup':
        this.p.props.onKeyUp && this.p.props.onKeyUp(e);
        if (e.key === ' ') this.track.spaceKeyDown = false;
        else if (e.key === 'Enter') this.track.enterKeyDown = false;
        break;
      default:
        return;
    }

    // compute the new state object and pass it as argument to updateState,
    // which calls setState and state change callbacks if needed
    this.updateState(this.computeState(), this.p.props, e);
  }

  render() {
    // build style object, priority order: focus style (if in focus state), iState style, style prop
    const style = {};
    // make the cursor a pointer by default if `as` is not an input or textarea and
    // there is a click handler or the element can receive focus
    if ((typeof this.p.props.as !== 'string' ||
    (this.p.props.as.toLowerCase() !== 'input' && this.p.props.as.toLowerCase() !== 'textarea')) &&
    (this.p.props.onClick || this.p.props.onMouseClick ||
    this.p.props.focus || this.p.props.tabIndex)) {
      style.cursor = 'pointer';
    }
    objectAssign(style, this.p.props.style, this.p[`${this.state.iState}Style`].style,
      this.state.focus ? this.p.focusStyle.style : null);

    // build className string, union of class names from className prop, iState className,
    // and focus className (if in the focus state)
    function joinClasses(className, iStateClass, focusClass) {
      let joined = className;
      joined += joined && iStateClass ? ` ${iStateClass}` : `${iStateClass}`;
      joined += joined && focusClass ? ` ${focusClass}` : `${focusClass}`;
      return joined;
    }
    const className =
    joinClasses(this.p.props.className || '', this.p[`${this.state.iState}Style`].className,
      this.state.focus ? this.p.focusStyle.className : '');

    // props to pass down:
    // listeners
    // style
    // className
    // passThroughProps
    const props = objectAssign({}, this.p.passThroughProps, this.listeners);
    props.style = style;
    if (className) props.className = className;

    // only set onClick listener if it's required
    if (this.p.props.onClick || this.p.props.onTap || this.p.props.onMouseClick ||
    this.p.props.focus || this.p.props.tabIndex) {
      props.onClick = this.clickListener;
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
