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

  render() {
    const { as, children, ...props } = this.props;
    return React.createElement(as, props, children);
  }
}

export default ReactInteractive;
