# React Interactive

[![npm](https://img.shields.io/npm/dm/react-interactive?label=npm)](https://www.npmjs.com/package/react-interactive) [![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/react-interactive?color=purple)](https://bundlephobia.com/result?p=react-interactive) ![npm type definitions](https://img.shields.io/npm/types/react-interactive?color=blue)

- Better interactive states than CSS pseudo classes
  - `hover`, `active`, `mouseActive`, `touchActive`, `keyActive`
  - `focus`, `focusFromMouse`, `focusFromTouch`, `focusFromKey`
- Callback for interactive state changes
  - Know when the hover/active/focus state is entered/exited (impossible to do with CSS)
- Style interactive states with CSS, inline styles, and CSS-in-JS libraries
- Eliminates the [CSS sticky `:hover` bug](#css-sticky-hover-bug) on touch devices
- Allows you to only add focus styles when focus is from the keyboard

---

### [Live demo app for React Interactive](https://react-interactive.rafgraph.dev)

Code is in the [`/demo`](/demo) folder, or open the [demo in CodeSandbox](https://githubbox.com/rafgraph/react-interactive/tree/main/demo)

---

[Basics](#basics) ⚡️ [Props](#props) ⚡️ [`createInteractive`](#using-createinteractive) ⚡️ [`eventFrom`](#using-eventfrom) ⚡️ [TypeScript](#using-with-typescript) ⚡️ [FAQ](#faq)

---

## Basics

[Install](#install), [`as` prop](#polymorphic-as-prop), [Interactive state](#interactive-state), [CSS](#styling-with-css), [CSS-in-JS](#styling-with-css-in-js), [Inline styles](#styling-with-inline-styles), [Interactive state changes](#reacting-to-interactive-state-changes), [Interactive state in `children`](#using-the-interactive-state-in-children), [Extending `<Interactive>`](#extending-the-interactive-component)

---

### Install

```shell
npm install --save react-interactive
```

```js
import { Interactive } from 'react-interactive';

const App = () => <Interactive as="button">My Button</Interactive>;
```

---

### Polymorphic `as` prop

React Interactive accepts a polymorphic `as` prop that can be a string representing a DOM element (e.g. `"button"`, `"a"`, `"div"`, etc), or a React component (e.g. React Router's `Link`, etc).

```js
import { Interactive } from 'react-interactive';
import { Link } from 'react-router-dom';

const App = () => (
  <>
    <Interactive as="button">My Button</Interactive>
    <Interactive as="a" href="https://rafgraph.dev">
      My Link
    </Interactive>
    <Interactive as={Link} to="/some-page">
      My React Router Link
    </Interactive>
  </>
);
```

---

### Interactive state

The state object used by React Interactive to determine how the `<Interactive>` component is rendered. The interactive state object is also passed to the [`onStateChange`](#reacting-to-interactive-state-changes) callback and [`children`](#using-the-interactive-state-in-children) (when `children` is a function).

```ts
interface InteractiveState {
  hover: boolean;
  active: 'mouseActive' | 'touchActive' | 'keyActive' | false;
  focus: 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false;
}
```

- `hover` Mouse on the element (unlike CSS pseudo classes the `hover` state is only entered from mouse input which eliminates the [CSS sticky `:hover` bug](#css-sticky-hover-bug) on touch devices).
- `active`
  - `mouseActive` Mouse on the element and mouse button down.
  - `touchActive` Touch point on the element.
  - `keyActive` Element has focus and the enter key is down (or space bar for some elements).
- `focus`
  - `focusFromMouse` Element has focus and focus was entered from mouse input.
  - `focusFromTouch` Element has focus and focus was entered from touch input.
  - `focusFromKey` Element has focus and focus was entered from keyboard input (e.g. tab key).

---

### Styling with CSS

CSS classes for the current state are automatically added for easy styling with CSS or CSS-in-JS libraries like Styled Components, Emotion, and Stitches.

- Hover state adds a `hover` class.
- Active state adds both an `active` class and an `[input]Active` class, e.g. `mouseActive`.
- Focus state adds both a `focus` class and a `focusFrom[input]` class, e.g. `focusFromKey`.
- For a full class list see [interactive `className` props](#interactive-state-className-props-string) (the class names for each state can be changed using props).
- See [this CodeSandbox](https://codesandbox.io/s/react-interactive-css-style-example-ttl0t) for a live example using CSS.

```js
import { Interactive } from 'react-interactive';

const App = () => (
  // add a className to target the element in CSS
  <Interactive as="button" className="my-button">
    My Button
  </Interactive>
);
```

```css
/* use compound selectors in CSS to style the interactive states */
.my-button.hover, .my-button.active: {
  color: green;
}

.my-button.focusfromkey: {
  outline: 2px solid green;
}
```

---

### Styling with CSS-in-JS

Use the added CSS classes to style the interactive states with CSS-in-JS libraries like Styled Components, Emotion, and [Stitches](https://stitches.dev/). Live examples in CodeSandbox are available for [Styled Components](https://codesandbox.io/s/react-interactive-styled-components-example-7dozj) and [Stitches](https://codesandbox.io/s/react-interactive-stitches-example-os981) (also the demo app is built using Stitches).

> React Interactive includes a `createInteractive(as)` function with some predefined DOM elements, for example `Interactive.Button`, for easy use with CSS-in-JS. For more see [Extending `<Interactive>`](#extending-the-interactive-component).

```js
import { Interactive } from 'react-interactive';
import { styled } from '@stitches/react';

const StyledButton = styled(Interactive.Button, {
  '&.hover, &.active': {
    color: 'green',
  },
  '&.focusFromKey': {
    outline: '2px solid green',
  },
});

const App = () => <StyledButton>My Button</StyledButton>;
```

---

### Styling with inline styles

React Interactive uses a separate style prop for each state for easy inline styling.

- Hover state uses the `hoverStyle` prop.
- Active state uses both an `activeStyle` prop and an `[input]ActiveStyle` prop.
- Focus state uses both a `focusStyle` prop and a `focusFrom[input]Style` prop.
- For a full list see [interactive `style` props](#interactive-state-inline-style-props-style-object).
- See [this CodeSandbox](https://codesandbox.io/s/react-interactive-inline-style-example-6s8mn) for a live example using inline styles.

```js
import { Interactive } from 'react-interactive';

const hoverAndActiveStyle = {
  color: 'green',
};

const focusFromKeyStyle = {
  outline: '2px solid green',
};

const App = () => (
  <Interactive
    as="button"
    hoverStyle={hoverAndActiveStyle}
    activeStyle={hoverAndActiveStyle}
    focusFromKeyStyle={focusFromKeyStyle}
  >
    My Button
  </Interactive>
);
```

---

### Reacting to interactive state changes

React Interactive accepts an `onStateChange` prop callback that is called each time the state changes with both the current and previous states.

```js
import * as React from 'react';
import { Interactive } from 'react-interactive';

const App = () => {
  const handleInteractiveStateChange = React.useCallback(
    ({ state, prevState }) => {
      // both state and prevState are of the shape:
      // {
      //   hover: boolean,
      //   active: 'mouseActive' | 'touchActive' | 'keyActive' | false,
      //   focus: 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false,
      // }
    },
    [],
  );

  return (
    <Interactive as="button" onStateChange={handleInteractiveStateChange}>
      My Button
    </Interactive>
  );
};
```

---

### Using the interactive state in `children`

React Interactive uses the children as a function pattern to pass the current interactive state to its children.

```js
import { Interactive } from 'react-interactive';

const App = () => (
  <Interactive as="div" tabIndex={0}>
    {({ hover, active, focus }) =>
      `Current state - active: ${active}, hover: ${hover}, focus: ${focus}`
    }
  </Interactive>
);
```

---

### Extending the `<Interactive>` component

Sometimes it is useful to extend the polymorphic `<Interactive>` component with a predefined `as` prop, but without additional logic. This is especially useful when using React Interactive with CSS-in-JS libraries and other polymorphic components.

React Interactive provides a `createInteractive(as)` function that returns a fully typed `<Interactive>` component with the `as` prop predefined. Also, some common DOM elements are available using `Interactive.Tagname` (for example `Interactive.Button`). For more see [Using `createInteractive`](#using-createinteractive).

```js
// using with CSS-in-JS
import { Interactive, createInteractive } from 'react-interactive';
import { styled } from '@stitches/react';
import { Link } from 'react-router-dom';

const StyledButton = styled(Interactive.Button, {});
const StyledRouterLink = styled(createInteractive(Link), {});

const App = () => (
  <>
    <StyledButton>Interactive Button</StyledButton>
    <StyledRouterLink>Interactive Router Link</StyledRouterLink>
  </>
);
```

```js
// using with another polymorphic component
import { Interactive, createInteractive } from 'react-interactive';
import { Link } from 'react-router-dom';
import { SomePolymorphicComponent } from '...';

const InteractiveRouterLink = createInteractive(Link);

const App = () => (
  <>
    <SomePolymorphicComponent as={Interactive.Button} />
    <SomePolymorphicComponent as={InteractiveRouterLink} />
  </>
);
```

---

## Props

[`as`](#as-string--reactcomponent), [`onStateChange`](#onstatechange-function), [`children`](#children-reactnode--function), [`disabled`](#disabled-boolean), [interactive `className`](#interactive-state-className-props-string), [interactive `style`](#interactive-state-inline-style-props-style-object), [`useExtendedTouchActive`](#useextendedtouchactive-boolean), [`ref`](#ref-object-ref--callback-ref)

---

### `as`: `string` | `ReactComponent`

Default value: `"button"`

React Interactive accepts a polymorphic `as` prop that can be a string representing a DOM element (e.g. `"button`, `"a"`, `"div"`, etc), or a React component (e.g. React Router's `Link`, etc).

```js
import { Interactive } from 'react-interactive';
import { Link } from 'react-router-dom';

const App = () => (
  <>
    <Interactive as="button">My Button</Interactive>
    <Interactive as={Link} to="/some-page">
      My React Router Link
    </Interactive>
  </>
);
```

> Note that if `as` is a React component, then the component needs to pass through props to the element that it renders, including the `ref` prop using `React.forwardRef()`. Most libraries designed for composability do this by default, including React Router's `<Link>` component.

---

### `onStateChange`: `function`

Default value: `undefined`

Callback function that is called each time the interactive state changes with both the current and previous interactive states (passed in as a single argument of the form `{ state, prevState }`). See [Reacting to interactive state changes](#reacting-to-interactive-state-changes).

---

### `children`: `ReactNode` | `function`

Default value: `undefined`

If `children` is a `ReactNode` (anything that React can render, e.g. an Element, Fragment, string, boolean, null, etc) then it is passed through to React to render normally.

If `children` is a function then it is called with an object containing the current interactive state (note that the function must return a `ReactNode` that React can render). See [Using the interactive state in `children`](#using-the-interactive-state-in-children).

```js
import { Interactive } from 'react-interactive';

const App = () => (
  <Interactive as="div" tabIndex={0}>
    {({ hover, active, focus }) => {
      // hover: boolean,
      // active: 'mouseActive' | 'touchActive' | 'keyActive' | false,
      // focus: 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false,
      // ...
      // must return something that React can render
      return `Current state - active: ${active}, hover: ${hover}, focus: ${focus}`;
    }}
  </Interactive>
);
```

---

### `disabled`: `boolean`

Default value: `false`

Passing in a `disabled` prop is an easy way to temporarily disable a React Interactive component without changing the other props. When `disabled` is `true`:

- The `disabledClassName` and `disabledStyle` props will be used for styling the disabled component.
- `disabled` will be passed through to the DOM element if it is a `<button>`, `<input>`, `<select>`, or `<textarea>` (elements that support the `disabled` attribute).
- The `href` prop will not be passed through to `<a>` and `<area>` DOM elements (this disables links).
- `onClick`, `onClickCapture`, `onDoubleClick`, and `onDoubleClickCapture` props will not be passed through.
- `tabIndex` prop will not be passed through.

---

### Interactive state `className` props: `string`

Default values: see below table

CSS classes that are added to the DOM element when in an interactive state. These are merged with the standard `className` prop which is always applied. See [Styling with CSS](#styling-with-css).

| Prop                      | Default value      |
| :------------------------ | :----------------- |
| `hoverClassName`          | `"hover"`          |
| `activeClassName`         | `"active"`         |
| `mouseActiveClassName`    | `"mouseActive"`    |
| `touchActiveClassName`    | `"touchActive"`    |
| `keyActiveClassName`      | `"keyActive"`      |
| `focusClassName`          | `"focus"`          |
| `focusFromMouseClassName` | `"focusFromMouse"` |
| `focusFromTouchClassName` | `"focusFromTouch"` |
| `focusFromKeyClassName`   | `"focusFromKey"`   |
| `disabledClassName`       | `"disabled"`       |

Note that:

- `activeClassName` is added when in any active state. This is in addition to the specific `[input]ActiveClassName`.
- `focusClassName` is added when in any focus state. This is in addition to the specific `focusFrom[input]ClassName`.
- `disabledClassName` is added when the [`disabled` boolean prop](#disabled-boolean) is true, in which case none of the other interactive `className` props are applied.

---

### Interactive state inline `style` props: `style object`

Default values: `undefined`

Inline styles that are added to the DOM element when in an interactive state. These are merged with the standard `style` prop which is always applied. See [Styling with inline styles](#styling-with-inline-styles).

Inline style prop list:

- `hoverStyle`
- `activeStyle`
- `mouseActiveStyle`
- `touchActiveStyle`
- `keyActiveStyle`
- `focusStyle`
- `focusFromMouseStyle`
- `focusFromTouchStyle`
- `focusFromKeyStyle`
- `disabledStyle`

Style prop objects for each state are merged with the following precedence (last one wins):

- `style` prop (styles that are always applied)
- ===
- `hoverStyle`
- `activeStyle`
- `[input]ActiveStyle`
- `focusStyle`
- `focusFrom[input]Style`
- =OR=
- `disabledStyle` (when disabled, only the `disabledStyle` prop is merged with the `style` prop)

---

### `useExtendedTouchActive`: `boolean`

Default value: `false`

By default React Interactive only stays in the `touchActive` state while a `click` event (from the touch interaction) is still possible. To remain in the `touchActive` state for as long as the touch point is on the screen, pass in the `useExtendedTouchActive` prop. This can be useful for implementing functionality such as show on `touchActive`, long press, etc.

Note that anchor tags, `<a>`, on touch devices have their own device/browser specific behavior for long press (context/callout menu, dragging, etc). If you need to disable the native behavior for long press of links you can:

- Set a `onContextMenu` event listener and call `preventDefault()`, to prevent the context menu from appearing.
- Set `-webkit-touch-callout: none` style to prevent the iOS "context menu" from appearing (iOS doesn't support `contextmenu` events).
- Set `draggable="false"` on the `<a>` element (by passing it in as a prop).

---

### `ref`: object `ref` | callback `ref`

Default value: `undefined`

React Interactive uses `React.forwardRef()` to forward the `ref` prop to the DOM element. Passing a `ref` prop to an Interactive component will return the DOM element that the Interactive component is rendered as.

React Interactive supports both object refs created with `React.useRef()` and callback refs created with `React.useCallback()`.

---

## Using `createInteractive`

React Interactive exports a `createInteractive(as)` function that returns a fully typed `<Interactive>` component with the `as` prop predefined.

This is the same as wrapping `<Interactive>` and passing through props like `const MyWrappedInteractive = (props) => <Interactive {...props} as={SomeAs} ref={ref} />`, but by the time you add ref forwarding and typing this can become verbose, and it may be something you need to do frequently in your app. So React Interactive provides a `createInteractive` convenience function that makes extending `<Interactive>` quick and easy.

Also, some commonly used DOM elements are available using `Interactive.Tagname`, for example `Interactive.Button`, to make things even easier (they are created using `createInteractive('tagname')`).

You can use components with the `as` prop predefined with JSX (instead of using the `as` prop), or you can use them with CSS-in-JS libraries and other polymorphic components to avoid `as` prop conflicts (this is where they are most useful). For more see [Extending the `<Interactive>` component
](#extending-the-interactive-component).

```js
import { Interactive, createInteractive } from 'react-interactive';
import { Link } from 'react-router-dom';

// these are the already defined DOM elements
<Interactive.Button />
<Interactive.A href="..." />
<Interactive.Input type="..." />
<Interactive.Select />
<Interactive.Div />
<Interactive.Span />

// for other DOM elements and components use createInteractive(as)
const InteractiveNav = createInteractive('nav');
const InteractiveRouterLink = createInteractive(Link);

<InteractiveNav />
<InteractiveRouterLink to="..." />
```

---

## Using `eventFrom`

React Interactive uses [Event From](https://github.com/rafgraph/event-from) under the hood to determine if browser events are from mouse, touch or key input. The `eventFrom` and `setEventFrom` functions are re-exported from Event From and can be useful when building apps with React Interactive.

### `eventFrom(event)`

The `eventFrom(event)` function takes a browser event and returns 1 of 3 strings indicating the input type that caused the browser event: `'mouse'`, `'touch'`, or `'key'`. For example, this can be useful to determine what input type generated a `click` event.

```js
import * as React from 'react';
import { Interactive, eventFrom } from 'react-interactive';

const App = () => {
  const handleClickEvent = React.useCallback((e) => {
    switch (eventFrom(e)) {
      case 'mouse':
        // click event from mouse
        break;
      case 'touch':
        // click event from touch
        break;
      case 'key':
        // click event from key
        break;
    }
  }, []);

  return (
    <Interactive as="button" onClick={handleClickEvent}>
      My Button
    </Interactive>
  );
};
```

### `setEventFrom(inputType)`

`inputType: "mouse" | "touch" | "key"`

This is useful when manually generating events. For example, when calling `focus()` on an `<Interactive>` component and you want it to enter the `focusFromKey` state.

```js
import * as React from 'react';
import { Interactive, setEventFrom } from 'react-interactive';

const App = () => {
  const myButtonRef = React.useRef(null);

  const focusInteractiveButton = React.useCallback(() => {
    if (myButtonRef.current) {
      // so the <Interactive> component will enter the focusFromKey state
      setEventFrom('key');
      myButtonRef.current.focus();
    }
  }, []);

  return (
    <>
      <button onClick={focusInteractiveButton}>Focus "My button"</button>

      <Interactive
        as="button"
        ref={myButtonRef}
        focusFromKeyStyle={{ outline: '2px solid green' }}
      >
        My Button
      </Interactive>
    </>
  );
};
```

---

## Using with TypeScript

[Basics](#typescript-basics), [Exported `types`](#exported-types-from-react-interactive), [`onStateChange` callback and `children` as a function](#typing-onstatechange-callback-and-children-as-a-function), [Props passed to `<Interactive>`](#typing-props-passed-to-interactive), [Components that wrap `<Interactive>`](#typing-components-that-wrap-interactive)

---

### TypeScript Basics

React Interactive is fully typed, including the polymorphic `as` prop. The props that an `<Interactive>` component accepts are a union of its own props and the props that the `as` prop accepts. Live TypeScript examples are available in [TypeScriptExamples.tsx](https://github.com/rafgraph/react-interactive/blob/main/demo/src/other/TypeScriptExamples.tsx) in the demo app.

```ts
import { Interactive } from 'react-interactive';

const App = () => (
  <Interactive
    as="a" // render as an anchor link
    href="https://rafgraph.dev" // TS knows href is a string b/c as="a"
  >
    My Link
  </Interactive>
);
```

---

### Exported `types` from React Interactive

```ts
type ActiveState = 'mouseActive' | 'touchActive' | 'keyActive' | false;
type FocusState = 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false;

// type for the state object used by React Interactive
// InteractiveState is passed to children (when children is a function)
interface InteractiveState {
    hover: boolean;
    active: ActiveState;
    focus: FocusState;
}

// type used for the argument passed to the onStateChange callback
interface InteractiveStateChange {
    state: InteractiveState;
    prevState: InteractiveState;
}

// type used for props passed to an <Interactive> component, see below for usage
type InteractiveProps<T extends React.ElementType = 'button'>

// type used when wrapping/extending an <Interactive> component, see below for usage
type InteractiveExtendableProps<T extends React.ElementType = 'button'>
```

---

### Typing `onStateChange` callback and `children` as a function

Also see [TypeScriptExamples.tsx](https://github.com/rafgraph/react-interactive/blob/main/demo/src/other/TypeScriptExamples.tsx) in the demo app.

```ts
import {
  Interactive,
  InteractiveState,
  InteractiveStateChange,
} from 'react-interactive';

const App = () => {
  // use the InteractiveStateChange type to type the argument
  // passed to the onStateChange callback
  const handleInteractiveStateChange = React.useCallback(
    ({ state, prevState }: InteractiveStateChange) => {
      // ...
    },
    [],
  );

  // use the InteractiveState type to type the argument
  // passed to children (when children is a function)
  const childrenAsAFunction = React.useCallback(
    ({ hover, active, focus }: InteractiveState) => {
      // ...
    },
    [],
  );

  return (
    <Interactive as="button" onStateChange={handleInteractiveStateChange}>
      {childrenAsAFunction}
    </Interactive>
  );
};
```

---

### Typing props passed to `<Interactive>`

Sometimes you need to type the props object that is passed to an `<Interactive>` component, to do this use the type `InteractiveProps<as>`. Also see [TypeScriptExamples.tsx](https://github.com/rafgraph/react-interactive/blob/main/demo/src/other/TypeScriptExamples.tsx) in the demo app.

```ts
import { Interactive, InteractiveProps } from 'react-interactive';

// props object passed to <Interactive>
// InteractiveProps includes types for `as` and `ref`
const propsForInteractiveButton: InteractiveProps<'button'> = {
  as: 'button',
  type: 'submit', // button specific prop
  // ...
};

// for as={Component} use InteractiveProps<typeof Component>
const propsForInteractiveAsComponent: InteractiveProps<typeof Component> = {
  as: Component,
  // ...
};

const App = () => (
  <>
    <Interactive {...propsForInteractiveButton} />
    <Interactive {...propsForInteractiveAsComponent} />
  </>
);
```

---

### Typing components that wrap `<Interactive>`

When creating components that wrap an `<Interactive>` component, sometimes you want to extend the `<Interactive>` component and pass through props to `<Interactive>`. To do this use the type `InteractiveExtendableProps<as>`. Also see [TypeScriptExamples.tsx](https://github.com/rafgraph/react-interactive/blob/main/demo/src/other/TypeScriptExamples.tsx) in the demo app.

> Note that if all you need to do is extend `<Interactive>` with a predefined `as` prop but without additional props and logic, [use `createInteractive(as)`](#using-createinteractive) instead.
>
> ```ts
> import {
>   Interactive,
>   InteractiveExtendableProps,
>   createInteractive,
> } from 'react-interactive';
> import { Link } from 'react-router-dom';
>
> // this works fine, but it's not necessary
> const InteractiveLink: React.VFC<InteractiveExtendableProps<typeof Link>> = (
>   props,
> ) => <Interactive {...props} as={Link} />;
>
> // do this instead, createInteractive also includes ref forwarding
> const InteractiveLink = createInteractive(Link);
> ```

```ts
import { Interactive, InteractiveExtendableProps } from 'react-interactive';

// the same props interface is used for wrapping with and without forwardRef
// note that InteractiveExtendableProps doesn't include `as` or `ref` props,
// when using forwardRef the ref prop type will be added by the forwardRef function
interface WrapperProps extends InteractiveExtendableProps<'button'> {
  // OR extends InteractiveExtendableProps<typeof Component>
  additionalProp?: string;
}

// without ref
const WrapperWithoutRef: React.VFC<WrapperProps> = ({
  additionalProp,
  ...props
}) => {
  // your logic here
  return <Interactive {...props} as="button" />;
};

// with ref
const WrapperWithRef = React.forwardRef<
  HTMLButtonElement, // OR React.ElementRef<typeof Component>
  WrapperProps
>(({ additionalProp, ...props }, ref) => {
  // your logic here
  return <Interactive {...props} as="button" ref={ref} />;
});
```

---

## CSS sticky `:hover` bug

The CSS sticky `:hover` bug on touch devices occurs when you tap an element that has a CSS `:hover` pseudo class. The `:hover` state sticks until you tap someplace else on the screen. This causes `:hover` styles to stick on touch devices and prevents proper styling of touch interactions (like native apps).

The reason for CSS sticky hover is that back in the early days of mobile the web relied heavily on hover menus, so on mobile you could tap to see the hover menu (it would stick until you tapped someplace else). Sites are generally no longer built this way, so now the sticky hover feature has become a bug.

React Interactive fixes the sticky hover bug by only entering the `hover` state from mouse input and creating a separate `touchActive` state for styling touch interactions.

---

## FAQ

- **How do I manually set focus on an `<Interactive>` component?**
  - Pass in a `ref` prop and call `focus()` on the element (this is standard React). To enter a specific `focusFrom[Input]` state use [`setEventFrom`](#seteventfrominputtype).
- **How do I disable an `<Interactive>` component?**
  - Pass in a [`disabled` boolean prop](#disabled-boolean).
- **How do I use `<Interactive>` with another polymorphic component?**
  - Use the [`createInteractive` function](#using-createinteractive).
- **The `touchActive` state is exited even though my finger is still on the button, how do I prevent this from happening?**
  - Pass in a [`useExtendedTouchActive` boolean prop](#useextendedtouchactive-boolean).
- **Styling**
  - **How do I style the interactive states with CSS?**
    - See [Styling with CSS](#styling-with-css), and also [this CodeSandbox](https://codesandbox.io/s/react-interactive-css-style-example-ttl0t) for a live example.
  - **How do I style the interactive states with inline styles?**
    - See [Styling with inline styles](#styling-with-inline-styles), and also [this CodeSandbox](https://codesandbox.io/s/react-interactive-inline-style-example-6s8mn) for a live example.
  - **How do I use Styled Components with React Interactive?**
    - See [this CodeSandbox](https://codesandbox.io/s/react-interactive-styled-components-example-7dozj) for a live example.
  - **How do I use Stitches with React Interactive?**
    - See [this CodeSandbox](https://codesandbox.io/s/react-interactive-stitches-example-os981) for a live example.
- **TypeScript**
  - **How do I use React Interactive with TypeScript?**
    - See [Using with TypeScript](#using-with-typescript).
  - **What types are exported from React Interactive?**
    - See [Exported types from React Interactive](#exported-types-from-react-interactive).
  - **How do I extend an `<Interactive>` component including the TypeScript prop types?**
    - See [Typing components that wrap `<Interactive>`](#typing-components-that-wrap-interactive).
