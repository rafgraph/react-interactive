# React Interactive

[Live example](http://react-interactive.rafrex.com)
- Style touch interactions in web apps to look like native apps
- Style keyboad interactions separate from mouse and touch interactions (focus from tab key, etc)
- Makes every Interactive div/span/etc accessible by default (tab index, role and key click handler added)
- Use inline styles for all interactive states - `hover`, `active`, `focus`, etc... (no style tags or CSS added to the page), or use class names if you prefer to write styles separately with CSS
- State change hook to easily incorporate the interactive state into your component (not possible with CSS)
- Separate `active` states for mouse, touch, and keyboard interactions (not possible with CSS)
- Separate `focus` states based on how it was entered - from mouse, touch, or tab key (not possible with CSS)
- Easily style and show/hide children based on the `Interactive` parent's state (only possible with complex CSS selectors)
- Built in touch device and keyboard support - a `click` event is generated on mouse click, touch tap (without delay), and enter keydown

```javascript
import Interactive from 'react-interactive';
...
<Interactive
  as="div" // what the Interactive component is rendered as, can be anything

  hover={{ color: 'green' }} // style object, can use any styles you'd like

  active={{ color: 'blue' }}
  // OR
  hoverActive={{ color: 'red' }}
  touchActive={{ color: 'blue' }}
  keyActive={{ color: 'orange' }}

  focus={{ outline: '2px solid green' }}
  // OR
  focusFromTab={{ outline: '2px solid orange' }}
  focusFromMouse={{ outline: '2px solid green' }}
  focusFromTouch={{ outline: '2px solid blue' }}

  // hook called on every state change, receives prevState and nextState objects
  onStateChange={this.handleInteractiveStateChange}
  onClick={this.handleClick}
  style={{ fontSize: '16px', padding: '3px', color: 'black' }}
>This is an interactive and focusable div</Interactive>
```

## Table of Contents
- [React Interactive](#react-interactive)
  - [Live Example](http://react-interactive.rafrex.com)
- [The Basics](#the-basics)
  - [Interactive State Machine](#interactive-state-machine)
  - [Basic Examples](#basic-examples)
  - [Installing `react-interactive`](#installing-react-interactive)
- [API](#api)
  - [API for `<Interactive />`](#api-for-interactive-)
  - [Merging Styles and Classes](#merging-styles-and-classes)
  - [`as` Prop Type](#as-prop-type)
  - [`state` Object](#state-object)
  - [Default `role` and `tabIndex`](#default-role-and-tabindex)
  - [Focus State](#focus-state)
  - [Default Styles](#default-styles)
  - [Interactive Children API](#interactive-children-api)
- [Interactive State Machine Comparison](#interactive-state-machine-comparison)
  - [React Interactive State Machine](#react-interactive-state-machine)
  - [CSS Interactive State Machine](#css-interactive-state-machine)
  - [React Interactive Advantages Over CSS](#react-interactive-advantages-over-css)
- [State Machine Notes](#state-machine-notes)
- [More Examples](#more-examples)
  - [Using Interactive's State in Parent Component](#using-interactives-state-in-parent-component)
  - [Enter or Leave a Specific State Hook](#enter-or-leave-a-specific-state-hook)
  - [Show On `hover` and `active`](#show-on-hover-and-active)
  - [Show On `hover`, `touchActive` and `focusFromTab`](#show-on-hover-touchactive-and-focusfromtab)
  - [Hot Swappable `as`](#hot-swappable-as)

## The Basics
#### Interactive State Machine
Interactive state machine as a React component. There are 5 mutually exclusive iStates, plus 3 mutually exclusive focus states that can be combined with the 5 iStates (the total number of states that RI can be in is 19, see [State Machine Notes](#state-machine-notes) below).
- The 5 mutually exclusive iStates are:
  - `normal`
  - `hover`
  - \*`hoverActive`
  - \*`touchActive`
  - \*`keyActive`
- The 3 mutually exclusive focus states are:
  - \*\*`focusFromTab`
  - \*\*`focusFromMouse`
  - \*\*`focusFromTouch`

\*The 3 separate `[type]Active` states can be treated as a single `active` state if desired. `hoverActive` (mouse on and button down), `touchActive` (touch on screen), `keyActive` (has focus and enter key down).

\*\*The 3 separate `focusFrom[Type]` states can be treated as a single `focus` state if desired.

Compared to CSS, React Interactive is a simpler state machine with better touch device and keyboard support, and state change hooks. See [comparison below](#interactive-state-machine-comparison).

#### Basic Examples
```javascript
// Interactive div with state change hook
<Interactive
  as="div"
  normal={{ color: 'black' }}
  hover={{ color: 'green' }}
  active="hover" // use the hover state style for the active state
  style={{ fontSize: '16px', padding: '3px', border: '2px dotted black' }}
  onClick={this.handleClick}
  onStateChange={this.handleInteractiveStateChange}
>This is an interactive div with state change hook</Interactive>
```
```javascript
// Interactive as a React Router Link component
import { Link } from 'react-router-dom';
...
<Interactive
  as={Link}
  to="/some/path"
  hover={{ color: 'green' }}
  active={{ color: 'blue' }}
  style={{ color: 'black', padding: '3px' }}
>This is an interactive React Router Link component</Interactive>
```
```javascript
// Interactive link with separate styles for mouse, touch, and keyboard interactions
<Interactive
  as="a"
  href="https://example.tld"
  normal={{ color: 'black' }}

  // mouse interactions: normal -> hover -> hoverActive
  hover={{ color: 'green' }}
  hoverActive={{ color: 'red' }}

  // touch interactions: normal -> touchActive
  touchActive={{ color: 'blue' }}

  // keyboard interactions: normal -> normal with focusFromTab -> keyActive with focusFromTab
  focusFromTab={{ outline: '2px solid orange' }}
  keyActive={{ color: 'orange' }}

>This is an interactive link with separate styles for each type of interaction</Interactive>
```
```javascript
// Interactive div with class names instead of styles
<Interactive
  as="div"
  hover={{ className: 'hover-class' }}
  hoverActive={{ className: 'hover-active-class' }}
  touchActive={{ className: 'touch-active-class' }}
  keyActive={{ className: 'key-active-class' }}
  // use focusFromTab to only apply the class when focus comes from the keyboard
  focusFromTab={{ className: 'tab-focus-class' }}
  className="some-class"
>This is an interactive div with classes instead of inline styles</Interactive>
```

#### Installing `react-interactive`
```shell
$ yarn add react-interactive
# OR
$ npm install --save react-interactive
```
```javascript
import Interactive from 'react-interactive';
// OR
var Interactive = require('react-interactive');
```
Or use the UMD build that's available on Unpkg (the component will be available to use as `Interactive`)
```html
<script src="https://unpkg.com/react-interactive/dist/ReactInteractive.min.js"></script>
```

## API

### API for `<Interactive />`
Note that there are no default values for any prop, and the only required prop is `as`.  
For the definition of when each state is entered, see the [state machine definition](#react-interactive-state-machine) below.

| Prop | Type | Example | Description |
|:-----|:-----|:--------|:------------|
| `as` | string (html tag name) <br /> or <br /> ReactComponent <br> or <br> JSX/ReactElement | `"div"` <br> or <br> `MyComponent` <br> or <br> `<div>...</div>` <br> `<MyComponent />` | What the Interactive component is rendered as. It can be an html tag name (as a string), or it can be a ReactComponent (RI's callbacks are passed down as props to the component), or it can be a JSX/ReactElement (see [`as` prop type](#as-prop-type) notes for more info). Note that `as` is hot-swappable on each render and RI will seamlessly maintain the current interactive state. The `as` prop is required (it is the only required prop). |
| `normal` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'black' }` <br> or <br> `{ style: { color: 'black' }, className: 'some-class' }` <br> or <br> `'hover'` | Style or options object for the `normal` state, or a string indicating a state to match. If it's an object, it can be either a `style` object or an options object with the keys `style` and `className`. The `style` object is merged with both the `style` prop and the focus state `style` (see [merging styles](#merging-styles-and-classes) for the order that styles are merged in). The `className` is a string of space separated class names and is merged as a union with the `className` prop and the focus state `className`. If the value of the `normal` prop is a string, it must indicate one of the other states, e.g. `'hover'`, and that state's `style` and `className` properties will be used for both states. |
| `hover` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'green' }` <br> or... (same as above) | Same as `normal`, but for the `hover` state. Note that if there is no `hoverActive` or `active` prop, then the `hover` prop's style and classes are used for the `hoverActive` state. This state is entered when the mouse is on the RI element. |
| `active` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `normal`, but for the `active` state. Note that the `active` state is the union of the `hoverActive`, `touchActive`, and `keyActive` states. The `active` prop is only used in place of the `[type]Active` prop if the respective `[type]Active` prop is not present. |
| `hoverActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `normal`, but for the `hoverActive` state. Note that if there is no `hoverActive` or `active` prop, then the `hover` prop's style and classes are used for the `hoverActive` state. This state is entered when the mouse is on the RI element and the mouse button is down.  |
| `touchActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'blue' }` <br> or... (same as above) | Same as `normal`, but for the `touchActive` state. This state is entered when a touch point is on the RI element.  |
| `keyActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'yellow' }` <br> or... (same as above) | Same as `normal`, but for the `keyActive` state. This state is entered when the RI element has focus and the enter key is down.  |
| `focus` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid green' }` <br> or... (same as above) | Same as `normal`, but for the `focus` state. Note that the `focus` state is the union of the `focusFromTab`, `focusFromTouch`, and `focusFromMouse` states. The `focus` prop is only used in place of the `focusFrom[Type]` prop if the respective `focusFrom[Type]` prop is not present. |
| `focusFromTab` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid green' }` <br> or... (same as above) | Same as `normal`, but for the `focusFromTab` state. This state is entered if focus is from the tab key (i.e. tabbing through the focusable elements on the page). Also, any focus calls not from a mouse or touch interaction (e.g. from assistive tech) will match with `focusFromTab`. |
| `focusFromMouse` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid red' }` <br> or... (same as above) | Same as `normal`, but for the `focusFromMouse` state. This state is entered when focus is from a mouse interaction. |
| `focusFromTouch` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid blue' }` <br> or... (same as above) | Same as `normal`, but for the `focusFromTouch` state. This state is entered when focus is from a touch interaction. |
| `style` | style object | `{ margin: '10px' }` | Styles that are always applied. Styles are merged with state styles. State styles have priority when there are conflicts. |
| `className` | string | `"some-class other-class"` | Classes that are always applied to the element, and are merged as a union with state classes. |
| `onStateChange` | function | `function({ prevState, nextState, event }) {...}` | Function called on each state change. Receives an object with `prevState`, `nextState` and `event` keys as the sole argument. `prevState` and `nextState` are [state objects](#state-object). The `event` is the event that caused the state change (a synthetic React event). |
| `setStateCallback` | function | `function({ prevState, nextState }) {...}` | Function passed in as a callback when RI calls `setState`. Receives the same object as `onStateChange` as its sole argument, except without the `event` key (`setState` is asynchronous and React events don't persist asynchronously). Use this hook if you need  to wait until the DOM is updated before executing the callback. |
| `onClick` | function | `function(event, clickType) {...}` <br><br> Where `clickType` is one of: <br> `'mouseClick'` <br> `'tapClick'` <br> `'keyClick'` | Function called for mouse clicks, touch taps with 1 touch point/finger (called without delay), enter keydown events (if the element has focus), and synthetic click events. The `event` argument will always be a `click` event (`node.click()` is called to generate a click event if needed). The `clickType` argument will always be one of `mouseClick`, `tapClick`, or `keyClick`. It will be `mouseClick` for mouse clicks and for synthetic click events on mouse only and hybrid devices. It will be `tapClick` for touch taps with 1 touch point and for synthetic click events on touch only devices. It will be `keyClick` if the click event was generated from a enter keydown event (or, for some elements, a space keyup event). Note that RI will call `node.click()` for enter keydown events only if there is an `onClick` prop. |
| `onTapTwo` | function | `function(event) {...}` | Function called for taps with 2 touch points, e.g. a 2 finger tap. Event passed in is the `touchend` event from last touch point to leave the surface. |
| `tapTimeCutoff` | whole number | `500` | Number of ms to allow for a tap. This is the cutoff time that separates a tap from a long press. This prop is not required and the default is `500`. |
| `onLongPress` | function | `function(event) {...}` | Function called on long press if touch is present after the `tapTimeCutoff` and if the touch has not moved more than is allowed for a `tap`. Event passed in is the touch start event that started the long press. |
| `touchActiveTapOnly` | boolean | `touchActiveTapOnly` | Add this prop to only remain in the `touchActive` state while a tap is possible. If the touch is moved more than the tolerance for a tap, or held on the screen longer than the time allowed for a tap, then the `touchActive` state is exited. This is useful when the intention of the `touchActive` state is to indicate to the user that they are tapping something. Note that without this prop React Interactive will remain in the `touchActive` state as long as the touch point is on the screen.
| `extraTouchNoTap` | boolean | `extraTouchNoTap` | Add this prop to cancel taps while touching someplace else on the screen. By default RI will ignore extra touches on the screen and allow taps on the RI element regardless of other touches. |
| `nonContainedChild` | boolean |   `nonContainedChild` | Add this prop if the DOM node's children are not contained inside of it on the page. For example, a child that is absolutely positioned outside of its parent. React Interactive does some quality control checks using `node.getBoundingClientRect()`, and by default the children are assumed to be within the parent's rectangle, but if this is not the case, then add this prop and the children will be checked. |
| `initialState` | state object | `{ iState: 'normal', focus: 'tab' }` | Optional initial state to enter when the component is mounted. A [state object](#state-object) with keys for one or both of `iState` and `focus`. Note that for an `active` `iState`, you must specify `[type]Active` and not just `active`. Used in the `constructor` to set `iState` and in `componentDidMount` to set `focus` (RI can't set focus until after it has a reference to the DOM node). |
| `forceState` | state object | `{ iState: 'normal', focus: false }` | Force enter this state. Same as `initialState` except not used for the initial render. Note that if only one key is present, a shallow merge is done with the current state, for example, use `{ focus: 'tab' }` to only focus the element. Only used in `componentWillReceiveProps`. |
| `stylePriority` | object | `{ hover: true, hoverActive: true }` | By default the focus state style takes precedence over the iState style when merged (except for the `keyActive` iState). Use this prop to specify specific iStates whose style should take precedence over the focus state style. Note that for an `active` `iState`, you must specify `[type]Active` and not just `active`. |
| `refDOMNode` | function | `function(node) {...}` | Function is passed in a reference to the DOM node, and is called whenever the node changes. You shouldn't need to use this for anything related to React Interactive, but it's available in case you need to use it for other things. Note that if you need to focus/blur the DOM node, use the `forceState` or `initialState` prop and set the focus state instead of calling focus/blur directly on the DOM node. |
| `focusToggleOff` | boolean | `focusToggleOff` | Add this prop to prevent focus from toggling on mouseup/tap. With this prop RI will enter the focus state normally and will remain in the focus state until the browser sends a blur event. |
| `mutableProps` | boolean | `mutableProps` | Add this prop if you are passing in mutable props so the component will always update. By default it's assumed that props passed in are immutable. A shallow compare is done, and if the props are the same, the component will not update. If you're not sure and notice buggy behavior, then add this prop. |
| `interactiveChild` | boolean | `interactiveChild` | Add this prop if Interactive's children use the [Interactive Children API](#interactive-children-api). |
| `wrapperStyle` | style object | `{ display: 'block' }` | Styles that are applied to the `span` wrapper if `as` is a ReactComponent. |
| `wrapperClassName` | string | `"ri-wrapper-class other-class"` | Classes that are applied to the `span` wrapper if `as` is a ReactComponent. |
| `...` | anything | `id="some-id"`, `tabIndex="1"`, etc... | All additional props received are passed through. |

#### Merging Styles and Classes
- Styles are merged in the following order (last one takes precedence):
  1. The `style` prop
  2. The iState style (except `keyActive`)
  3. The focus state style if in the focus state
  4. The `keyActive` state style
- If you want an iState style to take precedence over the focus style, then use the `stylePriority` prop and specify which iStates should have priority over focus, e.g. `stylePriority={{ hover: true, hoverActive: true }}`
- Classes are merged as a union without preference:
  - focus state classes if in the focus state
  - iState classes
  - The `className` prop

#### `as` Prop Type
- If `as` is a string:
  - E.g. `as="div"`
  - The string must be an html tag name, for example, `div`, `span`, `a`, `h1`, `p`, `ul`, `li`, `input`, `select`, etc...
  - Note that for SVG images, `as="svg"` works fine except that in general SVGs are not focusable by the browser, so if you need `focus` then wrap the `svg` element in a Interactive `span`. Also with SVGs you can make a specific path interactive, e.g. `as="path"` to create interactions within the SVG.
- If `as` is a ReactComponent:
  - E.g. `as={MyComponent}`
  - Strictly speaking this means that `as` is either a ReactClass or a ReactFunctionalComponent as defined in the [React Glossary](https://facebook.github.io/react/docs/glossary.html#classes-and-components).
  - In order for React Interactive to work `as` a ReactComponent, the component must pass down the props it receives from React Interactive to the top DOM node that it renders, and it cannot override any of the passed down event handlers, e.g. `onMouseEnter`. Also, the component cannot replace its top DOM node once it's rendered unless the replacement is the result of new props (note that mutations are okay, e.g. changing style, classes, children, etc is fine). This is because React Interactive keeps a reference to the component's top DOM node so it can do things like call `focus()`, and if the top DOM node is replaced without React Interactive's knowledge, then things start to break. Note that React Router's Link component meets these requirements.
  - When `as` is a ReactComponent it is wrapped in a `<span>` in order for React Interactive to maintain a reference to the top DOM node without breaking encapsulation. Without the span wrapper the only way to access the top DOM node would be through using `ReactDOM.findDOMNode(component)`, which breaks encapsulation and is discouraged, and also doesn't work with stateless functional components.
    - The `<span>` wrapper can be styled by passing down the props `wrapperClassName` (class string) and `wrapperStyle` (style object).
- If `as` is a JSX/ReactElement:
  - E.g. `as={<div>...</div>}` or `as={<MyComponent />}`
  - The props of the top ReactElement are merged with, and have priority over, Interactive's props. For example:
  ```javascript
  const jsxElement = <div hover={{ color: 'blue' }}>Some jsxElement text</div>;
  <Interactive
    as={jsxElement}
    hover={{ color: 'green' }}
    active={{ color: 'red' }}
  >Some other text</Interactive>
  ```
  - This will create a `div` with text that reads 'Some jsxElement text' and will be blue on hover and red on active. When the props are merged, `jsxElement`'s `hover` prop and `children` have priority over `Interactive`'s `hover` prop and `children`, but since `jsxElement` didn't specify an `active` prop, `Interactive`'s `active` prop is still valid.
  - After the props are merged, the JSX/ReactElement's type (html tag name or ReactComponent) determines how `as` is processed - either like a string or like a ReactComponent.
  - Note that when `as` is a ReactElement you cannot attach a `ref` to it (only the `Interactive` element is rendered and you can attach a `ref` to `Interactive` (or use the `refDOMNode` prop), but it is not possible to have two `ref`s to the same element).
  - Note that this is not a very practical example of using a JSX/ReactElement for `as`. For a more practical example see, [Hot Swappable `as`](#hot-swappable-as).

#### `state` Object
- The React Interactive state object looks like this:
```javascript
// this.state
{
  // iState is always 1 of 5 strings
  iState: 'normal' / 'hover' / 'hoverActive' / 'touchActive' / 'keyActive',
  // focus is always 1 or 4 values
  focus: false / 'tab' / 'mouse' / 'touch',
}
```
- In RI's API, the `onStateChange` and `setStateCallback` hooks receive the previous and next state objects when they are called, and the `forceState` and `initialState` props pass in a state object to the RI component.

#### Default `role` and `tabIndex`
- If you add an `onClick` prop without a `role` prop, and it's not clear what the role of the element is (i.e. it's not for user input, a link, or an area tag), then RI will automatically add `role="button"` for better accessibility. If you don't want any `role` added to the DOM element, then pass in the prop `role={null}`.
- If you add a `focus` or `onClick` prop without a `tabIndex` prop, then a `tabIndex` of `0` is added to make the element focusable by the browser. If you don't want any `tabIndex` added to the DOM element, then pass in the prop `tabIndex={null}`.
- Note that for buttons `as="button"` is discouraged because browsers are inconsistent in how they display and handle button interactions. For better consistency, use `as="div"/"span"` and add an `onClick` handler. By default RI will add `role="button"`, `tabIndex="0"`, and a key click handler (which will call `onClick`), so it will work just like a button. You can override these with your own `role` and `tabIndex` if you prefer.

#### Focus State
- The focus state can be applied to any element, not just inputs, and will toggle on click/tap unless the element is for user input.
- React Interactive's focus state is always kept in sync with the browser's focus state. Added functionality like focus toggle and `focusFrom` are implemented by controlling the browser's focus state.
- Focus toggle
  - All elements will toggle focus except if the element is for user input, that is, the element's tag name is `input`, `textarea`, or `select`.
  - For mouse interactions, the focus state is entered on mouse down, and toggled off on mouse up providing it didn't enter the focus state on the preceding mouse down.
  - For touch interactions, the focus state in entered with a 1 touch point/finger tap, and toggled off on the next 1 finger tap. Also, on touchOnly devices, a click event not preceded by a touch event (e.g. a synthetic click event) will toggle focus on/off.
  - If you want to turn off focus toggle, then add the `focusToggleOff` prop. With this prop RI will enter the focus state normally and will remain in the focus state until the browser sends a blur event.
- The focus state change occurs in the same `setState` call as the iState change, so the `onStateChange` hook is only called once. For example, `onMouseDown` enters the `focus` state and the `hoverActive` state in a single state change (and render). This achieved by controlling the browser's focus state - without this control the browser would fire the focus event immediately after the mouse down event resulting in two `setState` calls (and two `onStateChange` calls), one to enter the `hoverActive` state and one to enter the `focus` state.

#### Default Styles
- If a `focus` prop is passed to React Interactive, then RI will prevent the browser's default focus outline from being applied.
- If clicking the mouse does something, then the cursor will default to a pointer.
- If you want to use the browser default styles without any interference from RI, then add the below props:
  - `useBrowserOutlineFocus`
  - `useBrowserCursor`
- If a `touchActive` or `active` prop is passed to React Interactive, then RI will prevent the browser's default webkit tap highlight color from being applied.
  - To use the `WebkitTapHighlightColor` for styling, don't provide a `touchActive` or `active` prop and set the `WebkitTapHighlightColor` style in the main `style` prop.
  - Note that if there is no active or touchActive prop, RI will let the browser fully manage what it considers to be a click from a touch interaction. This results in a better match of when the `WebkitTapHighlightColor` is active to what results in a click. RI won't call `node.click()`, so there may be a delay in the click event in some browsers.

### Interactive Children API
 - Note that you must add the `interactiveChild` prop to `<Interactive />` to use the Interactive Children API (by default RI will not inspect its children and will render them as is).
 - If you have nested `Interactive` components, the children will be styled based on the state of their closest `Interactive` parent.

```javascript
function InteractiveChild() {
  return (
    <Interactive
      as="ul"
      interactiveChild // so Interactive will style the children based on its state
      focusFromTab={{}} // so the Interactive component is focusable
      touchActive={{}} // so Interactive will control taps and remove the browser's default style
    >
      <li>This list item will not change style based on the state of the Interactive parent.</li>

      <li
        onParentHover={{ color: 'green' }}
        onParentHoverActive="hover" // use the onParentHover style for onParentHoverActive
        onParentTouchActive={{ color: 'blue' }}
        onParentFocusFromTab={{ outline: '2px solid green' }}
      >
        This list item will change style based on the state of the Interactive parent.
      </li>

      <li
        showOnParent="hover hoverActive touchActive focusFromTab"
      >
        This list item is only rendered when the Interactive parent is in the
        hover, hoverActive, touchActive or focusFromTab states.
      </li>
    </Interactive>
  );
}
```

| Prop | Type | Example | Description |
|:-----|:-----|:--------|:------------|
| `showOnParent` | space separated string | `'hover touchActive focusFromTab'` | Add this props to only render the child when the parent is in any of the listed states. Without this prop, RI will always render the child. The acceptable state values are: `hover`, `active` (union of the 3 `[type]Active` states), `hoverActive`, `touchActive`, `keyActive`, `focus` (union of the 3 `focusFrom[Type]` states), `focusFromTab`, `focusFromMouse`, and `focusFromTouch`. List as a space separated string. |
| `onParentNormal` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'black' }` <br> or <br> `{ style: { color: 'black' }, className: 'some-class' }` <br> or <br> `'hover'` | Style or options object when the parent is in the `normal` state, or a string indicating a state to match. If it's an object, it can be either a `style` object or an options object with the keys `style` and `className`. The `style` object is merged with both the child's `style` prop and the `onParentFocusFrom[Type]` `style` in the same order as the `Interactive` parent. The `className` is a string of space separated class names and is merged as a union with the child's `className` prop and the `onParentFocusFrom[Type]` `className`. If the value of the `onParentNormal` prop is a string, it must indicate one of the other states, e.g. `'hover'` (without the onParent prefix), and that state's `onParent[State]` `style` and `className` properties will be used for both states. Note that the interface is the same as `<Interactive />`'s `normal` prop. |
| `onParentHover` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'green' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `hover` state. Note that if there is no `onParentHoverActive` or `onParentActive` prop, then the `onParentHover` prop's style and classes are used for the `onParentHoverActive` prop. |
| `onParentActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `active` state. Note that the `onParentActive` prop is only used in place of the `onParent[Type]Active` prop if the respective `onParent[Type]Active` prop is not present. |
| `onParentHoverActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `hoverActive` state. Note that if there is no `onParentHoverActive` or `onParentActive` prop, then the `onParentHover` prop's style and classes are used for the `onParentHoverActive` prop. |
| `onParentTouchActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'blue' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `touchActive` state. |
| `onParentKeyActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'yellow' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `keyActive` state. |
| `onParentFocus` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid green' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `focus` state. Note that the `onParentFocus` prop is only used in place of the `onParentFocusFrom[Type]` prop if the respective `onParentFocusFrom[Type]` prop is not present. |
| `onParentFocusFromTab` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid green' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `focusFromTab` state. |
| `onParentFocusFromMouse` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid red' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `focusFromMouse` state. |
| `onParentFocusFromTouch` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ outline: '2px solid blue' }` <br> or... (same as above) | Same as `onParentNormal`, but for the parent's `focusFromTouch` state. |

## Interactive State Machine Comparison
Compared to CSS, React Interactive is a simpler state machine, with better touch device and keyboard support, and state change hooks.
- Let's define some basic mouse, touch, and keyboard states:
  - `mouseOn`: the mouse is on the element
  - `buttonDown`: the mouse button is down while the mouse is on the element
  - `touchDown`: at least one touch point is in contact with the screen and started on the element
  - `focusKeyDown`:
    - For React Interactive, this is if:
      - The element is not a checkbox, radio, or select, and the enter key is down
      - The element is a button and the space bar or enter key is down
      - The element is a checkbox, radio, or select and the space bar is down
      - Convention is buttons are activated by both the space bar and enter key, and checkboxes, radio buttons and selects are only activated by the space bar
    - For CSS, this is something like, if the element is a button, checkbox, or radio button, and the space bar is down, then it is in the active state (i.e. the `foucsKeyDown` state for the purposes of this abstraction), but is not consistent across browsers. Note that even though the enter key triggers links and buttons, pressing the enter key won't cause an element to enter the active state, which means that with CSS there is no way to give visual feedback when triggering an element with the enter key.

### React Interactive State Machine
| Interactive state | Mouse, touch and keyboard states |
|:------------------|:---------------------------------|
| *base styles* | *Not an interactive state, always applied, everything merges with them* |
| `normal` | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` |
| `hover` | `mouseOn && !buttonDown && !touchDown && !focusKeyDown` |
| `active` | `hoverActive` OR `keyActive` OR `touchActive` |
| `hoverActive` | `mouseOn && buttonDown && !touchDown && !focusKeyDown` |
| `keyActive` | `focusKeyDown && !touchDown` |
| `touchActive` | `touchDown` |

The three `focusFrom` states can be combined with any of the above states, and the `keyActive` state is only available while in the focus state.

### CSS Interactive State Machine
Note that since a state machine can only be in one state at a time, to view interactive CSS as a state machine it has to be thought of as a combination of pseudo class selectors that match based on the mouse, keyboard and touch states.

| Interactive state | Note | Mouse, touch and keyboard states | CSS Selector(s) |
|:------------------|:-----|:---------------------------------|:----------------|
| *base styles* | *Always applied, everything merges with them* | *Not an interactive state* | *`.class`* |
| `normal` | Not commonly used in CSS (zeroing out/overriding base styles is used instead)  | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` | `.class:not(:hover):not(:active)` |
| `hover` | Only hover styles applied | `(mouseOn && !buttonDown && !focusKeyDown)` OR `(after touchDown and sticks until you tap someplace else)` - the [sticky hover CSS bug](https://github.com/rafrex/current-input#sticky-hover-problem) on touch devices | `.class:hover` |
| `hoverActive` | Both hover and active styles applied | `(mouseOn && buttonDown)` OR `(mouseOn && focusKeyDown)` OR `(touchDown, but not consistent across browsers)` | `.class:hover`, `.class:active` |
| `active` | Only active styles applied | `(buttonDown && !mouseOn currently, but had mouseOn when buttonDown started)` OR `(focusKeyDown && !mouseOn)` OR `(touchDown but not on the element currently, but not consistent across browsers)` | `.class:active` |

The focus state can be combined with any of the above CSS interactive states to double the total number of states that the CSS interactive state machine can be in.

Note that you could achieve mutually exclusive hover and active states if you apply hover styles with the `.class:hover:not(:active)` selector, and there are other states that you could generate if you wanted to using CSS selectors. You could also create a touch active state by using [Current Input](https://github.com/rafrex/current-input), so CSS has some flexibility, but it comes at the cost of simplicity, and in CSS touch and keyboard interactions are not well supported.

## State Machine Notes
- The total number of states that the React Interactive state machine can be in is 19.
- There are 5 mutually exclusive and comprehensive iStates: `normal`, `hover`, `hoverActive`, `touchActive`, and `keyActive`. These are combined with 4 mutually exclusive and comprehensive focus states: `false`, `tab`, `mouse`, and `touch`, with the exception of `keyActive`, which is only available while focus is not `false`, for a total of 19 states:

| `normal` | `hover` | `hoverActive` | `touchActive` | N/A |
|:---------|:--------|:--------------|:--------------|:----|
| `normal` with `focusFromTab` | `hover` with `focusFromTab` | `hoverActive` with `focusFromTab` | `touchActive` with `focusFromTab` | `keyActive` with `focusFromTab` |
| `normal` with `focusFromMouse` | `hover` with `focusFromMouse` | `hoverActive` with `focusFromMouse` | `touchActive` with `focusFromMouse` | `keyActive` with `focusFromMouse` |
| `normal` with `focusFromTouch` | `hover` with `focusFromTouch` | `hoverActive` with `focusFromTouch` | `touchActive` with `focusFromTouch` | `keyActive` with `focusFromTouch` |

- The `onStateChange` hook is called each time a transition occurs between any of the 19 states. Note that a transition will never occur between two `focusFrom` states as `focusFrom` is based on how the focus state was entered, so have to transition to focus `false` before transitioning to a different `focusFrom` state.
- The `active` prop is just a convenience wrapper around the 3 specific active states: `hoverActive`, `touchActive`, and `keyActive`, and is not a state in its own right.  
- The `focus` prop is just a convenience wrapper around the 3 `focusFrom` states: `tab`, `mouse` and `touch`, and is not a state in its own right.

## More Examples

#### Using Interactive's State in Parent Component
```javascript
import React from 'react';
import Interactive from 'react-interactive';

class MyComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      iState: 'normal',
      focus: false,
    };
  }

  handleOnStateChange = ({ nextState }) => {
    this.setState(nextState);
    // equivalent to the line above:
    // this.setState({
    //   iState: nextState.iState,
    //   focus: nextState.focus,
    // });
  }

  render() {
    return (
      <div>
        <Interactive
          as="div"
          onStateChange={this.handleOnStateChange}
          // ...and any other props as needed
        >RI component</Interactive>
        {
          // create your component using:
          // this.state.iState === 'normal' / 'hover' / 'hoverActive' / 'touchActive' / 'keyActive'
          // this.state.focus === false / 'tab' / 'mouse' / 'touch'
        }
      </div>
    );
  }
}
```

#### Enter or Leave a Specific State Hook
- Note that this example is written as a ReactFunctionalComponent, but the same `handleOnStateChange` logic would apply when creating a ReactClass.

```javascript
import React from 'react';
import Interactive from 'react-interactive';

function MyFunctionalComponent() {
  function enterFocus() {
    // do something when enter the focus state
  }
  function leaveFocus() {
    // do something when leave the focus state
  }
  function enterTouchActive() {
    // do something when enter the touchActive state
  }
  function leaveTouchActive() {
    // do something when leave the touchActive state
  }

  function handleOnStateChange({ prevState, nextState }) {
    !prevState.focus && nextState.focus && enterFocus();
    prevState.focus && !nextState.focus && leaveFocus();

    if (nextState.iState === 'touchActive' && prevState.iState !== nextState.iState) {
      enterTouchActive();
    } else if (prevState.iState === 'touchActive' && prevState.iState !== nextState.iState) {
      leaveTouchActive();
    }
  }

  return (
    <Interactive
      as="div"
      onStateChange={handleOnStateChange}
      // ...and any other props as needed
    >RI component</Interactive>
  );
}
```

#### Show On `hover` and `active`
- Show Div1 if the mouse is on the React Interactive element, that is, RI is in the `hover` or `hoverActive` state.
- Show Div2 if RI is in an `active` state, one of `hoverActive`, `touchActive`, or `keyActive`.
- Note that both Div1 and Div2 will be shown when RI is in the `hoverActive` state.

```javascript
import React from 'react';
import Interactive from 'react-interactive';

class MyComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      hover: false,
      active: false,
    };
  }

  handleOnStateChange = ({ nextState }) => {
    this.setState({
      // hover and hoverActive both contain hover, so check nextState for hover
      hover: /hover/.test(nextState.iState),
      // hoverActive, touchActive, and keyActive all contain Active, note the capitalization
      active: /Active/.test(nextState.iState),
    });
  }

  render() {
    return (
      <div>
        <Interactive
          as="div"
          onStateChange={this.handleOnStateChange}
          // ...and any other props as needed
        >RI element</Interactive>

        {this.state.hover && <div>Div1 shown if RI is in the hover or hoverActive state</div>}

        {this.state.active && <div>Div2 shown if RI is in one of the active states</div>}
      </div>
    );
  }
}
```

#### Show On `hover`, `touchActive` and `focusFromTab`
```javascript
import React from 'react';
import Interactive from 'react-interactive';

class MyComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      showInfo: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.showInfo !== nextState.showInfo;
  }

  handleOnStateChange = ({ nextState }) => {
    this.setState({
      showInfo:
        nextState.iState === 'hover' ||
        nextState.iState === 'touchActive' ||
        nextState.focus === 'tab'
    });
  }

  render() {
    return (
      <div>
        {this.state.showInfo && <div>Some info about something</div>}
        <Interactive
          as="div"
          onStateChange={this.handleOnStateChange}
          // ...and any other props as needed
        >Show info</Interactive>
      </div>
    );
  }
}
```

#### Hot Swappable `as`
- Hot-swap JSX/ReactElements while loading something.
- Seamlessly maintains the current interactive state while allowing for separate interactive styling of the two JSX elements.
- Note that the `onClick` prop is only present on the `clickToLoad` JSX element and not on the `currentlyLoading` element, so any clicks that come through while loading will be ignored.

```javascript
import React, { PropTypes } from 'react';
import Interactive from 'react-interactive';

class MyComponent extends React.Component {
  static propTypes = {
    load: PropTypes.func.isRequired,
  }
  constructor() {
    super();
    this.state = {
      loading: false,
    };
  }

  loadSomething = () => {
    this.setState({ loading: true });
    this.props.load(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const clickToLoad = (
      <span
        onClick={this.loadSomething}
        hover={{ color: 'green' }}
        active={{ color: 'blue' }}
        focusFromTab={{ outline: '2px solid green' }}
      >Load Something</span>
    );
    const currentlyLoading = (
      <span
        hover={{ color: 'gray' }}
        active={{ color: 'lightgray' }}
        focusFromTab={{ outline: '2px solid gray' }}
      >Loading...</span>
    );
    return (
      <Interactive
        as={this.state.loading ? currentlyLoading : clickToLoad}
        style={{ fontSize: '14px', padding: '5px' }}
        normal={{ color: 'black' }}
      />
    );
  }
}
```
