import * as React from 'react';
import {
  Interactive,
  InteractiveProps,
  InteractiveExtendableProps,
} from 'react-interactive';
import { BrowserRouter, Link } from 'react-router-dom';
import { styled } from './stitches.config';

// TS demos in this file:
// <DemoPropsForInteractive />
// <DemoComposeAsTagName />
// <DemoComposeAsComponent />
// <DemoComposeAsUnion />

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
  // foo: true, // should error
};

const propsForInteractiveRouterLink: InteractiveProps<typeof Link> = {
  as: Link,
  to: '/some-path', // Link specific prop
  children: 'propsForInteractiveRouterLink',
  ref: (element) => {},
  hoverStyle: { fontWeight: 'bold' },
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
    >
      Interactive-as-button
    </Interactive>
    <Interactive
      as={Link}
      to="/some-path"
      ref={(element: React.ElementRef<typeof Link> | null) => {}} // element type is not inferred, see https://github.com/kripod/react-polymorphic-types/issues/5
      hoverStyle={{ fontWeight: 'bold' }}
    >
      Interactive-as-Link
    </Interactive>
  </>
);

////////////////////////////////////
// composing as="button" with pass through props
// use type InteractiveExtendableProps

// the same props interface is used for composing with and without forwardRef
// note that InteractiveExtendableProps doesn't include `as` or `ref` props
// when using forwardRef the ref type will be added by the forwardRef function
interface ComposeAsTagNameProps extends InteractiveExtendableProps<'button'> {
  additionalProp?: string;
}

// as="button" without ref
const ComposeAsTagNameWithoutRef: React.VFC<ComposeAsTagNameProps> = ({
  additionalProp,
  ...props
}) => <Interactive {...props} as="button" />;

// as="button" with ref
const ComposeAsTagNameWithRef = React.forwardRef<
  HTMLButtonElement,
  ComposeAsTagNameProps
>(({ additionalProp, ...props }, ref) => (
  <Interactive {...props} as="button" ref={ref} />
));

// type for props with ref, use for typing props passed to ComposeAsTagNameWithRef
type ComposeAsTagNameWithRefProps = React.ComponentPropsWithRef<
  typeof ComposeAsTagNameWithRef
>;
const propsForComposeAsTagNameWithRef: ComposeAsTagNameWithRefProps = {
  additionalProp: 'something',
  children: 'propsForComposeAsTagNameWithRef',
  ref: () => {},
  type: 'submit', // button specific prop
  hoverStyle: { fontWeight: 'bold' },
};

const DemoComposeAsTagName: React.VFC = () => (
  <>
    <ComposeAsTagNameWithoutRef
      // as="button" // should error
      // ref={(element) => {}} // should error
      type="submit" // button specific prop
      hoverStyle={{ fontWeight: 'bold' }}
    >
      ComposeAsTagNameWithoutRef
    </ComposeAsTagNameWithoutRef>
    <ComposeAsTagNameWithRef
      // as="button" // should error
      ref={(element) => {}}
      type="submit" // button specific prop
      hoverStyle={{ fontWeight: 'bold' }}
    >
      ComposeAsTagNameWithRef
    </ComposeAsTagNameWithRef>
    <ComposeAsTagNameWithRef {...propsForComposeAsTagNameWithRef} />
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
// composing as={Component} with pass through props
// use type InteractiveExtendableProps

// first create a composable component to use for the `as` prop
// (or use a component from a composable library such as React Router's <Link>)
// the composable component needs to pass through props and ref using React.forwardRef
interface MyComponentProps extends React.ComponentPropsWithoutRef<'button'> {
  someMyComponentProp?: string;
}
const MyComponent = React.forwardRef<HTMLButtonElement, MyComponentProps>(
  ({ someMyComponentProp, ...props }, ref) => {
    // component logic...
    return <button {...props} ref={ref} />;
  },
);

// next create the interface for the component that wraps the <Interactive> component,
// the same props interface is used for composing with and without forwardRef
// note that InteractiveExtendableProps doesn't include `as` or `ref` props
// when using forwardRef the ref type will be added by the forwardRef function
interface ComposeAsComponentProps
  extends InteractiveExtendableProps<typeof MyComponent> {
  additionalProp?: string;
}

// as={Component} without ref
const ComposeAsComponentWithoutRef: React.VFC<ComposeAsComponentProps> = ({
  additionalProp,
  ...props
}) => <Interactive {...props} as={MyComponent} />;

// as={Component} with ref
const ComposeAsComponentWithRef = React.forwardRef<
  React.ElementRef<typeof MyComponent>,
  ComposeAsComponentProps
>(({ additionalProp, ...props }, ref) => (
  <Interactive {...props} as={MyComponent} ref={ref} />
));

// type for props with ref, use for typing props passed to ComposeAsComponentWithRef
type ComposeAsComponentWithRefProps = React.ComponentPropsWithRef<
  typeof ComposeAsComponentWithRef
>;
const propsForComposeAsComponentWithRef: ComposeAsComponentWithRefProps = {
  additionalProp: 'something',
  someMyComponentProp: 'something else',
  children: 'propsForComposeAsTagNameWithRef',
  ref: () => {},
  hoverStyle: { fontWeight: 'bold' },
};

const DemoComposeAsComponent: React.VFC = () => (
  <>
    <ComposeAsComponentWithoutRef
      additionalProp="something"
      someMyComponentProp="something else"
      // ref={(element) => {}} // should error
      hoverStyle={{ fontWeight: 'bold' }}
    >
      ComposeAsComponentWithoutRef
    </ComposeAsComponentWithoutRef>
    <ComposeAsComponentWithRef
      additionalProp="something"
      someMyComponentProp="something else"
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      ComposeAsComponentWithRef
    </ComposeAsComponentWithRef>
    <ComposeAsComponentWithRef {...propsForComposeAsComponentWithRef} />
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
// composing as a union with ref
// this example is a union of an Anchor element and React Router's <Link> component
// when an href prop is passed to the composed component, an Anchor element is rendered
// when a to prop is passed to the composed component, a <Link> component is rendered

type ComposeAsUnionProps =
  | (InteractiveExtendableProps<typeof Link> & { href?: never })
  | (InteractiveExtendableProps<'a'> & { to?: never; replace?: never });

const ComposeAsUnionWithRef = React.forwardRef<
  HTMLAnchorElement,
  ComposeAsUnionProps
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

type ComposeAsUnionWithRefProps = React.ComponentPropsWithRef<
  typeof ComposeAsUnionWithRef
>;
const propsForComposeAsUnionWithRef: ComposeAsUnionWithRefProps = {
  ref: (element) => {},
  href: 'https://rafgraph.dev',
  // to: '/some-path', // should error
  children: 'propsForComposeAsUnionWithRef',
  hoverStyle: { fontWeight: 'bold' },
};

const DemoComposeAsUnionWithRef: React.VFC = () => (
  <>
    <ComposeAsUnionWithRef
      to="/some-path"
      replace // replace is a Router Link prop
      // href="https://rafgraph.dev" // should error
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      ComposeAsUnionWithRef-RouterLink
    </ComposeAsUnionWithRef>
    <ComposeAsUnionWithRef
      disabled
      to="/some-path"
      replace // replace is a Router Link prop
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
      disabledStyle={{ opacity: 0.5 }}
    >
      ComposeAsUnionWithRef-RouterLink-disabled
    </ComposeAsUnionWithRef>
    <ComposeAsUnionWithRef
      href="https://rafgraph.dev"
      // to="/some-path" // should error b/c to is a Router Link prop
      // replace // should error b/c replace is a Router Link prop
      ref={(element) => {}}
      hoverStyle={{ fontWeight: 'bold' }}
    >
      ComposeAsUnionWithRef-AnchorLink
    </ComposeAsUnionWithRef>
    <ComposeAsUnionWithRef {...propsForComposeAsUnionWithRef} />
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
      <DemoPropsForInteractive />
      <DemoComposeAsTagName />
      <DemoComposeAsComponent />
      <DemoComposeAsUnionWithRef />
    </ContainerDiv>
  </BrowserRouter>
);
