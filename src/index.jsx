import React, { PropTypes } from 'react';
import detectIt from 'detect-it';
import objectAssign from 'object-assign';

/* eslint-disable */
const knownProps = {
  children:true, as:true, normal:true, hover:true, active:true, touchActive:true, focus:true,
  forceState:true, style:true, className:true, onStateChange:true, setStateCallback:true,
  onClick:true, onMouseClick:true, onTap:true, onTapTwo:true, onTapThree:true, onTapFour:true,
  onMouseEnter:true, onMouseLeave:true, onMouseMove:true, onMouseDown:true, onMouseUp:true,
  onTouchStart:true, onTouchEnd:true, onTouchCancel:true, onFocus:true,
  onBlur:true, onKeyDown:true, onKeyUp:true, mutableProps:true,
}
/* eslint-enable */

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
    // and is only updated in the constructor and componentWillReceiveProps
    this.p = { sameProps: false };
    this.propsSetup(props);
  }

  componentWillReceiveProps(nextProps) {
    this.track.updateTopNode = (this.props.as !== nextProps.as && typeof this.props.as !== 'string'
    && typeof nextProps.as !== 'string');

    this.p.sameProps = false;
    if (!nextProps.mutableProps && this.sameProps(this.props, nextProps)) this.p.sameProps = true;
    else this.propsSetup(nextProps);
    if (this.p.props.forceState) {
      if (this.p.props.forceState.focus !== this.track.state.focus) this.toggleFocus('forceState');
      this.updateState(this.p.props.forceState, this.p.props);
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
      if (typeof this.p.props.as !== 'string') this.topNode = node.firstChild;
      else this.topNode = node;
      if (this.track.state.focus) {
        this.focusTransition('focus', 'refCallbackFocus');
      }
    }
  }

  sameProps(propsA, propsB) {
    // If children are ReactElements, e.g. JSX as opposed to strings,
    // they will not be equal even if they are the same because React.createElement(...)
    // returns a new instance every time and is called on every render,
    // so unless there is a deep compare of the ReactElement tree of children,
    // it doesn't make sense to continue checking other props.
    // Note, that when nothing has changed in props,
    // the only thing that's not equal are the children, so check first.
    if (propsA.children !== propsB.children) return false;

    const keys = Object.keys(propsB);

    const nextPOffset = propsB.forceState ? -1 : 0;
    const pOffset = propsA.forceState ? -1 : 0;
    if ((keys.length + nextPOffset) !== (Object.keys(propsA).length + pOffset)) return false;

    const iStates = { normal: true, hover: true, active: true, touchActive: true, focus: true };
    const sameIStateProp = (iState) => {
      const iStateKeys = ['style', 'className', 'onEnter', 'onLeave'];
      if (!iStateKeys.some((key) => propsB[iState][key])) return false;
      if (iStateKeys.some((key) => propsB[iState][key] !== propsA[iState][key])) return false;
      return true;
    };

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'forceState') {
        if (!Object.prototype.hasOwnProperty.call(propsA, keys[i])) return false;
        if (propsB[keys[i]] !== propsA[keys[i]]) {
          if (keys[i] === 'as') {
            if (React.isValidElement(propsA.as) && React.isValidElement(propsB.as)) {
              // If `as` is JSX/ReactElement, shallowly compare it's props
              // with a recursive call to sameProps - this should only recurse one time
              // because the JSX/ReactElement shouldn't have the `as` prop.
              if (!this.sameProps(propsA.as.props, propsB.as.props)) return false;
            } else {
              return false;
            }
          } else if (!(iStates[keys[i]] && sameIStateProp(keys[i]))) {
            return false;
          }
        }
      }
    }
    return true;
  }

  propsSetup(props) {
    const { mergedProps, passThroughProps } = this.mergeAndExtractProps(props);
    this.p.normalStyle = this.extractStyle(mergedProps, 'normal');
    this.p.hoverStyle = this.extractStyle(mergedProps, 'hover');
    this.p.activeStyle = this.extractStyle(mergedProps, 'active');
    this.p.touchActiveStyle = this.extractStyle(mergedProps, 'touchActive');
    this.p.focusStyle = this.extractStyle(mergedProps, 'focus');
    this.p.passThroughProps = passThroughProps;
    this.p.props = mergedProps;
  }

  mergeAndExtractProps(props) {
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
    if (props.focus && !props.tabIndex) passThroughProps.tabIndex = '0';
    return { mergedProps, passThroughProps };
  }

  extractStyle(props, iState) {
    if (!props[iState]) return { style: null, className: '' };
    let iStateProps = typeof props[iState] === 'string' ? props[props[iState]] : props[iState];
    let times = 0;
    while (typeof iStateProps === 'string' && times < 3) {
      iStateProps = props[iStateProps];
      times++;
    }
    if (typeof iStateProps !== 'object') return { style: null, className: '' };

    const extract = {};
    if (iStateProps.style || iStateProps.className || iStateProps.onEnter || iStateProps.onLeave) {
      extract.style = iStateProps.style || null;
      extract.className = iStateProps.className || '';
    } else {
      extract.style = iStateProps;
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
    const prevIState = this.track.state.iState;
    const nextIState = newState.iState;
    const iChange = (nextIState !== prevIState);
    const fChange = (newState.focus !== this.track.state.focus);

    // early return if state doesn't need to change
    if (!iChange && !fChange) return;

    const prevState = {
      iState: prevIState,
      focus: this.track.state.focus,
    };
    const nextState = {
      iState: nextIState,
      focus: newState.focus,
    };

    // call onStateChange prop callback
    props.onStateChange && props.onStateChange({ prevState, nextState, event: e });

    // call onEnter and onLeave callbacks
    if (iChange) {
      props[prevIState] && props[prevIState].onLeave && props[prevIState].onLeave(prevIState);
      props[nextIState] && props[nextIState].onEnter && props[nextIState].onEnter(nextIState);
    }
    if (fChange) {
      const transition = newState.focus ? 'onEnter' : 'onLeave';
      props.focus && props.focus[transition] && props.focus[transition]('focus');
    }

    // track new state becasue setState is asyncrounous
    this.track.state = newState;

    // only place that setState is called
    this.setState(newState,
      props.setStateCallback && props.setStateCallback.bind(this, { prevState, nextState })
    );
  }

  focusTransition(event, transition) {
    this.track.focusTransition = transition;
    if (event === 'blur') this.track.blurTime = Date.now();
    this.topNode[event]();
  }

  toggleFocus(toggleAs) {
    if (this.track.state.focus && this.tagIsBlurable()) {
      this.focusTransition('blur', `${toggleAs}Blur`);
      return true;
    }
    if (!this.track.state.focus && (this.p.props.focus || this.p.props.tabIndex)) {
      this.focusTransition('focus', `${toggleAs}Focus`);
      return true;
    }
    return false;
  }

  tagIsBlurable() {
    const tag = this.topNode.tagName;
    return tag !== 'INPUT' && tag !== 'BUTTON';
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
        this.track.focusStartState = this.track.state.focus;
        if (!this.track.state.focus && (this.p.props.focus || this.p.props.tabIndex)) {
          this.focusTransition('focus', 'mouseDownFocus');
          return;
        }
        break;
      case 'mouseup':
        this.p.props.onMouseUp && this.p.props.onMouseUp(e);
        this.track.buttonDown = false;
        if (this.track.state.focus && this.track.focusStartState && this.tagIsBlurable()) {
          this.focusTransition('blur', 'mouseUpBlur');
          return;
        }
        break;
      case 'click':
        this.p.props.onMouseClick && this.p.props.onMouseClick(e);
        this.p.props.onClick && this.p.props.onClick(e);
        return;
      default:
        return;
    }

    this.updateState(this.computeState(), this.p.props, e);
  }

  handleHybridMouseEvent = (e) => {
    !this.track.touchDown && Date.now() - this.track.touchEndTime > 600 && this.handleMouseEvent(e);
  }

  hasTaps() {
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
        this.p.props.onTouchStart && this.p.props.onTouchStart(e);

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
        this.p.props.onTouchEnd && this.p.props.onTouchEnd(e);
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
              this.p.props.onTap && this.p.props.onTap(e);
              this.p.props.onClick && this.p.props.onClick(e);
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
          this.p.props.onTap && this.p.props.onTap(e);
          this.p.props.onClick && this.p.props.onClick(e);
          if (this.toggleFocus('touchEnd')) return;
        }
        return;
      }
      default:
        return;
    }

    this.updateState(this.computeState(), this.p.props, e);
  }

  handleFocusEvent = (e) => {
    switch (e.type) {
      case 'focus':
        if (this.track.state.focus) return;
        if (this.track.focusTransition !== 'reset' || !this.tagIsBlurable() ||
        (detectIt.deviceType !== 'touchOnly' && Date.now() - this.track.blurTime > 600)) {
          this.p.props.onFocus && this.p.props.onFocus(e);
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

    this.updateState(this.computeState(), this.p.props, e);
  }

  render() {
    const style = objectAssign({}, this.p.props.style,
      this.p[`${this.state.iState}Style`].style,
      this.state.focus ? this.p.focusStyle.style : null);

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

    if (typeof this.p.props.as === 'string') {
      props.ref = this.refCallback;
      return React.createElement(this.p.props.as, props, this.p.props.children);
    }
    // If this.p.props.as is a component class, then wrap it in a span
    // so can attach ref without breaking encapsulation
    return React.createElement('span', { ref: this.refCallback },
      React.createElement(this.p.props.as, props, this.p.props.children)
    );
  }
}

export default ReactInteractive;
