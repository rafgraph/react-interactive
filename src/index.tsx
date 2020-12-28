import * as React from 'react';
import { eventFrom } from 'event-from';

export type ActiveState = 'mouseActive' | 'touchActive' | 'keyActive' | false;
export type FocusState =
  | 'focusFromMouse'
  | 'focusFromTouch'
  | 'focusFromKey'
  | false;

export interface InteractiveState {
  hover: boolean;
  active: ActiveState;
  focus: FocusState;
  disabled: boolean;
}

export interface InteractiveStateChange {
  state: InteractiveState;
  prevState: InteractiveState;
}

const initialState: InteractiveState = {
  hover: false,
  active: false,
  focus: false,
  disabled: false,
};

const stateChanged = ({ state, prevState }: InteractiveStateChange) =>
  state.hover !== prevState.hover ||
  state.active !== prevState.active ||
  state.focus !== prevState.focus ||
  state.disabled !== prevState.disabled;

/////////////////////////////////////////////////////////////////////
// polymorphic as prop typing adapted from:
// https://www.benmvp.com/blog/polymorphic-react-components-typescript/
// how to implement forwardRef with polymorphic typing in the Interactive component adapted from:
// https://github.com/kripod/react-polymorphic-box#forwarding-refs
/////////////////////////////////////////////////////////////////////
// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithRef on its own
export type PropsOf<
  C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>
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
export type ExtendableProps<
  ExtendedProps = Record<string, never>,
  OverrideProps = Record<string, never>
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type InheritableElementProps<
  C extends React.ElementType,
  Props = Record<string, never>
> = ExtendableProps<PropsOf<C>, Props>;

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = Record<string, never>
> = InheritableElementProps<C, Props & AsProp<C>>;
/////////////////////////////////////////////////////////////////////

interface InteractiveProps {
  // don't add 'as' prop to interface, it is provided by type AsProp as part of PolymorphicComponentProps
  // don't add children prop to interface, e.g. children?: React.ReactNode;
  // let 'as' prop type determine if children are supported/required
  onStateChange?: ({ state, prevState }: InteractiveStateChange) => void;
}

export const Interactive: <C extends React.ElementType = 'button'>(
  props: PolymorphicComponentProps<C, InteractiveProps>,
) => React.ReactElement | null = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    {
      as,
      children,
      onStateChange,
      ...restProps
    }: PolymorphicComponentProps<C, InteractiveProps>,
    ref: typeof restProps.ref,
  ) => {
    const As = as || 'button';

    const [iState, updateIState] = React.useState<InteractiveStateChange>({
      state: initialState,
      prevState: initialState,
    });

    React.useEffect(
      () => {
        if (onStateChange && stateChanged(iState)) {
          onStateChange(iState);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        iState.state.hover,
        iState.state.active,
        iState.state.focus,
        iState.state.disabled,
      ],
    );

    const handleMouseEnter = (e: React.MouseEvent<unknown, MouseEvent>) => {
      if (eventFrom(e) !== 'mouse') return;
      updateIState((previous) => ({
        state: { ...previous.state, hover: true },
        prevState: previous.state,
      }));
    };

    const handleMouseLeave = (e: React.MouseEvent<unknown, MouseEvent>) => {
      if (eventFrom(e) !== 'mouse') return;
      updateIState((previous) => ({
        state: { ...previous.state, hover: false },
        prevState: previous.state,
      }));
    };

    return (
      <As
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref}
        {...restProps}
        style={{ color: 'blue', display: 'block' }}
      >
        {children}
      </As>
    );
  },
);
