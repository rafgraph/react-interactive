import { statePropOptionKeys } from './constants';

// extract and return the style object and className string for the state given
export function extractStyle(props, state) {
  // if no hoverActive prop, then use hover prop for style and classes
  let stateProp =
    state === 'hoverActive' && !props.hoverActive ? 'hover' : state;
  // loop until the state prop to use is found (i.e. it's not a string)
  let times = 0;
  while (typeof stateProp === 'string' && times < 10) {
    stateProp = props[stateProp];
    times++;
  }
  // if the state prop to use wasn't found, then return a blank style and className object
  if (typeof stateProp !== 'object') return { style: null, className: '' };

  const extract = {};
  // check if the stateProp is an options object, and extract style and className from the stateProp
  if (statePropOptionKeys.some(key => stateProp[key])) {
    extract.style = stateProp.style || null;
    extract.className = stateProp.className || '';
  } else {
    // if the stateProp is not an options object, then it's a style object
    extract.style = stateProp;
    extract.className = '';
  }

  return extract;
}

export function setActiveAndFocusProps(props) {
  // use the `active` prop for `[type]Active` if no `[type]Active` prop
  if (props.active) {
    if (!props.hoverActive) props.hoverActive = props.active;
    if (!props.touchActive) props.touchActive = props.active;
    if (!props.keyActive) props.keyActive = props.active;
  }

  // use the `focus` prop for `focusFrom[type]` if no `focusFrom[type]` prop
  if (props.focus) {
    if (!props.focusFromTab) props.focusFromTab = props.focus;
    if (!props.focusFromMouse) props.focusFromMouse = props.focus;
    if (!props.focusFromTouch) props.focusFromTouch = props.focus;
  }
}

export function joinClasses(className, iStateClass, focusClass) {
  let joined = className;
  joined += joined && iStateClass ? ` ${iStateClass}` : `${iStateClass}`;
  joined += joined && focusClass ? ` ${focusClass}` : `${focusClass}`;
  return joined;
}
