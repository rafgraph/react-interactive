import React, { PropTypes } from 'react';
import detectIt from 'detect-it';

class ReactInteractive extends React.Component {
  static propTypes = {
    as: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.array,
    ]),
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

  handleEvent = (e) => {
    console.log(e.type);
  }

  handleHybridMouseEvent = (e) => {
    console.log(e.type);
  }

  render() {
    const { as } = this.props;
    const children = this.state.iState; // for testing purposes
    const props = this.listeners;
    return React.createElement(as, props, children);
  }
}

export default ReactInteractive;
