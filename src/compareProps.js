import React from 'react';
import { stateProps, statePropOptionKeys } from './constants';

// shallow compare of two sets of props, can be called recursivly,
// returns true if the props are the same, and false if they are not the same
export default function compareProps(propsA, propsB) {
  // If children are ReactElements, e.g. JSX as opposed to strings,
  // they will not be equal even if they are the same because React.createElement(...)
  // returns a new instance every time and is usually called on every render,
  // so unless there is a deep compare of the ReactElement tree of children,
  // it doesn't make sense to continue checking other props.
  // Note, that when nothing has changed in props,
  // the only thing that's not equal are the children, so check first.
  if (propsA.children !== propsB.children) return false;

  const keysB = Object.keys(propsB);

  // don't include forceState when comparing props
  // forceState is handled in componentWillReceiveProps
  const nextPOffset = propsB.forceState ? -1 : 0;
  const pOffset = propsA.forceState ? -1 : 0;
  if (keysB.length + nextPOffset !== Object.keys(propsA).length + pOffset)
    return false;

  // if it's an state prop options object, then shallow compare the options for equality
  const sameStateProp = stateProp => {
    // if propsB doesn't have any of the options object keys, then return false b/c not options obj
    if (!statePropOptionKeys.some(key => propsB[stateProp][key])) return false;
    // shallow compare the options for equality
    return statePropOptionKeys.every(
      key => propsB[stateProp][key] === propsA[stateProp][key],
    );
  };

  // loop through props
  for (let i = 0; i < keysB.length; i++) {
    // skip if prop is forceState
    if (keysB[i] !== 'forceState') {
      // do propsA and propsB both have the property as their own?
      if (!Object.prototype.hasOwnProperty.call(propsA, keysB[i])) return false;
      // if the two props aren't equal, do some additional checks before returning false
      if (propsB[keysB[i]] !== propsA[keysB[i]]) {
        if (keysB[i] === 'as') {
          if (
            React.isValidElement(propsA.as) &&
            React.isValidElement(propsB.as)
          ) {
            // If `as` is JSX/ReactElement, first check to see if `as.type` is the same,
            // e.g. 'div', 'span', ReactClass, ReactFunctionalComponent, and then shallowly
            // compare it's props with a recursive call to sameProps - this should only recurse
            // one time because the JSX/ReactElement shouldn't have the `as` prop.
            if (propsA.as.type !== propsB.as.type) return false;
            if (!compareProps(propsA.as.props, propsB.as.props)) return false;
          } else {
            return false;
          }
          // if the prop is a state, check one level deeper if the props are equal
        } else if (!(stateProps[keysB[i]] && sameStateProp(keysB[i]))) {
          return false;
        }
      }
    }
  }
  return true;
}
