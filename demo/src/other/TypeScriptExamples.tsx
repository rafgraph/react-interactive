import * as React from 'react';
import {
  Interactive,
  createInteractive,
  InteractiveProps,
  InteractiveExtendableProps,
  InteractiveState,
  InteractiveStateChange,
} from 'react-interactive';
import { BrowserRouter, Link } from 'react-router-dom';
import { styled } from '../stitches.config';

////////////////////////////////////
// TS demos in this file:
//
// <DemoCreateInteractiveAs />
// <DemoOnStateChangeAndChildren />
// <DemoPropsForInteractive />
// <DemoWrapAsTagName />
// <DemoWrapAsComponent />
// <DemoWrapAsUnion />
////////////////////////////////////

////////////////////////////////////
// using createInteractive(as) to extend <Interactive>
// and predefined Interactive.Tagname components

const InteractiveNav = createInteractive('nav');
const InteractiveRouterLink = createInteractive(Link);

export const DemoCreateInteractiveAs: React.VFC = () => (
  <>
    <Interactive.Button
      // as="button" // should error
      type="submit" // button specific prop
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
      // foo // should error
    >
      Interactive.Button
    </Interactive.Button>
    <Interactive.A
      // as="a" // should error
      href="https://rafgraph.dev"
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      Interactive.A
    </Interactive.A>
    <Interactive.Div
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
      onStateChange={({ state, prevState }) => {}}
    >
      Interactive.Div
    </Interactive.Div>
    <InteractiveNav
      // as="nav" // should error
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
      onStateChange={({ state, prevState }) => {}}
    >
      InteractiveNav
    </InteractiveNav>
    <InteractiveRouterLink
      // as={Link} // should error
      to="/some-path"
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
      onStateChange={({ state, prevState }) => {}}
    >
      InteractiveRouterLink
    </InteractiveRouterLink>
  </>
);

////////////////////////////////////
// typing onStateChange and children as a function

const DemoOnStateChangeAndChildren: React.VFC = () => {
  // use the InteractiveStateChange type to type the argument
  // passed to the onStateChange callback
  const handleInteractiveStateChange = React.useCallback(
    ({ state, prevState }: InteractiveStateChange) => {
      // your logic here...
    },
    [],
  );

  // use the InteractiveState type to type the argument
  // passed to children (when children is a function)
  const childrenAsAFunction = React.useCallback(
    ({ hover, active, focus }: InteractiveState) =>
      `Current state - active: ${active}, hover: ${hover}, focus: ${focus}`,
    [],
  );

  return (
    <Interactive as="button" onStateChange={handleInteractiveStateChange}>
      {childrenAsAFunction}
    </Interactive>
  );
};

////////////////////////////////////
// typing props passed to <Interactive>
// use type InteractiveProps

// props object passed to <Interactive>, InteractiveProps includes types for `as` and `ref`
const propsForInteractiveButton: InteractiveProps<'button'> = {
  as: 'button',
  type: 'submit', // button specific prop
  children: 'propsForInteractiveButton',
  ref: (element) => {},
  hoverStyle: { fontWeight: 'bold' },
  onStateChange: ({ state, prevState }) => {},
  // foo: true, // should error
};

const propsForInteractiveRouterLink: InteractiveProps<typeof Link> = {
  as: Link,
  to: '/some-path', // Link specific prop
  children: 'propsForInteractiveRouterLink',
  ref: (element) => {},
  hoverStyle: { fontWeight: 'bold' },
  onStateChange: ({ state, prevState }) => {},
  // foo: true, // should error
};

const DemoPropsForInteractive: React.VFC = () => (
  <>
    <Interactive {...propsForInteractiveButton} />
    <Interactive {...propsForInteractiveRouterLink} />
    <Interactive
      as="button"
      type="submit" // button specific prop
      ref={(element: HTMLButtonElement | null) => {}} // element type is not inferred, see https://github.com/kripod/react-polymorphic-types/issues/5
      hoverStyle={{ fontWeight: 'bold' }}
      onStateChange={({ state, prevState }) => {}}
    >
      Interactive-as-button
    </Interactive>
    <Interactive
      as={Link}
      to="/some-path"
      ref={(element: React.ElementRef<typeof Link> | null) => {}} // element type is not inferred, see https://github.com/kripod/react-polymorphic-types/issues/5
      hoverStyle={{ fontWeight: 'bold' }}
      onStateChange={({ state, prevState }) => {}}
    >
      Interactive-as-Link
    </Interactive>
  </>
);

////////////////////////////////////
// wrapping as="button" with pass through props
// use type InteractiveExtendableProps

// the same props interface is used for wrapping with and without forwardRef
// note that InteractiveExtendableProps doesn't include `as` or `ref` props
// when using forwardRef the ref type will be added by the forwardRef function
interface WrapAsTagNameProps extends InteractiveExtendableProps<'button'> {
  additionalProp?: string;
}

// as="button" without ref
const WrapAsTagNameWithoutRef: React.VFC<WrapAsTagNameProps> = ({
  additionalProp,
  ...props
}) => {
  // component logic here...
  return <Interactive {...props} as="button" />;
};

// as="button" with ref
const WrapAsTagNameWithRef = React.forwardRef<
  HTMLButtonElement,
  WrapAsTagNameProps
>(({ additionalProp, ...props }, ref) => {
  // component logic here...
  return <Interactive {...props} as="button" ref={ref} />;
});

// type for props with ref, use for typing props passed to WrapAsTagNameWithRef
type WrapAsTagNameWithRefProps = React.ComponentPropsWithRef<
  typeof WrapAsTagNameWithRef
>;
const propsForWrapAsTagNameWithRef: WrapAsTagNameWithRefProps = {
  additionalProp: 'something',
  children: 'propsForWrapAsTagNameWithRef',
  ref: () => {},
  type: 'submit', // button specific prop
  hoverStyle: { fontWeight: 'bold' },
};

const DemoWrapAsTagName: React.VFC = () => (
  <>
    <WrapAsTagNameWithoutRef
      // as="button" // should error
      // ref={(element) => {}} // should error
      type="submit" // button specific prop
      hoverStyle={{ fontWeight: 'bold' }}
    >
      WrapAsTagNameWithoutRef
    </WrapAsTagNameWithoutRef>
    <WrapAsTagNameWithRef
      // as="button" // should error
      ref={(element) => {}}
      type="submit" // button specific prop
      hoverStyle={{ fontWeight: 'bold' }}
    >
      WrapAsTagNameWithRef
    </WrapAsTagNameWithRef>
    <WrapAsTagNameWithRef {...propsForWrapAsTagNameWithRef} />
    <Interactive
      as="button"
      // ref={(element: HTMLButtonElement | null) => {}}
      ref={{ current: null }}
      type="submit" // button specific prop
      hoverStyle={{ fontWeight: 'bold' }}
    >
      Interactive-as-button
    </Interactive>
  </>
);

////////////////////////////////////
// wrapping as={Component} with pass through props
// use type InteractiveExtendableProps

// first create a composable component to use for the `as` prop
// (or use a component from a composable library such as React Router's <Link>)
// the composable component needs to pass through props and ref using React.forwardRef
interface MyComponentProps extends React.ComponentPropsWithoutRef<'button'> {
  someMyComponentProp?: string;
}
const MyComponent = React.forwardRef<HTMLButtonElement, MyComponentProps>(
  ({ someMyComponentProp, ...props }, ref) => {
    // component logic here...
    return <button {...props} ref={ref} />;
  },
);

// next create the interface for the component that wraps the <Interactive> component,
// the same props interface is used for wrapping with and without forwardRef
// note that InteractiveExtendableProps doesn't include `as` or `ref` props
// when using forwardRef the ref type will be added by the forwardRef function
interface WrapAsComponentProps
  extends InteractiveExtendableProps<typeof MyComponent> {
  additionalProp?: string;
}

// as={Component} without ref
const WrapAsComponentWithoutRef: React.VFC<WrapAsComponentProps> = ({
  additionalProp,
  ...props
}) => {
  // component logic here...
  return <Interactive {...props} as={MyComponent} />;
};

// as={Component} with ref
const WrapAsComponentWithRef = React.forwardRef<
  React.ElementRef<typeof MyComponent>,
  WrapAsComponentProps
>(({ additionalProp, ...props }, ref) => {
  // component logic here...
  return <Interactive {...props} as={MyComponent} ref={ref} />;
});

// type for props with ref, use for typing props passed to WrapAsComponentWithRef
type WrapAsComponentWithRefProps = React.ComponentPropsWithRef<
  typeof WrapAsComponentWithRef
>;
const propsForWrapAsComponentWithRef: WrapAsComponentWithRefProps = {
  additionalProp: 'something',
  someMyComponentProp: 'something else',
  children: 'propsForWrapAsTagNameWithRef',
  ref: () => {},
  hoverStyle: { fontWeight: 'bold' },
};

const DemoWrapAsComponent: React.VFC = () => (
  <>
    <WrapAsComponentWithoutRef
      additionalProp="something"
      someMyComponentProp="something else"
      // ref={(element) => {}} // should error
      hoverStyle={{ fontWeight: 'bold' }}
    >
      WrapAsComponentWithoutRef
    </WrapAsComponentWithoutRef>
    <WrapAsComponentWithRef
      additionalProp="something"
      someMyComponentProp="something else"
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      WrapAsComponentWithRef
    </WrapAsComponentWithRef>
    <WrapAsComponentWithRef {...propsForWrapAsComponentWithRef} />
    <Interactive
      as={MyComponent}
      someMyComponentProp="something else"
      hoverStyle={{ fontWeight: 'bold' }}
      ref={(element: React.ElementRef<typeof MyComponent> | null) => {}}
    >
      Interactive-as-MyComponent
    </Interactive>
  </>
);

////////////////////////////////////
// wrapping as a union with ref
// this example is a union of an Anchor element and React Router's <Link> component
// when an href prop is passed to the component, an Anchor element is rendered
// when a to prop is passed to the component, a <Link> component is rendered

type WrapAsUnionProps =
  | (InteractiveExtendableProps<typeof Link> & { href?: never })
  | (InteractiveExtendableProps<'a'> & { to?: never; replace?: never });

const WrapAsUnionWithRef = React.forwardRef<
  HTMLAnchorElement,
  WrapAsUnionProps
>((props, ref) => {
  // React Router's <Link> component doesn't have a disabled state
  // so when disabled always render as="a" and remove router specific props
  const As = props.to && !props.disabled ? Link : 'a';
  let passThroughProps = props;
  if (props.disabled) {
    const { to, replace, ...propsWithoutRouterProps } = props;
    passThroughProps = propsWithoutRouterProps;
  }

  return <Interactive {...passThroughProps} as={As} ref={ref} />;
});

type WrapAsUnionWithRefProps = React.ComponentPropsWithRef<
  typeof WrapAsUnionWithRef
>;
const propsForWrapAsUnionWithRef: WrapAsUnionWithRefProps = {
  ref: (element) => {},
  href: 'https://rafgraph.dev',
  // to: '/some-path', // should error
  children: 'propsForWrapAsUnionWithRef',
  hoverStyle: { fontWeight: 'bold' },
};

const DemoWrapAsUnionWithRef: React.VFC = () => (
  <>
    <WrapAsUnionWithRef
      to="/some-path"
      replace // replace is a Router Link prop
      // href="https://rafgraph.dev" // should error
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      WrapAsUnionWithRef-RouterLink
    </WrapAsUnionWithRef>
    <WrapAsUnionWithRef
      disabled
      to="/some-path"
      replace // replace is a Router Link prop
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
      disabledStyle={{ opacity: 0.5 }}
    >
      WrapAsUnionWithRef-RouterLink-disabled
    </WrapAsUnionWithRef>
    <WrapAsUnionWithRef
      href="https://rafgraph.dev"
      // to="/some-path" // should error b/c to is a Router Link prop
      // replace // should error b/c replace is a Router Link prop
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      WrapAsUnionWithRef-AnchorLink
    </WrapAsUnionWithRef>
    <WrapAsUnionWithRef {...propsForWrapAsUnionWithRef} />
  </>
);

////////////////////////////////////

const ContainerDiv = styled('div', {
  '&>*': {
    display: 'block',
  },
  '&>h1': {
    fontSize: '20px',
  },
});

export const TypeScriptExamples: React.VFC = () => (
  <BrowserRouter>
    <ContainerDiv>
      <h1>TypeScript Examples</h1>
      <DemoCreateInteractiveAs />
      <DemoOnStateChangeAndChildren />
      <DemoPropsForInteractive />
      <DemoWrapAsTagName />
      <DemoWrapAsComponent />
      <DemoWrapAsUnionWithRef />
    </ContainerDiv>
  </BrowserRouter>
);
