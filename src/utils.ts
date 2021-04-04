import { InteractiveStateChange } from './index';

export const stateChanged = ({
  state,
  prevState,
}: InteractiveStateChange): boolean =>
  state.hover !== prevState.hover ||
  state.active !== prevState.active ||
  state.focus !== prevState.focus;

interface ElementTagNameAndType {
  (element: { tagName?: string; type?: string }): boolean;
}

// elements triggered by the enter key, used to determine the keyActive state
export const enterKeyTrigger: ElementTagNameAndType = ({ tagName, type }) =>
  tagName !== 'SELECT' &&
  (tagName !== 'INPUT' || (type !== 'checkbox' && type !== 'radio'));

// elements triggered by the space bar, used to determine the keyActive state
export const spaceKeyTrigger: ElementTagNameAndType = ({ tagName, type }) =>
  ['BUTTON', 'SELECT'].includes(tagName as string) ||
  (tagName === 'INPUT' &&
    ['checkbox', 'radio', 'submit'].includes(type as string));

// elements that should have cursor: pointer b/c clicking does something
export const cursorPointerElement: ElementTagNameAndType = ({
  tagName,
  type,
}) =>
  ['BUTTON', 'A', 'AREA', 'SELECT'].includes(tagName as string) ||
  (tagName === 'INPUT' &&
    ['checkbox', 'radio', 'submit'].includes(type as string));

// elements that support the disabled attribute
export const elementSupportsDisabled: ElementTagNameAndType = ({ tagName }) =>
  ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName as string);

// used for useExtendedTouchActive which needs to set user-select: none
// to prevent the browser from selecting text on long touch
// note that it needs to be set on the body not the RI element
// because iOS will still select nearby text
export const setUserSelectOnBody = (value: 'none' | ''): void => {
  document.body.style.userSelect = value;
  document.body.style.webkitUserSelect = value;
};
