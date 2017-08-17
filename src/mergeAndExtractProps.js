import React from 'react';

// extract passThroughProps, and
// if `as` is a JSX/ReactElement, then merge props with `as`'s props
export default function mergeAndExtractProps(props, knownProps) {
  const mergedProps = {};
  const passThroughProps = {};
  Object.keys(props).forEach(key => {
    mergedProps[key] = props[key];
    // pass through all props that are not on the knownProps list
    if (!knownProps[key]) passThroughProps[key] = props[key];
  });
  if (React.isValidElement(props.as)) {
    // if `as` is JSX/ReactElement, then merge in it's props
    Object.keys(props.as.props).forEach(key => {
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

  return { mergedProps, passThroughProps };
}
