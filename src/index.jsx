import React, { PropTypes } from 'react';
import detectIt from 'detect-it';
import objectAssign from 'object-assign';

/* eslint-disable */
const knownProps = {
  children:true, as:true, normal:true, hover:true, active:true, touchActive:true, focus:true,
  forceState:true, style:true, className:true, onStateChange:true,
  onClick:true, onMouseClick:true, onTap:true, onTapTwo:true, onTapThree:true, onMouseEnter:true,
  onMouseLeave:true, onMouseMove:true, onMouseDown:true, onMouseUp:true,
  onTouchStart:true, onTouchEnd:true, onTouchCancel:true, onFocus:true,
  onBlur:true, onKeyDown:true, onKeyUp:true, mutableProps:true,
}
/* eslint-enable */

class ReactInteractive extends React.Component {
  static propTypes = {
    as: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]).isRequired,
    children: PropTypes.node,
    normal: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['hover', 'active', 'touchActive', 'focus']),
    ]),
    hover: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'active', 'touchActive', 'focus']),
    ]),
    active: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'touchActive', 'focus']),
    ]),
    touchActive: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'active', 'focus']),
    ]),
    focus: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.oneOf(['normal', 'hover', 'active', 'touchActive']),
    ]),
    forceState: PropTypes.shape({
      iState: PropTypes.oneOf(['normal', 'hover', 'active', 'touchActive']),
      focus: PropTypes.bool,
    }),
    style: PropTypes.object,
    className: PropTypes.string,
    onStateChange: PropTypes.func,
    onClick: PropTypes.func,
    onMouseClick: PropTypes.func,
    onTap: PropTypes.func,
    onTapTwo: PropTypes.func,
    onTapThree: PropTypes.func,

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
    this.state = props.forceState || {
      iState: 'normal',
      focus: false,
    };
    this.track = {
      touchStartTime: Date.now() - 2000,
      touchEndTime: Date.now() - 1000,
      touchDown: false,
      touches: {},
      mouseOn: false,
      buttonDown: false,
      focus: false,
      focusTransition: 'reset',
      focusStartState: false,
      blurTime: Date.now() - 1000,
      spaceKeyDown: false,
      enterKeyDown: false,
      updateTopNode: false,
      state: this.state,
    };

    this.refNode = null;
    this.topNode = null;
    this.listeners = this.determineListeners();
    this.clickListener = this.determineClickHandler();

    // this.p is used store things that are a deterministic function of props
    // to avoid recalulating on every render, it can be thought of as an extension to props
    this.p = { sameProps: false };
    this.propsSetup(props);
  }

  componentWillReceiveProps(nextProps) {
    this.track.updateTopNode = (this.props.as !== nextProps.as && typeof this.props.as !== 'string'
    && typeof nextProps.as !== 'string');

    this.p.sameProps = false;
    if (!nextProps.mutableProps && this.sameProps(nextProps)) this.p.sameProps = true;
    else this.propsSetup(nextProps);
    if (nextProps.forceState) {
      if (nextProps.forceState.focus !== this.track.state.focus) this.toggleFocus('forceState');
      this.updateState(nextProps.forceState, nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // or statement, returns true on first true value, returns false if all are false
    return (
      (!this.p.sameProps && nextProps !== this.props)
      ||
      (nextState.iState !== this.state.iState &&
      (this.p[`${nextState.iState}Style`].style !== this.p[`${this.state.iState}Style`].style ||
      this.p[`${nextState.iState}Style`].className !==
      this.p[`${this.state.iState}Style`].className))
      ||
      (nextState.focus !== this.state.focus &&
      (this.p.focusStyle.style !== null || this.p.focusStyle.className !== ''))
    );
  }

  componentDidUpdate() {
    // refCallback isn't called by React when `as` is component becasue the span wrapper
    // remains the same element and is not re-mounted in the DOM, so need to call refCallback here
    // if `as` is new and a component.
    if (this.track.updateTopNode) {
      this.track.updateTopNode = false;
      this.refCallback(this.refNode);
    }
  }

  refCallback = (node) => {
    this.refNode = node;
    if (node) {
      if (typeof this.props.as !== 'string') this.topNode = node.firstChild;
      else this.topNode = node;
      if (this.track.state.focus) {
        this.focusTransition('focus', 'refCallbackFocus');
      }
    }
  }

  sameProps(nextProps) {
    const keys = Object.keys(nextProps);

    const nextPOffset = nextProps.forceState ? -1 : 0;
    const pOffset = this.props.forceState ? -1 : 0;
    if ((keys.length + nextPOffset) !== (Object.keys(this.props).length + pOffset)) return false;

    const iStates = { normal: true, hover: true, active: true, touchActive: true, focus: true };
    const sameIStateProp = (iState) => {
      if (!(nextProps[iState].style || nextProps[iState].className ||
      nextProps[iState].onEnter || nextProps[iState].onLeave)) return false;
      if (nextProps[iState].style !== this.props[iState].style) return false;
      if (nextProps[iState].className !== this.props[iState].className) return false;
      if (nextProps[iState].onEnter !== this.props[iState].onEnter) return false;
      if (nextProps[iState].onLeave !== this.props[iState].onLeave) return false;
      return true;
    };

    for (let i = 0; i < keys.length; i++) {
      if ((!Object.prototype.hasOwnProperty.call(this.props, keys[i]) ||
      (nextProps[keys[i]] !== this.props[keys[i]] && iStates[keys[i]] && !sameIStateProp(keys[i])))
      && (keys[i] !== 'forceState')) {
        return false;
      }
    }
    return true;
  }

  propsSetup(props) {
    this.p.passThroughProps = this.extractPassThroughProps(props);
    this.p.normalStyle = this.extractStyle(props, 'normal');
    this.p.hoverStyle = this.extractStyle(props, 'hover');
    this.p.activeStyle = this.extractStyle(props, 'active');
    this.p.touchActiveStyle = this.extractStyle(props, 'touchActive');
    this.p.focusStyle = this.extractStyle(props, 'focus');
  }

  extractPassThroughProps(props) {
    const passThroughProps = {};
    Object.keys(props).forEach((key) => {
      if (!knownProps[key]) passThroughProps[key] = props[key];
    });
    if (props.focus && !props.tabIndex) passThroughProps.tabIndex = '0';
    return passThroughProps;
  }

  extractStyle(props, state) {
    if (!props[state]) return { style: null, className: '' };
    let stateProps = typeof props[state] === 'string' ? props[props[state]] : props[state];
    let times = 0;
    while (typeof stateProps === 'string' && times < 3) {
      stateProps = props[stateProps];
      times++;
    }
    if (typeof stateProps !== 'object') return { style: null, className: '' };

    const extract = {};
    if (stateProps.style || stateProps.className || stateProps.onEnter || stateProps.onLeave) {
      extract.style = stateProps.style || null;
      extract.className = stateProps.className || '';
    } else {
      extract.style = stateProps;
      extract.className = '';
    }
    return extract;
  }

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
    if (detectIt.deviceType !== 'touchOnly') {
      const handler = (detectIt.hasTouchEventsApi && detectIt.deviceType === 'hybrid') ?
        this.handleHybridMouseEvent : this.handleMouseEvent;
      ['onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseDown', 'onMouseUp']
      .forEach((onEvent) => { listeners[onEvent] = handler; });
    }
    return listeners;
  }

  determineClickHandler() {
    const dIt = detectIt;
    if (dIt.deviceType === 'touchOnly') return this.handleTouchEvent;
    if (dIt.deviceType === 'hybrid' && dIt.hasTouchEventApi) return this.handleHybridMouseEvent;
    return this.handleMouseEvent;
  }

  computeState() {
    const { mouseOn, buttonDown, touchDown, focus } = this.track;
    const focusKeyDown = focus && (this.track.spaceKeyDown || this.track.enterKeyDown);
    const newState = { focus };
    if (touchDown) newState.iState = 'touchActive';
    else if (!mouseOn && !focusKeyDown) newState.iState = 'normal';
    else if (mouseOn && !buttonDown && !focusKeyDown) newState.iState = 'hover';
    else if ((mouseOn && buttonDown) || focusKeyDown) newState.iState = 'active';
    return newState;
  }

  updateState(newState, props = {}, e = {}) {
    const iChange = (newState.iState !== this.track.state.iState);
    const fChange = (newState.focus !== this.track.state.focus);

    // early return if state doesn't need to change
    if (!iChange && !fChange) return;

    // call onStateChange prop callback
    props.onStateChange && props.onStateChange({
      prevState: this.track.state,
      nextState: newState,
      event: e,
    });

    // setup onEnter/onLeave state callbacks to pass as cb to setState
    const prevIState = iChange && this.track.state.iState;
    const prevIStateCB = iChange && props[prevIState] && props[prevIState].onLeave;
    const nextIState = iChange && newState.iState;
    const nextIStateCB = iChange && props[nextIState] && props[nextIState].onEnter;
    const focusStateCB = fChange && (
      (this.track.state.focus && props.focus && props.focus.onLeave) ||
      (newState.focus && props.focus && props.focus.onEnter)
    );
    const setStateCallback = () => {
      prevIStateCB && prevIStateCB(prevIState);
      nextIStateCB && nextIStateCB(nextIState);
      focusStateCB && focusStateCB('focus');
    };

    // track new state becasue setState is asyncrounous
    this.track.state = newState;

    // only place that setState is called
    this.setState(newState, setStateCallback);
  }

  focusTransition = (event, transition) => {
    this.track.focusTransition = transition;
    if (event === 'blur') this.track.blurTime = Date.now();
    this.topNode[event]();
  }

  toggleFocus = (toggleAs) => {
    if (this.track.state.focus && this.tagIsBlurable()) {
      this.focusTransition('blur', `${toggleAs}Blur`);
      return true;
    }
    if (!this.track.state.focus && (this.props.focus || this.props.tabIndex)) {
      this.focusTransition('focus', `${toggleAs}Focus`);
      return true;
    }
    return false;
  };

  tagIsBlurable = () => {
    const tag = this.topNode.tagName;
    return tag !== 'INPUT' && tag !== 'BUTTON';
  }

  handleMouseEvent = (e) => {
    switch (e.type) {
      case 'mouseenter':
        this.props.onMouseEnter && this.props.onMouseEnter(e);
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        break;
      case 'mouseleave':
        this.props.onMouseLeave && this.props.onMouseLeave(e);
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        break;
      case 'mousemove':
        this.props.onMouseMove && this.props.onMouseMove(e);
        // early return for mouse move
        if (this.track.mouseOn && this.track.buttonDown === (e.buttons === 1)) return;
        this.track.mouseOn = true;
        this.track.buttonDown = e.buttons === 1;
        break;
      case 'mousedown':
        this.props.onMouseDown && this.props.onMouseDown(e);
        this.track.mouseOn = true;
        this.track.buttonDown = true;
        this.track.focusStartState = this.track.state.focus;
        if (!this.track.state.focus && (this.props.focus || this.props.tabIndex)) {
          this.focusTransition('focus', 'mouseDownFocus');
          return;
        }
        break;
      case 'mouseup':
        this.props.onMouseUp && this.props.onMouseUp(e);
        this.track.buttonDown = false;
        if (this.track.state.focus && this.track.focusStartState && this.tagIsBlurable()) {
          this.focusTransition('blur', 'mouseUpBlur');
          return;
        }
        break;
      case 'click':
        this.props.onMouseClick && this.props.onMouseClick(e);
        this.props.onClick && this.props.onClick(e);
        return;
      default:
        return;
    }

    this.updateState(this.computeState(), this.props, e);
  }

  handleHybridMouseEvent = (e) => {
    !this.track.touchDown && Date.now() - this.track.touchEndTime > 600 && this.handleMouseEvent(e);
  }

  hasTaps = () => {
    if (this.track.touches.canceled) return false;
    const touches = this.track.touches;
    const touchKeys = Object.keys(touches);
    const touchCount = touchKeys.length;

    const tapWithinTime = () => ((this.track.touchEndTime - this.track.touchStartTime) < 500);
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
    this.track.mouseOn = false;
    this.track.buttonDown = false;

    switch (e.type) {
      case 'touchstart':
        this.props.onTouchStart && this.props.onTouchStart(e);

        // if going from no touch to touch, set touch start time
        if (!this.track.touchDown) this.track.touchStartTime = Date.now();
        this.track.touchDown = true;

        // cancel if also touching someplace else on the screen
        if (e.touches.length !== e.targetTouches.length) this.track.touches.canceled = true;

        if (!this.track.touches.canceled) {
          // log touch start position for each touch
          for (let i = 0; i < e.changedTouches.length; i++) {
            this.track.touches[e.changedTouches[i].identifier] = {
              startX: e.changedTouches[i].clientX,
              startY: e.changedTouches[i].clientY,
            };
          }
        }
        break;
      case 'touchend':
        this.props.onTouchEnd && this.props.onTouchEnd(e);
        this.track.touchDown = e.targetTouches.length > 0;

        // cancel if also touching someplace else on the screen
        if (e.touches.length !== e.targetTouches.length) this.track.touches.canceled = true;

        if (!this.track.touches.canceled) {
          // log touch end position for each touch
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touchTrack = this.track.touches[e.changedTouches[i].identifier];
            if (touchTrack) {
              touchTrack.endX = e.changedTouches[i].clientX;
              touchTrack.endY = e.changedTouches[i].clientY;
            }
          }
        }

        if (e.targetTouches.length === 0) {
          this.track.touchEndTime = Date.now();

          const taps = this.hasTaps();
          this.track.touches = {};

          switch (taps) {
            case 1:
              this.props.onTap && this.props.onTap(e);
              this.props.onClick && this.props.onClick(e);
              if (this.toggleFocus('touchEnd')) return;
              break;
            case 2:
              this.props.onTapTwo && this.props.onTapTwo(e);
              break;
            case 3:
              this.props.onTapThree && this.props.onTapThree(e);
              break;
            default:
          }
        }
        break;

      case 'touchcancel':
        this.props.onTouchCancel && this.props.onTouchCancel(e);
        this.track.touchDown = e.targetTouches.length > 0;
        if (e.targetTouches.length === 0) {
          this.track.touchEndTime = Date.now();
          this.track.touches = {};
        } else {
          this.track.touches.canceled = true;
        }
        break;

      // for click events fired on touchOnly devices, listen for becasue synthetic
      // click events won't fire touchend
      case 'click': {
        if (Date.now() - this.track.touchEndTime > 600) {
          this.props.onTap && this.props.onTap(e);
          this.props.onClick && this.props.onClick(e);
          if (this.toggleFocus('touchEnd')) return;
        }
        return;
      }
      default:
        return;
    }

    this.updateState(this.computeState(), this.props, e);
  }

  handleFocusEvent = (e) => {
    switch (e.type) {
      case 'focus':
        if (this.track.state.focus) return;
        if (this.track.focusTransition !== 'reset' || !this.tagIsBlurable() ||
        (detectIt.deviceType !== 'touchOnly' && Date.now() - this.track.blurTime > 600)) {
          this.props.onFocus && this.props.onFocus(e);
          this.track.focusTransition = 'reset';
          this.track.focus = true;
        } else if (this.tagIsBlurable()) {
          this.focusTransition('blur', 'focusForceBlur');
          return;
        }
        break;
      case 'blur':
        if (this.track.focusTransition === 'focusForceBlur' && !this.track.state.focus) {
          this.track.focusTransition = 'reset';
          return;
        }
        this.track.focusTransition = 'reset';
        if (!this.track.state.focus) return;
        this.props.onBlur && this.props.onBlur(e);
        this.track.focus = false;
        break;
      case 'keydown':
        this.props.onKeyDown && this.props.onKeyDown(e);
        if (e.key === ' ') this.track.spaceKeyDown = true;
        else if (e.key === 'Enter') this.track.enterKeyDown = true;
        break;
      case 'keyup':
        this.props.onKeyUp && this.props.onKeyUp(e);
        if (e.key === ' ') this.track.spaceKeyDown = false;
        else if (e.key === 'Enter') this.track.enterKeyDown = false;
        break;
      default:
        return;
    }

    this.updateState(this.computeState(), this.props, e);
  }

  render() {
    const style = objectAssign({}, this.props.style,
      this.p[`${this.state.iState}Style`].style,
      this.state.focus ? this.p.focusStyle.style : null);

    function joinClasses(className, iStateClass, focusClass) {
      let joined = className;
      joined += joined && iStateClass ? ` ${iStateClass}` : `${iStateClass}`;
      joined += joined && focusClass ? ` ${focusClass}` : `${focusClass}`;
      return joined;
    }
    const className =
    joinClasses(this.props.className || '', this.p[`${this.state.iState}Style`].className,
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
    if (this.props.onClick || this.props.onTap || this.props.onMouseClick ||
    this.props.focus || this.props.tabIndex) {
      props.onClick = this.clickListener;
    }

    if (typeof this.props.as === 'string') {
      props.ref = this.refCallback;
      return React.createElement(this.props.as, props, this.props.children);
    }
    // If this.props.as is a component class, then wrap it in a span
    // so can attach ref without breaking encapsulation
    return React.createElement('span', { ref: this.refCallback },
      React.createElement(this.props.as, props, this.props.children)
    );
  }
}

export default ReactInteractive;
