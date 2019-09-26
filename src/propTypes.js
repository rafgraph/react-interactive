import PropTypes from 'prop-types';
import { iStates, stateProps, defaultTapTimeCutoff } from './constants';

function statePropsExcept(state) {
  const statePropsCopy = {
    ...stateProps,
  };
  delete statePropsCopy[state];
  return Object.keys(statePropsCopy);
}

const iStatesShape = {};
Object.keys(iStates).forEach(iState => {
  iStatesShape[iState] = PropTypes.bool;
});

const propTypes = {
  as: PropTypes.any.isRequired,
  children: PropTypes.node,
  normal: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('normal')),
  ]),
  hover: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('hover')),
  ]),
  active: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('active')),
  ]),
  hoverActive: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('hoverActive')),
  ]),
  touchActive: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('touchActive')),
  ]),
  keyActive: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('keyActive')),
  ]),
  focus: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('focus')),
  ]),
  focusFromTab: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('focusFromTab')),
  ]),
  focusFromTouch: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('focusFromTouch')),
  ]),
  focusFromMouse: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf(statePropsExcept('focusFromMouse')),
  ]),
  forceState: PropTypes.shape({
    iState: PropTypes.oneOf(Object.keys(iStates)),
    focus: PropTypes.oneOf([false, 'tab', 'mouse', 'touch']),
  }),
  initialState: PropTypes.shape({
    iState: PropTypes.oneOf(Object.keys(iStates)),
    focus: PropTypes.oneOf([false, 'tab', 'mouse', 'touch']),
  }),
  style: PropTypes.object,
  className: PropTypes.string,
  wrapperStyle: PropTypes.object,
  wrapperClassName: PropTypes.string,
  onStateChange: PropTypes.func,
  setStateCallback: PropTypes.func,
  onClick: PropTypes.func,
  onTapTwo: PropTypes.func,
  onTapThree: PropTypes.func,
  onTapFour: PropTypes.func,
  tapTimeCutoff: PropTypes.number,

  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
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
  touchActiveTapOnly: PropTypes.bool,
  extraTouchNoTap: PropTypes.bool,
  focusToggleOff: PropTypes.bool,
  stylePriority: PropTypes.shape(iStatesShape),
  nonContainedChild: PropTypes.bool,
  interactiveChild: PropTypes.bool,
};

const defaultProps = {
  tapTimeCutoff: defaultTapTimeCutoff,
};

export { propTypes, defaultProps };
