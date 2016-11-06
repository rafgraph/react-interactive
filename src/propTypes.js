import { PropTypes } from 'react';
import { iStates, focusFromStates, stateProps } from './constants';

function statePropsExcept(state) {
  const statePropsCopy = {
    ...stateProps,
  };
  delete statePropsCopy[state];
  return Object.keys(statePropsCopy);
}

const iStateOptionsObjectShape = {
  style: PropTypes.object,
  className: PropTypes.string,
  onEnter: PropTypes.func,
  onLeave: PropTypes.func,
};

const focusOptionsObjectShape = {
  ...iStateOptionsObjectShape,
  focusFromTabStyle: PropTypes.object,
  focusFromMouseStyle: PropTypes.object,
  focusFromTouchStyle: PropTypes.object,
  focusFromTabClassName: PropTypes.string,
  focusFromMouseClassName: PropTypes.string,
  focusFromTouchClassName: PropTypes.string,
};

const propTypes = {
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]).isRequired,
  children: PropTypes.node,
  normal: PropTypes.oneOfType([
    PropTypes.shape(iStateOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('normal')),
  ]),
  hover: PropTypes.oneOfType([
    PropTypes.shape(iStateOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('hover')),
  ]),
  active: PropTypes.oneOfType([
    PropTypes.shape(iStateOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('active')),
  ]),
  hoverActive: PropTypes.oneOfType([
    PropTypes.shape(iStateOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('hoverActive')),
  ]),
  touchActive: PropTypes.oneOfType([
    PropTypes.shape(iStateOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('touchActive')),
  ]),
  keyActive: PropTypes.oneOfType([
    PropTypes.shape(iStateOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('keyActive')),
  ]),
  focus: PropTypes.oneOfType([
    PropTypes.shape(focusOptionsObjectShape),
    PropTypes.oneOf(statePropsExcept('focus')),
  ]),
  forceState: PropTypes.shape({
    iState: PropTypes.oneOf(Object.keys(iStates)),
    focus: PropTypes.bool,
    focusFrom: PropTypes.oneOf(Object.keys(focusFromStates)),
  }),
  initialState: PropTypes.shape({
    iState: PropTypes.oneOf(Object.keys(iStates)),
    focus: PropTypes.bool,
    focusFrom: PropTypes.oneOf(Object.keys(focusFromStates)),
  }),
  style: PropTypes.object,
  className: PropTypes.string,
  onStateChange: PropTypes.func,
  setStateCallback: PropTypes.func,
  onClick: PropTypes.func,
  onMouseClick: PropTypes.func,
  onEnterKey: PropTypes.func,
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
  refDOMNode: PropTypes.func,
  tabIndex: PropTypes.string,
  useBrowserOutlineFocus: PropTypes.bool,
  useBrowserCursor: PropTypes.bool,
  touchActiveScroll: PropTypes.bool,
  focusToggleOff: PropTypes.bool,
};

export default propTypes;
