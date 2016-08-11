import React, { PropTypes } from 'react';
import detectIt from 'detect-it';

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
  }

  constructor(props) {
    super(props);
    this.track = {
      touchStartTime: Date.now(),
      touchEndTime: Date.now(),
      touchDown: false,
      mouseOn: false,
      buttonDown: false,
      focus: false,
      spaceKeyDown: false,
      enterKeyDown: false,
    };
    this.listeners = this.getListeners();
    this.state = {
      iState: 'normal',
      focus: false,
    };
  }

  getListeners() {
    const listeners = {};
    ['onFocus', 'onBlur', 'onKeyDown', 'onKeyUp'].forEach(
      (onEvent) => { listeners[onEvent] = this.handleEvent; }
    );
    if (detectIt.deviceType !== 'mouseOnly') {
      ['onTouchStart', 'onTouchEnd', 'onTouchCancel'].forEach(
        (onEvent) => { listeners[onEvent] = this.handleEvent; }
      );
    }
    if (detectIt.deviceType !== 'touchOnly') {
      const handler =
        detectIt.deviceType === 'mouseOnly' ? this.handleEvent : this.handleHybridMouseEvent;
      ['onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseDown', 'onMouseUp'].forEach(
        (onEvent) => { listeners[onEvent] = handler; }
      );
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

  updateState(newState, e = {}) {
    const iChange = newState.iState !== this.state.iState;
    const fChange = newState.focus !== this.state.focus;

    // early return if state doesn't need to change
    if (!iChange && !fChange) return;

    // call onStateChange prop callback
    this.props.onStateChange && this.props.onStateChange({
      prevState: this.state,
      nextState: newState,
      event: e,
    });

    // setup onEnter/onLeave state callbacks to pass as cb to setState
    const prevIState = iChange && this.state.iState;
    const prevIStateCB = iChange && this.props[prevIState] && this.props[prevIState].onLeave;
    const nextIState = iChange && newState.iState;
    const nextIStateCB = iChange && this.props[nextIState] && this.props[nextIState].onEnter;
    const focusStateCB = fChange && (
      (this.state.focus && this.props.focus && this.props.focus.onLeave) ||
      (newState.focus && this.props.focus && this.props.focus.onEnter)
    );
    const setStateCallback = () => {
      prevIStateCB && prevIStateCB(prevIState);
      nextIStateCB && nextIStateCB(nextIState);
      focusStateCB && focusStateCB('focus');
    };

    // only place that setState is called
    this.setState(newState, setStateCallback);
  }


  handleMouseEvent = (e) => {
    console.log(e.type);
    console.log(e);

    switch (e.type) {
      case 'mousenter':
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
        break;
      case 'mouseup':
        this.props.onMouseUp && this.props.onMouseUp(e);
        this.track.buttonDown = false;
        break;
      case 'touchstart':
        this.props.onTouchStart && this.props.onTouchStart(e);
        this.track.touchDown = true;
        this.track.touchStartTime = Date.now();
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        break;
      case 'touchend':
        this.props.onTouchEnd && this.props.onTouchEnd(e);
        this.track.touchDown = false;
        this.track.touchEndTime = Date.now();
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        break;
      case 'touchcancel':
        this.props.onTouchCancel && this.props.onTouchCancel(e);
        this.track.touchDown = false;
        this.track.touchEndTime = Date.now();
        this.track.mouseOn = false;
        this.track.buttonDown = false;
        break;
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

    const newState = this.computeState();
    if ((newState.iState !== this.state.iState) || (newState.focus !== this.state.focus)) {
      this.setState(newState);
    }
  }

  handleHybridMouseEvent = (e) => {
    console.log(e.type);
    !this.track.touchDown && ((Date.now() - this.track.touchEndTime) > 600) && this.handleEvent(e);
  }

  render() {
    const { as } = this.props;
    const children = `${this.state.iState}-focus:${this.state.focus}`; // for testing purposes
    const props = this.listeners;
    // props.tabIndex = 1;
    return React.createElement(as, props, children);
  }
}

export default ReactInteractive;
