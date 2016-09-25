# React Interactive

[Live example](http://react-interactive.rafrex.com)

Interactive state machine as a React component. There are 3 mutually exclusive states, plus 1 boolean state that can be combined with any of the other 3.
- The 3 mutually exclusive states are:
  - `normal`
  - `hover`
  - `active`
- The 1 boolean state is:
  - `focus`

Additionally, the `active` state can be broken up into 3 mutually exclusive states for finer control if needed - `hoverActive` (mouse on and button down), `touchActive` (touch on screen), and `keyActive` (has focus and enter key down).

Compared to CSS, React Interactive is a simpler state machine, with better touch device and keyboard support, and on enter/leave state hooks. See [comparison below](#interactive-state-machine-comparison).

#### Basic Examples
```javascript
// Interactive and focusable div
<Interactive
  as="div"
  normal={{ color: 'black' }}
  hover={{ color: 'green' }}
  active={{ color: 'blue' }}
  focus={{ border: '2px solid yellow' }}
  style={{ fontSize: '16px', padding: '3px', border: '2px dotted black' }}
  onClick={handleClick}
>This is an interactive and focusable div</Interactive>
```
```javascript
// Interactive as a React Router Link component
import { Link } from 'react-router';
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
// Interactive link with state change hooks
<Interactive
  as="a"
  href="https://example.tld"
  hover={{
    style: { color: 'green' },
    onEnter: this.handleEnterHover,
    onLeave: this.handleLeaveHover,
  }}
  active="hover" // use the hover state style for the active state
  style={{ color: 'black', padding: '3px' }}
>This is an interactive link with hover state change hooks</Interactive>
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

  // keyboard interactions: normal -> normal with focus -> keyActive with focus
  // use focusFromTabStyle to only apply the style when focus comes from the keyboard
  focus={{ focusFromTabStyle: { outline: '2px solid yellow' }}}
  keyActive={{ color: 'yellow' }}

>Interactive link with separate styles for each type of interaction</Interactive>
```
```javascript
// Interactive div with class names instead of styles
<Interactive
  as="div"
  hover={{ className: 'hover-class' }}
  hoverActive={{ className: 'hover-active-class' }}
  touchActive={{ className: 'touch-active-class' }}
  keyActive={{ className: 'key-active-class' }}
  // use focusFromTabClassName to only apply the class when focus comes from the keyboard
  focus={{ focusFromTabClassName: 'tab-focus-class' }}
  className="some-class"
>Interactive div with different classes for hover and active states</Interactive>
```

#### Installing `react-interactive`
```shell
$ npm install react-interactive
```
```javascript
import Interactive from 'react-interactive';
```

## Table of Contents
- [React Interactive](#react-interactive)
  - [Basic Examples](#basic-examples)
  - [Installing `react-interactive`](#installing-react-interactive)
- Table of Contents <= you are here
- [API](#api)
  - [API for `<Interactive />`](#api-for-interactive-)
  - [Order That Callbacks Are Called In](#order-that-callbacks-are-called-in)
  - [Merging Styles and Classes](#merging-styles-and-classes)
  - [`as` Prop Type](#as-prop-type)
  - [`state` Object](#state-object)
  - [`focusFrom` API](#focusfrom-api)
  - [`focus` State](#focus-state)
  - [Default Styles](#default-styles)
- [Interactive State Machine Comparison](#interactive-state-machine-comparison)
  - [React Interactive State Machine](#react-interactive-state-machine)
  - [CSS Interactive State Machine](#css-interactive-state-machine)
  - [React Interactive Advantages Over CSS](#react-interactive-advantages-over-css)
- [State Machine Notes](#state-machine-notes)

## API

### API for `<Interactive />`
Note that there are no default values for any prop, and the only required prop is `as`.  
For the definition of when each state is entered, see the [state machine definition](#react-interactive-state-machine) below.

| Prop | Type | Example | Description |
|:-----|:-----|:--------|:------------|
| `as` | string (html tag name) <br /> or <br /> ReactComponent <br> or <br> JSX/ReactElement | `"div"` <br> or <br> `MyComponent` <br> or <br> `<div>...</div>` | What the Interactive component is rendered as. It can be an html tag name (as a string), or it can be a ReactComponent (Interactive's callbacks are passed down as props to the component), or it can be a JSX/ReactElement (see [`as` prop type](#as-prop-type) notes for more info). Note that `as` is hot-swappable on each render and Interactive will seamlessly maintain the current interactive state. The `as` prop is required (it is the only required prop). |
| `normal` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'black' }` <br> or <br> `{ style: { color: 'black' }, className: 'some-clase', onEnter: function(state){...}, onLeave: function(state){...}, }` <br> or <br> `'hover'` | Style or options object for the `normal` state, or a string indicating a state to match. If it's an object, it can be either a style object or an options object with any of these four keys: `style`, `className`, `onEnter`, `onLeave`. The `style` object is merged with both the `style` prop and the focus state `style` (see [merging styles](#merging-styles-and-classes) for the order that styles are merged in). The `className` is a string of space separated class names and is merged as a union with the `className` prop and the focus state `className`. The `onEnter` and `onLeave` functions are called when transitioning to and from the state, respectively, and receive the state as a string, `'normal'`, as their only argument. If the value of the `normal` prop is a string, it must indicate one of the other states, e.g. `'hover'`, and that state's `style` and `className` properties will be used for both states (note that the callbacks are only used for the state they are defined on). |
| `hover` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'green' }` <br> or... (same as above) | Same as `normal`, but for the `hover` state. Note that `hover`'s `onEnter` and `onLeave` hooks are only called when transitioning in and out of a non-hover state, and are not called when transitioning between the `hover` and `hoverActive` states. While this breaks the strict enter/leave state hooks pattern, it makes the `hover` enter/leave hooks more useful by calling them when the mouse transitions on and off the element. If you need to hook into the transition between `hover` and `hoverActive`, then use the `hoverActive` enter/leave hooks or `onStateChange`. Also note that if there is no `hoverActive` or `active` prop, then the `hover` prop's style and classes are used for the `hoverActive` state. |
| `active` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `normal`, but for the `active` state. Note that the `active` state is the union of the `hoverActive`, `touchActive`, and `keyActive` states. The `active` prop is only used in place of the `[type]Active` prop if the respective `[type]Active` prop is not present. |
| `hoverActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `normal`, but for the `hoverActive` state. Note that if there is no `hoverActive` or `active` prop, then the `hover` prop's style and classes are used for the `hoverActive` state. |
| `touchActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'blue' }` <br> or... (same as above) | Same as `normal`, but for the `touchActive` state. |
| `keyActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'yellow' }` <br> or... (same as above) | Same as `normal`, but for the `keyActive` state. |
| `focus` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ border: '2px dotted green' }` <br> or... (same as above), <br> or see the [`focusFrom` API](#focusfrom-api) for additional options | Same as `normal`, but for the `focus` state, or see the [`focusFrom` API](#focusfrom-api) for additional options. The focus state can be applied to any element, not just inputs, and will toggle on click/tap unless the element is for user input. |
| `style` | style object | `{ margin: '10px' }` | Styles that are always applied. Styles are merged with state styles. State styles have priority when there are conflicts. |
| `className` | string | `"some-class other-class"` | Classes that are always applied to the element, and are merged as a union with state classes. |
| `onStateChange` | function | `function({ prevState, nextState, event }) {...}` | Function called on each state change. Receives an object with `prevState`, `nextState` and `event` keys as the sole argument. `prevState` and `nextState` are [state objects](#state-object). The `event` is the event that caused the state change (a synthetic React event). `onStateChange` will be called immediately before the `onEnter` and `onLeave` callbacks for each state. |
| `setStateCallback` | function | `function({ prevState, nextState }) {...}` | Function passed in as a callback to `setState`. Receives the same object as `onStateChange` as its sole argument, except without the `event` key (`setState` is asynchronous and React events don't persist asynchronously). Use this hook if you need  to wait until the DOM is updated before executing the callback. |
| `forceState` | state object | `{ iState: 'normal', focus: false, focusFrom: undefined }` | Force enter this state. A [state object](#state-object) with keys for one or both of `iState` and `focus`, as well as `focusFrom` if focus is true (defaults to `'tab'` if not provided). If only one key is present, a shallow merge is done with the current state, for example, use `{ focus: true }` to only focus the element. Note that for an `active` `iState`, you must specify `[type]Active` and not just `active`. Note that `forceState` is not used for the initial render (it is only used in `componentWillReceiveProps`). |
| `initialState` | state object | `{ iState: 'normal', focus: true, focusFrom: 'tab' }` | Optional initial state to enter when the component is created. Same as `forceState` except used in the `constructor` to set `iState` and in `componentDidMount` to set `focus` (RI can't set focus until after it has a reference to the DOM node). |
| `onClick` | function | `function(event) {...}` | Function called for mouse clicks, taps with 1 touch point/finger (called without any delay), synthetic click events, and enter keydown events (if the element has focus). Event passed in is a `click` event, a `touchend` event, or a `keydown` event. |
| `onMouseClick` | function | `function(event) {...}` | Function called for mouse clicks, and on mouseOnly and hybrid devices for synthetic click events. Not called for click events generated from touches. Event passed in is a `click` event. Note that `onMouseClick`, `onEnterKey`, and `onTap` are mutually exclusive and comprehensive for `onClick`, i.e. one and only one will be called every time `onClick` is called. |
| `onEnterKey` | function | `function(event) {...}` | Function called for enter keydown events (the element has to have focus to register keyboard events). Event passed in is a `keydown` event. Note that `onMouseClick`, `onEnterKey`, and `onTap` are mutually exclusive and comprehensive for `onClick`, i.e. one and only one will be called every time `onClick` is called. |
| `onTap` | function | `function(event) {...}` | Function called for touch taps with 1 touch point, and on touchOnly devices for synthetic click events (e.g. a click event fired by assistive tech). Event passed in is a `touchend` event, or a `click` event. Note that `onMouseClick`, `onEnterKey`, and `onTap` are mutually exclusive and comprehensive for `onClick`, i.e. one and only one will be called every time `onClick` is called. |
| `onTapTwo` | function | `function(event) {...}` | Function called for taps with 2 touch points, e.g. a 2 finger tap. Event passed in is the `touchend` event from last touch point to leave the surface. |
| `refDOMNode` | function | `function(node) {...}` | Function is passed in a reference to the DOM node, and is called whenever the node changes. You shouldn't need to use this for anything related to React Interactive, but it's available in case you need to use it for other things. Note that if you need to focus/blur the DOM node, use the `forceState` or `initialState` prop and set the focus to true/false instead of calling focus/blur directly on the DOM node. |
| `mutableProps` |  | `mutableProps` | By default it's assumed that props passed in are immutable. A shallow compare is done, and if the props are the same, the component will not update. If you are passing in mutable props, add the `mutableProps` prop, and the component will always update. If you're not sure and notice buggy behavior, then add this property. |
| `...` | anything | `id="some-id"`, `tabIndex="1"`, etc... | All additional props received are passed through. |

#### Order That Callbacks Are Called In
1. Event callbacks are called first:
  1. `onMouseClick`, `onTap`, or `onEnterKey` (mutually exclusive)
  * `onClick`
* `onStateChange`
* `onLeave` and `onEnter` state hooks
* `setStateCallback` is passed in as a callback to `setState`, and is called after `setState` finishes

Note that if you pass in other event handlers, e.g. `onMouseDown`, `onTouchEnd`, etc..., they will be called before React Interactive changes its state and calls any of its callbacks.

#### Merging Styles and Classes
- Styles are merged in the following order (last one takes precedence):
  1. The `style` prop
  2. `normal` iState style if in the `normal` state
  3. `focus` state style if in the `focus` state
  4. `hover` or `active` iState style if not in the `normal` state
- Classes are merged as a union without preference:
  - `focus` state classes if in the focus state
  - iState classes (`normal`, `hover`, or `active`)
  - The `className` prop

#### `as` Prop Type
- If `as` is a string:
  - `as="div"`
  - The string must be an html tag name, for example, `div`, `span`, `a`, `h1`, `p`, `ul`, `li`, `input`, `select`, `button`, etc...
- If `as` is a ReactComponent:
  - `as={MyComponent}`
  - Strictly speaking this means that `as` is either a ReactClass or a ReactFunctionalComponent as defined in the [React Glossary](https://facebook.github.io/react/docs/glossary.html#classes-and-components).
  - In order for React Interactive to work `as` a ReactComponent, the component must pass down the props it receives from React Interactive to the top DOM node that it renders, and it cannot override any of the passed down event handlers, e.g. `onMouseEnter`. Also, the component cannot replace its top DOM node once it's rendered unless the replacement is the result of new props (note that mutations are okay, e.g. changing style, classes, children, etc is fine). This is because React Interactive keeps a reference to the component's top DOM node so it can do things like call `focus()`, and if the top DOM node is replaced without React Interactive's knowledge, then things start to break. Note that React Router's Link component meets these requirements.
  - When `as` is a ReactComponent it is wrapped in a `<span>` in order for React Interactive to maintain a reference to the top DOM node without breaking encapsulation. Without the span wrapper the only way to access the top DOM node would be through using `ReactDOM.findDOMNode(component)`, which breaks encapsulation and is discouraged, and also doesn't work with stateless functional components.
- If `as` is a JSX/ReactElement:
  - `as={<div>...</div>}` or `as={<MyComponent />}`
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

#### `state` Object
- The React Interactive state object looks like this:
```javascript
// this.state
{
  // iState is always 1 of 5 strings
  iState: 'normal' / 'hover' / 'hoverActive' / 'touchActive' / 'keyActive',
  // focus is always a boolean
  focus: true / false,
  // focusFrom is undefined if focus is false, otherwise it's 1 of 3 strings
  focusFrom: undefined / 'tab' / 'mouse' / 'touch',
}
```
- In Interactive's API, the `forceState` and `initialState` props pass in a state object to the Interactive component, and the `onStateChange` and `setStateCallback` hooks receive the previous and next state objects when they are called.

#### `focusFrom` API
- The `focusFrom` API allows for separate styles and class names based on how the `focus` state is entered (tab key, mouse, or touch).
- The API is accessed in the `focus` prop options object by adding keys for  `focusFrom[input]Style`, and `focusFrom[input]ClassName`.
  - `focusFromTabStyle`, `focusFromTabClassName`: use this `style` and `className` for the `focus` state if focus is from the tab key (i.e. tabbing through the focusable elements on the page). Also, any focus calls not from a mouse or touch interaction (e.g. from assistive tech) will match with `focusFromTab`.
  - `focusFromMouseStyle`, `focusFromMouseClassName`: use this `style` and `className` for the `focus` state when focus is from a mouse interaction.
  - `focusFromTouchStyle`, `focusFromTouchClassName`: use this `style` and `className` for the `focus` state when focus is from a touch interaction.
- There is also a `focusFromOnly` option that when set to `'tab'` only lets the element enter the focus state when not the result of a mouse or touch interaction, usually by tabbing through the focusable elements on the page, but any non-mouse/touch focus call will enter the focus state when using `focusFromOnly: 'tab'`. Note that preventing the browser from entering the focus state will make the element not draggable in some browsers, and may have other browser specific side effects (using `focusFrom` to determine style and class names is a safer option).
- `focus` options object with the complete `focusFrom` API:
```javascript
  <Interactive
    as="div"
    focus={{
      // style to use for the focus state when focus is from the keyboard (i.e. the tab key)
      focusFromTabStyle: { outline: '2px solid yellow' },
      // style to use for the focus state when focus is from a mouse interaction
      focusFromMouseStyle: { outline: '2px solid green' },
      // style to use for the focus state when focus is from a touch interaction
      focusFromTouchStyle: { outline: '2px solid blue' },

      // when `focusFrom[input]Style` is not present for an input type,
      // the `style` key will be used instead, for example:
      // style: { outline: '2px solid yellow' },
      // but since all 3 focusFrom styles are present in this example, the style key does nothing

      // same as style, but for class names (as a space separated string)
      focusFromTabClassName: 'tab-focus-class',
      focusFromMouseClassName: 'mouse-focus-class',
      focusFromTouchClassName: 'touch-focus-class',

      // only enter the focus state when focus comes from the keyboard (i.e. the tab key)
      focusFromOnly: 'tab', // only need to add the key if the value is 'tab'

      // enter/leave state hooks receive the string 'focus' (the state) as the first
      // argument, and focusFrom ('tab', 'mouse', or 'touch') as the second argument
      onEnter: function(state, focusFrom) {...},
      onLeave:  function(state, focusFrom) {...},
    }}
  >Interactive div with separate focus from styles</Interactive>
```

#### `focus` State
- React Interactive's focus state is always kept in sync with the browser's focus state. Added functionality like focus toggle and `focusFromOnly` are implemented by controlling the browser's focus state.
- Focus toggle
  - All elements will toggle focus except if the element if for user input, that is, the element's tag name is `input`, `textarea`, `button`, or `select`.
  - For mouse interactions, the focus state is entered on mouse down, and toggled off on mouse up providing it didn't enter the focus state on the preceding mouse down.
  - For touch interactions, the focus state in entered with a 1 touch point/finger tap, and toggled off on the next 1 finger tap. Also, on touchOnly devices, a click event not preceded by a touch event (e.g. a synthetic click event) will toggle focus on/off.
- If you add a `focus` prop without a `tabIndex` prop, then a `tabIndex` of `0` is added to make the element focusable by the browser. If you don't want any `tabIndex` added to the DOM element, then pass in the prop `tabIndex={null}`.
- The focus state change occurs in the same `setState` call as the iState change, so the `onStateChange` hook is only called once. For example, `onMouseDown` enters the `focus` state and the `hoverActive` state in a single state change (and render). This achieved by controlling the browser's focus state - without this control the browser would fire the focus event immediately after the mouse down event resulting in two `setState` calls (and two `onStateChange` calls), one to enter the `hoverActive` state and one to enter the `focus` state.

#### Default Styles
- If a `focus` state style is passed to React Interactive, then RI will prevent the browser's default focus outline from being applied.
- If a `touchActive` or `active` state style is passed to React Interactive, then RI will prevent the browser's default webkit tap highlight color from being applied.
- If clicking the mouse does something, then the cursor will default to a pointer.
- If you want to use the browser default styles without any interference from RI, then add the below props:
  - `useBrowserOutlineFocus`
  - `useBrowserWebkitTapHighlightColor`
  - `useBrowserCursor`

## Interactive State Machine Comparison
Compared to CSS, React Interactive is a simpler state machine, with better touch device and keyboard support, and on enter/leave state hooks.
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
| `active` | `hoverActive` &#124;&#124; `keyActive` &#124;&#124; `touchActive` |
| `hoverActive` | `mouseOn && buttonDown && !touchDown && !focusKeyDown` |
| `keyActive` | `focusKeyDown && !touchDown` |
| `touchActive` | `touchDown` |
The focus state boolean can be combined with any of the above states, and the `keyActive` state is only available while in the `focus` state.

### CSS Interactive State Machine
Note that since a state machine can only be in one state at a time, to view interactive CSS as a state machine it has to be thought of as a combination of pseudo class selectors that match based on the mouse, keyboard and touch states.

| Interactive state | Note | Mouse, touch and keyboard states | CSS Selector(s) |
|:------------------|:-----|:---------------------------------|:----------------|
| *base styles* | *Always applied, everything merges with them* | *Not an interactive state* | *`.class`* |
| `normal` | Not commonly used in CSS (zeroing out/overriding base styles is used instead)  | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` | `.class:not(:hover):not(:active)` |
| `hover` | Only hover styles applied | `(mouseOn && !buttonDown && !focusKeyDown)` &#124;&#124; `(after touchDown and sticks until you tap someplace else)` - the [sticky hover CSS bug](https://github.com/rafrex/current-input#sticky-hover-problem) on touch devices | `.class:hover` |
| `hoverActive` | Both hover and active styles applied | `(mouseOn && buttonDown)` &#124;&#124; `(mouseOn && focusKeyDown)` &#124;&#124; `(touchDown, but not consistent across browsers)` | `.class:hover`, `.class:active` |
| `active` | Only active styles applied | `(buttonDown && !mouseOn currently, but had mouseOn when buttonDown started)` &#124;&#124; `(focusKeyDown && !mouseOn)` &#124;&#124; `(touchDown but not on the element currently, but not consistent across browsers)` | `.class:active` |

The focus state can be combined with any of the above CSS interactive states to double the total number of states that the CSS interactive state machine can be in.

Note that you could achieve mutually exclusive hover and active states if you apply hover styles with the `.class:hover:not(:active)` selector, and there are other states that you could generate if you wanted to using CSS selectors. You could also create a touch active state by using [Current Input](https://github.com/rafrex/current-input), so CSS has some flexibility, but it comes at the cost of simplicity, and in CSS touch and keyboard interactions are not well supported.

#### React Interactive Advantages Over CSS
- A simpler state machine (CSS selectors make for messy state machines)
- Enter/leave state hooks
- Separate active states for each type of interaction - `hoverActive`, `touchActive`, and `keyActive`
- Separate styles for the focus state based on how it was entered (see the [`focusFrom` API](#focusfrom-api)) - `focusFromTab`, `focusFromMouse`, and `focusFromTouch`
- `focusFromOnly` option to only enter the focus state when focus comes from the keyboard
- Toggle focus on click/tap (unless the element is for user input)
- Click, tap, and enter key triggers for the `onClick` handler

## State Machine Notes
- The total number of states that the React Interactive state machine can be is 9.
- There are 5 mutually exclusive and comprehensive states: `normal`, `hover`, `hoverActive`, `touchActive`, and `keyActive`. These are combined with 1 boolean state: `focus`, with the exception of `keyActive`, which is only available while in the `focus` state, for a total of 9 states:
  - `normal`
  - `normal` with `focus`
  - `hover`
  - `hover` with `focus`
  - `hoverActive`
  - `hoverActive` with `focus`
  - `touchActive`
  - `touchActive` with `focus`
  - `keyActive` with `focus`
- The `onStateChange` callback is called each time a transition occurs between any of the 9 states.
- The `active` state/prop is just a convenience wrapper around the 3 specific active states: `hoverActive`, `touchActive`, and `keyActive`, and is not a state in its own right.  
- The `focus` state's `focusFrom` API allows for separate styles and class names based on how the `focus` state was entered (tab, mouse, or touch), but are not considered separate states within the state machine.
