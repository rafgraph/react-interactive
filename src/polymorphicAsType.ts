// polymorphic as prop typing adapted from:
// https://www.benmvp.com/blog/polymorphic-react-components-typescript/
// how to implement forwardRef with polymorphic typing in the Interactive component adapted from:
// https://github.com/kripod/react-polymorphic-box#forwarding-refs

/////////////////////////////////////////////////////////////////////
// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithRef on its own
type PropsOf<
  C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown>
> = JSX.LibraryManagedAttributes<C, React.ComponentPropsWithRef<C>>;

// rafgraph note: 'as' has to be an optional property for some reason
// if it's required then TS thinks the 'as' prop in Interactive is:
// var as: C extends React.ElementType<any> = "button"
// which results in TS error:
// Type ...(long and complex)... not assignable to type 'LibraryManagedAttributes<C, any>'
// compared to if 'as' is optional, then TS thinks the 'as' prop in Interactive is:
// var as: C | undefined
// which TS treats correctly
type AsProp<C extends React.ElementType> = {
  /**
   * An override of the default HTML tag.
   * Can also be another React component.
   */
  as?: C;
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
type ExtendableProps<ExtendedProps, OverrideProps> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
type InheritableElementProps<
  C extends React.ElementType,
  Props
> = ExtendableProps<PropsOf<C>, Props>;

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props
> = InheritableElementProps<C, Props & AsProp<C>>;
/////////////////////////////////////////////////////////////////////
