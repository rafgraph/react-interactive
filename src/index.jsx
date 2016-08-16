import React, { PropTypes } from 'react';
import detectIt from 'detect-it';
import objectAssign from 'object-assign';

/* eslint-disable */
const knownProps = {
  children:true, as:true, normal:true, hover:true, active:true, touchActive:true, focus:true,
  forceState:true, style:true, className:true, onStateChange:true,
  onClick:true, onMouseClick:true, onTap:true, onMouseEnter:true,
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
      touchStartTime: Date.now(),
      touchEndTime: Date.now(),
      touchDown: false,
      mouseOn: false,
      buttonDown: false,
      mouseUpTime: Date.now(),
      focus: false,
      focusStartState: false,
      spaceKeyDown: false,
      enterKeyDown: false,
      state: this.state,
    };

    // detect if pointer events polyfill is required
    // (required if only way to access a device's touch capabilities is through pointer events)
    this.pointerEventsPolyfill = detectIt.hasTouch && !detectIt.hasTouchEventsApi;

    this.refNode = null;
    this.refCallback = (node) => { this.refNode = node; };
    this.listeners = this.determineListeners();

    // this.p is used store things that are a deterministic function of props
    // to avoid recalulating on every render, it can be thought of as an extension to props
    this.p = { sameProps: false };
    this.propsSetup(props);
  }

  componentDidMount() {
    if (this.pointerEventsPolyfill) {
      const pfix = detectIt.pointerEventsPrefix;
      this.refNode.addEventListener(pfix('pointerdown'), this.handlePointerEvent, true);
      this.refNode.addEventListener(pfix('pointerup'), this.handlePointerEvent, true);
      this.refNode.addEventListener(pfix('pointercancel'), this.handlePointerEvent, true);
      this.refNode.addEventListener(pfix('pointerenter'), this.handlePointerEvent, true);
      this.refNode.addEventListener(pfix('pointerleave'), this.handlePointerEvent, true);
      this.refNode.addEventListener(pfix('pointermove'), this.handlePointerEvent, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.p.sameProps = false;
    if (!nextProps.mutableProps && this.sameProps(nextProps)) {
      this.p.sameProps = true;
    } else {
      this.propsSetup(nextProps);
    }
    nextProps.forceState && this.updateState(nextProps.forceState, nextProps);
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

  componentWillUnmount() {
    if (this.pointerEventsPolyfill) {
      const pfix = detectIt.pointerEventsPrefix;
      this.refNode.removeEventListener(pfix('pointerdown'), this.handlePointerEvent, true);
      this.refNode.removeEventListener(pfix('pointerup'), this.handlePointerEvent, true);
      this.refNode.removeEventListener(pfix('pointercancel'), this.handlePointerEvent, true);
      this.refNode.removeEventListener(pfix('pointerenter'), this.handlePointerEvent, true);
      this.refNode.removeEventListener(pfix('pointerleave'), this.handlePointerEvent, true);
      this.refNode.removeEventListener(pfix('pointermove'), this.handlePointerEvent, true);
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

    // bind click event handler based on device type, so handler knows how to route it
    if (this.props.onClick || this.props.onTap || this.props.onMouseClick ||
    this.props.focus || this.props.tabIndex) {
      const dType = detectIt.deviceType;
      if (dType === 'mouseOnly') listeners.onClick = this.handleClickEvent.bind(this, 'mouse');
      else if (dType === 'hybrid') listeners.onClick = this.handleClickEvent.bind(this, 'hybrid');
      else listeners.onClick = this.handleClickEvent.bind(this, 'touch');
    }

    // early return if pointer events polyfill is required
    // pointer event handlers are set in componentDidMount
    if (this.pointerEventsPolyfill) return listeners;

    if (detectIt.deviceType !== 'mouseOnly') {
      ['onTouchStart', 'onTouchEnd', 'onTouchCancel'].forEach(
        (onEvent) => { listeners[onEvent] = this.handleTouchEvent; }
      );
    }
    if (detectIt.deviceType !== 'touchOnly') {
      const handler =
        detectIt.deviceType === 'mouseOnly' ? this.handleMouseEvent : this.handleHybridMouseEvent;
      ['onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseDown', 'onMouseUp']
      .forEach((onEvent) => { listeners[onEvent] = handler; });
    }
    return listeners;
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


  handleMouseEvent = (e, override) => {
    const type = (override && override.typeOverride) || e.type;
    switch (type) {
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
        break;
      case 'mouseup':
        this.props.onMouseUp && this.props.onMouseUp(e);
        this.track.mouseUpTime = Date.now();
        this.track.buttonDown = false;
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

  handleClickEvent = (route, e) => {
    // route to respective device type handlers
    if (route === 'mouse') this.handleMouseEvent(e);
    else if (route === 'touch') this.handleTouchEvent(e);
    else if (route === 'hybrid') this.handleHybridMouseEvent(e);

    // toggle focus check - need to call blur on click and not on touchend or mouseup so the browser
    // doesn't refocus the element on click after it was blurred on touchend/mouseup, if the element
    // doesn't have focus when the interaction started, then don't call blur, but when the event is
    // synthetic (no intereaction) then call blur -> Date.now is synthetic detection
    if (this.track.state.focus && (this.track.focusStartState ||
      ((Date.now() - this.track.mouseUpTime > 600) && (Date.now() - this.track.touchEndTime > 600))
    )) {
      if (typeof this.props.as === 'string') this.refNode.blur();
      else {
        const el = document.activeElement;
        el && el.blur();
      }
    }
  }

  handleTouchEvent = (e, override) => {
    const type = (override && override.typeOverride) || e.type;
    switch (type) {
      case 'touchstart':
        this.props.onTouchStart && this.props.onTouchStart(e);
        this.track.touchDown = true;
        this.track.touchStartTime = Date.now();
        this.track.focusStartState = this.track.state.focus;
        break;
      case 'touchend':
        this.props.onTouchEnd && this.props.onTouchEnd(e);
        this.track.touchDown = false;
        this.track.touchEndTime = Date.now();
        if ((this.track.touchEndTime - this.track.touchStartTime) < 500) {
          this.props.onTap && this.props.onTap(e);
          this.props.onClick && this.props.onClick(e);

          if ((this.props.focus || this.props.tabIndex) && !this.track.state.focus &&
          typeof this.props.as === 'string') {
            // this calls the focus listener sychronously, and that handler will call
            // updateState(), so early return here
            this.refNode.focus();
            return;
          }
        }
        break;
      case 'touchcancel':
        this.props.onTouchCancel && this.props.onTouchCancel(e);
        this.track.touchDown = false;
        this.track.touchEndTime = Date.now();
        break;

      // for click events fired on touchOnly devices, listen for becasue synthetic
      // click events won't fire touchend
      case 'click': {
        if ((this.props.onClick || this.props.onTap) &&
        Date.now() - this.track.touchEndTime > 600) {
          this.props.onTap && this.props.onTap(e);
          this.props.onClick && this.props.onClick(e);
        }
        return;
      }
      default:
        return;
    }

    this.track.mouseOn = false;
    this.track.buttonDown = false;

    this.updateState(this.computeState(), this.props, e);
  }

  handlePointerEvent = (e) => {
    const pointerType = { touch: 't', 2: 't', pen: 't', 3: 't', mouse: 'm', 4: 'm' };

    const pointerTouchMap = {
      pointerdown: 'touchstart',
      MSPointerDown: 'touchstart',
      pointerup: 'touchend',
      MSPointerUp: 'touchend',
      pointercancel: 'touchcancel',
      MSPointerCancel: 'touchcancel',
    };
    const pointerMouseMap = {
      pointerdown: 'mousedown',
      MSPointerDown: 'mousedown',
      pointerup: 'mouseup',
      MSPointerUp: 'mouseup',
      pointermove: 'mousemove',
      MSPointerMove: 'mousemove',
    };
    const passThroughToMouse = {
      pointerenter: 'mouseenter',
      MSPointerEnter: 'mouseenter',
      pointerleave: 'mouseleave',
      MSPointerLeave: 'mouseleave',
    };

    if (passThroughToMouse[e.type]) {
      const typeOverride = passThroughToMouse[e.type];
      this.handleMouseEvent(e, { typeOverride });
    } else if (pointerType[e.pointerType] === 'm' && pointerMouseMap[e.type]) {
      const typeOverride = pointerMouseMap[e.type];
      this.handleMouseEvent(e, { typeOverride });
    } else if (pointerType[e.pointerType] === 't' && pointerTouchMap[e.type]) {
      const typeOverride = pointerTouchMap[e.type];
      this.handleTouchEvent(e, { typeOverride });
    }
  }

  handleFocusEvent = (e) => {
    switch (e.type) {
      case 'focus':
        this.props.onFocus && this.props.onFocus(e);
        this.track.focus = true;
        break;
      case 'blur':
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
    props.className = className;

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
