import { InteractiveStateChange } from './index';

export const stateChanged = ({
  state,
  prevState,
}: InteractiveStateChange): boolean =>
  state.hover !== prevState.hover ||
  state.active !== prevState.active ||
  state.focus !== prevState.focus;

// elements triggered by the enter key, used to determine the keyActive state
export const enterKeyTrigger = ({
  tagName,
  type,
}: Record<string, any>): boolean =>
  tagName !== 'SELECT' &&
  (tagName !== 'INPUT' || (type !== 'checkbox' && type !== 'radio'));

// elements triggered by the space bar, used to determine the keyActive state
export const spaceKeyTrigger = ({
  tagName,
  type,
}: Record<string, any>): boolean =>
  ['BUTTON', 'SELECT'].includes(tagName) ||
  (tagName === 'INPUT' && ['checkbox', 'radio', 'submit'].includes(type));

// elements that should have cursor: pointer b/c clicking does something
export const cursorPointerElement = ({
  tagName,
  type,
}: Record<string, any>): boolean =>
  ['BUTTON', 'A', 'AREA', 'SELECT'].includes(tagName) ||
  (tagName === 'INPUT' && ['checkbox', 'radio', 'submit'].includes(type));

// used for useExtendedTouchActive which needs to set user-select: none
// to prevent the browser from selecting text on long touch
// note that it needs to be set on the body not the RI element
// because iOS will still select nearby text
export const setUserSelectOnBody = (value: 'none' | ''): void => {
  document.body.style.userSelect = value;
  document.body.style.webkitUserSelect = value;
};
