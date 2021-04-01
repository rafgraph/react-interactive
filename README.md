# React Interactive

[![npm](https://img.shields.io/npm/dm/react-interactive?label=npm)](https://www.npmjs.com/package/react-interactive) [![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/react-interactive?color=purple)](https://bundlephobia.com/result?p=react-interactive) ![npm type definitions](https://img.shields.io/npm/types/react-interactive?color=blue)

- Better interactive states than CSS pseudo classes
  - `hover`, `active`, `mouseActive`, `touchActive`, `keyActive`
  - `focus`, `focusFromMouse`, `focusFromTouch`, `focusFromKey`
- Callback for interactive state changes
  - Know when the hover/active/focus state is entered/exited (impossible to do with CSS)
- Style interactive states with CSS, inline styles, and CSS-in-JS libraries
- Eliminates the [CSS sticky hover bug](#css-sticky-hover-bug) on touch devices
- Allows you to only add focus styles when focus is from the keyboard

---

**[Live demo for React Interactive](https://react-interactive.rafgraph.dev)**, code is in the [`/demo`](/demo) folder, or [open in codesandbox](https://githubbox.com/rafgraph/react-interactive/tree/main/demo)

---

[Basics](#basics) ⚡️ [Props](#props) ⚡️ [`eventFrom`](#using-eventfrom) ⚡️ [TypeScript](#using-with-typescript)

---

## Basics

> v1 is in pre-release so use the `@next` tag to install it, v0 is available [here](https://github.com/rafgraph/react-interactive/tree/v0.9.5)

```shell
npm install --save react-interactive@next
```

```js
import { Interactive } from 'react-interactive'

...

<Interactive as="button">My Button</Interactive>
```

---

### `<Interactive>` component rendered `as`

React Interactive accepts a polymorphic `as` prop that can be a string representing a DOM element (e.g. `"button"`, `"a"`, `"div"`, etc), or a React component (e.g. React Router's `Link`, etc).

```js
import { Interactive } from 'react-interactive';
import { Link } from 'react-router-dom';

...

<Interactive as="button">My Button</Interactive>
<Interactive as="a" href="https://rafgraph.dev">My Link</Interactive>
<Interactive as={Link} to="/some-page">My React Router Link</Interactive>
```

---

### Interactive state

This is the state object used internally by React Interactive to determine how the `<Interactive>` component is rendered. The state object is also passed to the `onStateChange` callback and `children` (when `children` is a function).

```ts
interface InteractiveState {
  hover: boolean;
  active: 'mouseActive' | 'touchActive' | 'keyActive' | false;
  focus: 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false;
}
```

- `hover` Mouse on the element (unlike CSS pseudo classes the `hover` state is only entered from mouse input).
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
- For a full class list see [interactive `className` props](#interactive-state-className-props-string).

```js
import { Interactive } from 'react-interactive'

...

// add a className to target the element in CSS
<Interactive as="button" className="my-button">My Button</Interactive>
```

```css
/* use compound selectors in CSS to style the interactive states */
.my-button.hover, .my-button.active: {
  color: green;
}

.my-button.focusFromKey: {
  outline: 2px solid green;
}
```

---

### Styling with inline styles

React Interactive accepts a style prop for each state (`hover`, `mouseActive`, `touchActive`, etc), as well as `commonActiveStyle` and `commonFocusStyle` props for easy inline styling. For a full list see [interactive `style` props](#interactive-state-inline-style-props-style-object).

```js
import { Interactive } from 'react-interactive'

...

const hoverAndActiveStyle = {
  color: 'green',
}

const focusFromKeyStyle = {
  outline: '2px solid green',
}

...

<Interactive
  as="button"
  hoverStyle={hoverAndActiveStyle}
  commonActiveStyle={hoverAndActiveStyle}
  focusFromKeyStyle={focusFromKeyStyle}
>
  My Button
</Interactive>
```

---

### Reacting to interactive state changes

React Interactive accepts an `onStateChange` prop callback that is called each time the state changes with both the current and previous states.

```js
import { Interactive } from 'react-interactive'

...

const handleInteractiveStateChange = ({ state, prevState }) => {
  // both state and prevState are of the shape:
  // {
  //   hover: boolean,
  //   active: 'mouseActive' | 'touchActive' | 'keyActive' | false,
  //   focus: 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false,
  // }
}

...

<Interactive
  as="button"
  onStateChange={handleInteractiveStateChange}
>
  My Button
</Interactive>
```

---

### Styling children based on interactive state

React Interactive uses the children as a function pattern to pass the current interactive state to it's children.

```js
import { Interactive } from 'react-interactive';

...

<Interactive as="p">
  {({ hover, active, focus }) => (
    Some text where only one word is{' '}
    <span style={{ color: hover ? 'green' : undefined }}>highlighted</span>{' '}
    when the paragraph is hovered.
  )}
</Interactive>
```

---

## Props

[`as`](#as-string--reactcomponent), [`onStateChange`](#onstatechange-function), [`children`](#children-reactnode--function), [`disabled`](#disabled-boolean), [interactive `className`](#interactive-state-className-props-string), [interactive `style`](#interactive-state-inline-style-props-style-object), [`useExtendedTouchActive`](#useextendedtouchactive-boolean), [`useWebkitTapHighlightColor`](#usewebkittaphighlightcolor-boolean), [`ref`](#ref-object-ref--callback-ref)

---

### `as`: `string` | `ReactComponent`

Default value: `"button"`

React Interactive accepts a polymorphic `as` prop that can be a string representing a DOM element (e.g. `"button`, `"a"`, `"div"`, etc), or a React component (e.g. React Router's `Link`, etc).

```js
<Interactive as="button">My Button</Interactive>
<Interactive as={Link} to="/some-page">My React Router Link</Interactive>
```

Note that if `as` is a React component, then the component needs to pass through props to the element that it renders, including the `ref` prop using `React.forwardRef()`. Most libraries designed for composability do this by default, including React Router's `<Link>` component.

```js
const AsComponent = React.forwardRef((props, ref) => (
  <button {...props} ref={ref} />
))

<Interactive as={AsComponent}>My Component</Interactive>
```

---

### `onStateChange`: `function`

Default value: `undefined`

Callback function that is called each time the state changes with both the current and previous states (passed in as a single argument of the form of `{ state, prevState }`). See [Reacting to interactive state changes](#reacting-to-interactive-state-changes).

---

### `children`: `ReactNode` | `function`

Default value: `undefined`

If `children` is a `ReactNode` (anything that React can render, e.g. an Element, Fragment, string, boolean, null, etc) then it is passed through to React to render normally.

If `children` is a function then it is called with an object containing the current state of the Interactive component (note that the function must return a `ReactNode` that React can render). See [Styling children based on interactive state](#styling-children-based-on-interactive-state).

```js
<Interactive as="button">
  {({ hover, active, focus }) => {
    //   hover: boolean,
    //   active: 'mouseActive' | 'touchActive' | 'keyActive' | false,
    //   focus: 'focusFromMouse' | 'focusFromTouch' | 'focusFromKey' | false,
    ...
    // must return something that React can render
  }}
</Interactive>
```

---

### `disabled`: `boolean`

Default value: `false`

Passing in a `disabled` prop is an easy way to temporarily disable a React Interactive component without changing the other props. When `disabled` is `true`:

- The `disabledClassName` and `disabledStyle` props will be used for styling the disabled component.
- `disabled` will be passed through to the DOM element if it is a `<button>`, `<input>`, `<select>`, or `<textarea>`.
- The `href` prop will not be passed through to `<a>` and `<area>` DOM elements (this disables links).
- `onClick`, `onClickCapture`, `onDoubleClick`, and `onDoubleClickCapture` props will not be passed through.

---

### Interactive state `className` props: `string`

Default values: see below table

CSS classes that are added to the DOM element when in an interactive state. These are merged with the standard `className` prop which is always applied. See [Styling with CSS](#styling-with-css).

| Prop                      | Default value      |
| :------------------------ | :----------------- |
| `hoverClassName`          | `"hover"`          |
| `commonActiveClassName`   | `"active"`         |
| `mouseActiveClassName`    | `"mouseActive"`    |
| `touchActiveClassName`    | `"touchActive"`    |
| `keyActiveClassName`      | `"keyActive"`      |
| `commonFocusClassName`    | `"focus"`          |
| `focusFromMouseClassName` | `"focusFromMouse"` |
| `focusFromTouchClassName` | `"focusFromTouch"` |
| `focusFromKeyClassName`   | `"focusFromKey"`   |
| `disabledClassName`       | `"disabled"`       |

Note that:

- `commonActiveClassName` is added when in any active state. This is in addition to the specific `[input]ActiveClassName`.
- `commonFocusClassName` is added when in any focus state. This is in addition to the specific `focusFrom[input]ClassName`.
- `disabledClassName` is added when the [`disabled` boolean prop](#disabled-boolean) is true, in which case none of the other interactive `className` props are applied.

---

### Interactive state inline `style` props: `style object`

Default values: `undefined`

Inline styles that are added to the DOM element when in an interactive state. These are merged with the standard `style` prop which is always applied. See [Styling with inline styles](#styling-with-inline-styles).

Inline style prop list:

- `hoverStyle`
- `commonActiveStyle`
- `mouseActiveStyle`
- `touchActiveStyle`
- `keyActiveStyle`
- `commonFocusStyle`
- `focusFromMouseStyle`
- `focusFromTouchStyle`
- `focusFromKeyStyle`
- `disabledStyle`

Style prop objects for each state are merged with the following precedence (last one wins):

- `style` prop (styles that are always applied)
- ===
- `hoverStyle`
- `commonActiveStyle`
- `[input]ActiveStyle`
- `commonFocusStyle`
- `focusFrom[input]Style`
- =OR=
- `disabledStyle` (when disabled, only the `disabledStyle` prop is merged with the `style` prop)

---

### `useExtendedTouchActive`: `boolean`

Default value: `false`

By default React Interactive only stays in the `touchActive` state while a `click` event (from the touch interaction) is still possible . To remain in the `touchActive` state for as long as the touch point is on the screen then pass in a `useExtendedTouchActive` prop. This can be useful for implementing functionality such as show on `touchActive`, long press, etc.

---

### `useWebkitTapHighlightColor`: `boolean`

Default value: `false`

By default React Interactive removes browser added `WebkitTapHighlightColor` styles because it is generally better to use the `touchActive` state to style touch interactions (you have more control when using the `touchActive` state). If you want to use `WebkitTapHighlightColor` then pass in a `useWebkitTapHighlightColor` prop.

---

### `ref`: object `ref` | callback `ref`

Default value: `undefined`

React Interactive uses `React.forwardRef()` to forward the `ref` prop to the DOM element. Passing a `ref` prop to an Interactive component will return the DOM element that the Interactive component is rendered as.

React Interactive supports both object refs created with `React.useRef()` and callback refs created with `React.useCallback()`.

---

## Using `eventFrom`

React Interactive uses [Event From](https://github.com/rafgraph/event-from) under the hood to determine if browser events are from mouse, touch or key input. The `eventFrom` and `setEventFrom` functions are re-exported from Event From and can be useful when building apps with React Interactive.

### `eventFrom(event)`

The `eventFrom(event)` function takes a browser event and returns 1 of 3 strings indicating the input type that caused the browser event: `'mouse'`, `'touch'`, or `'key'`. For example, this can be useful to determine what input type generated a `click` event.

```js
import { Interactive, eventFrom } from 'react-interactive';

...

const handleClickEvent = (e) => {
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
};

...

<Interactive
  as="button"
  onClick={handleClickEvent}
>
  My Button
</Interactive>
```

### `setEventFrom(inputType)`

`inputType: "mouse" | "touch" | "key"`

This is useful when manually generating events. For example, when calling `focus()` on a React Interactive component and you want it to enter the `focusFromKey` state.

```js
import * as React from 'react';
import { Interactive, setEventFrom } from 'react-interactive';

...

const myButtonRef = React.useRef(null);

const focusButton = () => {
  if (myButtonRef.current) {
    // so the <Interactive> component will enter the focusFromKey state
    setEventFrom('key');
    myButtonRef.current.focus()
  }
}

...

<Interactive
  as="button"
  ref={myButtonRef}
  focusFromKeyStyle={{ outline: '2px solid green' }}
>
  My Button
</Interactive>
```

---

## Using with TypeScript

React Interactive is fully typed, including the polymorphic `as` prop. The props that an `<Interactive>` component accepts are a union of the props that the `as` prop accepts and the props that are specific to React Interactive.

```TS
<Interactive
  as="a" // render as an anchor link
  href="https://rafgraph.dev" // TS knows href is a string b/c as="a"
>
  My Link
</Interactive>
```

---

### Typing props passed to `<Interactive>`

Sometimes you need to type the props object that is passed to an `<Interactive>` component, to do this use the type `InteractiveProps<as>`.

```TS
import { Interactive, InteractiveProps } from 'react-interactive';

// props object passed to <Interactive>
// InteractiveProps includes types for `as` and `ref`
const propsForInteractiveButton: InteractiveProps<'button'> = {
  as: 'button',
  type: 'submit', // button specific prop
  ...
};

// for as={Component} use InteractiveProps<typeof Component>
const propsForInteractiveAsComponent: InteractiveProps<typeof Component> = {
  as: Component,
  ...
};

...

<Interactive {...propsForInteractiveButton} />
<Interactive {...propsForInteractiveAsComponent} />
```

---

### Typing components that wrap `<Interactive>`

Sometimes when creating components that wrap an `<Interactive>` component you want to extend the `<Interactive>` component and pass through props to `<Interactive>`. To do this use the type `InteractiveComposableProps<as>`.

> Note that usually it makes more sense to create a limited interface for components that wrap `<Interactive>` instead of extending the `<Interactive>` component.

#### Composing `as="button"` with pass through props

```ts
import { Interactive, InteractiveComposableProps } from 'react-interactive';

// the same props interface is used for composing with and without forwardRef
// note that InteractiveComposableProps doesn't include `as` or `ref` props
// when using forwardRef the ref type will be added by the forwardRef function
interface ComposeAsTagNameProps extends InteractiveComposableProps<'button'> {
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
```

#### Composing `as={Component}` with pass through props

```ts
import { Interactive, InteractiveComposableProps } from 'react-interactive';

// the same props interface is used for composing with and without forwardRef
// note that InteractiveComposableProps doesn't include `as` or `ref` props
// when using forwardRef the ref type will be added by the forwardRef function
interface ComposeAsComponentProps
  extends InteractiveComposableProps<typeof MyComponent> {
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
```

---

## CSS sticky hover bug

The CSS sticky hover bug on touch devices occurs when you tap something that has a CSS `:hover` state. The `:hover` state sticks until you tap someplace else on the screen. The reason for this is back in the early days of mobile, the web relied heavily on hover menus, so on mobile you could tap to see the hover menu. Sites are no longer built this way, so now the sticky hover feature has become a bug. React Interactive fixes the sticky hover bug by only entering the `hover` state from mouse input and creating a `touchActive` state for styling touch interactions.
