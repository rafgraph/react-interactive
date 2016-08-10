import React, { PropTypes } from 'react';

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
    }
    this.state = {
      iState: 'normal',
      focus: false,
    };
  }

  handleEvent = (e) => {
    console.log(e.type);
  }

  render() {
    const { as } = this.props;
    const children = this.state.iState; // for testing purposes
    const props = {
      onMouseEnter: this.handleEvent,
      onTouchStart: this.handleEvent,
    };
    return React.createElement(as, props, children);
  }
}

export default ReactInteractive;
