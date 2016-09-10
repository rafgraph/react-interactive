# React Interactive

Interactive state machine as a React component. There are 3 mutually exclusive states, plus 1 boolean state that can be combined with any of the other 3.
- The 3 mutually exclusive states are:
  - `normal`
  - `hover`
  - `active`
- The 1 boolean state is:
  - `focus`

Additionally, the `active` state can be broken up into 3 mutually exclusive states for finer control if needed - `hoverActive` (mouse on and button down), `touchActive` (touch on screen), and `keyActive` (has focus and enter key down).

Compared to CSS, React Interactive is a simpler state machine, with better touch device and keyboard support, and on enter/leave state hooks. See [comparison below](https://github.com/rafrex/react-interactive#interactive-state-machine-comparison).

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
// Interactive div with separate active states
<Interactive
  as="div"
  normal={{ color: 'black' }}
  hover={{ color: 'green' }}
  hoverActive={{ color: 'red' }}
  touchActive={{ color: 'blue' }}
  keyActive={{ color: 'yellow' }}
  focus={{ border: '2px solid yellow' }}
  style={{ fontSize: '16px', padding: '3px', border: '2px dotted black' }}
  onClick={handleClick}
>This is an interactive div with separate active states</Interactive>
```
```javascript
// Interactive link with separate states for mouse, touch, and keyboard interactions
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
  focus={{
    style: { outline: '2px solid yellow' },
    // so the focus state is not entered during mouse or touch interactions
    tabOnlyFocus: true,
  }}
  keyActive={{ color: 'yellow' }}

>Interactive link with separate styles for each type of interaction</Interactive>
```

#### Installing `react-interactive`
```shell
$ npm install react-interactive
```
```javascript
import Interactive from 'react-interactive';
```

## API

### API for `<Interactive />`
Note that there are no default values for any prop, and the only required prop is `as`.  
For the definition of when each state is entered, see the [state machine definition](https://github.com/rafrex/react-interactive#react-interactive-state-machine) below.

| Prop | Type | Example | Description |
|:-----|:-----|:--------|:------------|
| `as` | string <br> or <br> ReactComponent <br> or <br> JSX/ReactElement | `"div"` or `MyComponent` or `<div>...</div>` | What the Interactive component is rendered as. It can be an html tag name (as a string), or it can be a ReactComponent (Interactive's callbacks are passed down as props to the component), or it can be a JSX/ReactElement. Note that `as` is hot-swappable on each render and Interactive will seamlessly maintain the current interactive state.  **The `as` prop is required.** |
| `normal` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'black' }` <br> or <br> `{ style: { color: 'black' }, className: 'some-clase', onEnter: function(state){...}, onLeave: function(state){...}, }` <br> or <br> `'hover'` | Style or options object for the `normal` state, or a string indicating a state to match. If it's an object, it can be either a style object or an options object with any of these four keys: `style`, `className`, `onEnter`, `onLeave`. The `style` object is merged with both the `style` prop (which it takes precedence over) and the focus state `style` (which it does not takes precedence over). The `className` is a string of space separated class names and is merged as a union with the `className` prop and the focus state `className`. The `onEnter` and `onLeave` values are functions that are called when transitioning to and from the state, respectively, and receive the state as a string, `'normal'`, as their only argument. If the value of `normal` is a string, it must indicate one of the other states, e.g. `'hover'`, and that state's `style` and `className` properties will be used for both states (note that the callbacks are only used for the state they are defined on). |
| `hover` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'green' }` <br> or... (same as above) | Same as above, but for the `hover` state. Note that `hover`'s `onEnter` and `onLeave` hooks are only called when transitioning in and out of a non-hover state, and are not called when transitioning between the `hover` and `hoverActive` states. While this breaks the strict enter/leave state hooks pattern, it makes the `hover` enter/leave hooks more useful by calling them when the mouse transitions on and off the element. If you need to hook into the transition between `hover` and `hoverActive`, then use the `hoverActive` enter/leave hooks or `onStateChange`. Also note that if there is no `hoverActive` or `active` prop, then the `hover` prop's style and classes are used for the `hoverActive` state. |
| `active` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `normal`, but for the `active` state. Note that the `active` state is the union of the `hoverActive`, `touchActive`, and `keyActive` states. The `active` prop is only used in place of the `[type]Active` prop if the respective `[type]Active` prop is not present. |
| `hoverActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as `normal`, but for the `hoverActive` state. Note that if there is no `hoverActive` or `active` prop, then the `hover` prop's style and classes are used for the `hoverActive` state. |
| `touchActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'blue' }` <br> or... (same as above) | Same as `normal`, but for the `touchActive` state. |
| `keyActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'yellow' }` <br> or... (same as above) | Same as `normal`, but for the `keyActive` state. |
| `focus` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ border: '2px dotted green' }` <br> or same as above except for the added `tabOnlyFocus` option if it's an options object: <br> `{ style: { color: 'black' }, className: 'some-clase', onEnter: function(state){...}, onLeave: function(state){...}, tabOnlyFocus: true }` <br> or <br> `'active'` | Same as `normal`, except when the `focus` state `style` is merged with the `style` prop and one of the mutually exclusive state `style`s, the focus state `style` takes precedence over both. The focus state can be applied to any element, not just inputs, and will toggle on click/tap unless the element is an input, textarea, or button. The `tabOnlyFocus` option only allows the element to enter the focus state when not the result of a mouse or touch interaction, usually by tabbing through the focusable elements on the page. The `tabOnlyFocus` key can be omitted unless you want to enable the option. |
| `style` | style object | `{ margin: '10px' }` | Styles that are always applied. Styles are merged with state styles. State styles take precedence when there are conflicts. |
| `className` | string | `"some-class other-class"` | Classes that are always applied to the element, and are merged as a union with state classes. |
| `onStateChange` | function | `function({ prevState, nextState, event }) {...}` | Function called on each state change. Receives an object with `prevState`, `nextState` and `event` keys as the sole argument. The values of the `prevState` and `nextState` keys are state objects with values for `iState` (one of the mutually exclusive states as a string) and `focus` (as a boolean), for example `{ iState: 'hover', focus: false }`. The `event` is the event that caused the state change - note that since it's a synthetic React event, if you want to access it asynchronously you need to call `event.persist()`, otherwise it will be reused by React. `onStateChange` will be called immediately before the `onEnter` and `onLeave` callbacks for each state. |
| `setStateCallback` | function | `function({ prevState, nextState }) {...}` | Function passed in as a callback to `setState`. Receives the same object as `onStateChange` as its sole argument, except without the `event` key because `setState` is asynchronous and React events don't persist asynchronously. Use this hook if you need wait until the DOM is updated before executing the callback. |
| `onClick` | function | `function(event) {...}` | Function called for mouse clicks, taps with 1 touch point/finger (called without any delay), synthetic click events, and enter keydown events (if the element has focus). Event passed in is a `click` event, a `touchend` event, or a `keydown` event. |
| `onMouseClick` | function | `function(event) {...}` | Function called for mouse clicks, and on mouseOnly and hybrid devices for synthetic click events and enter keydown events (if the element has focus). Not called for click events generated from touches. Event passed in is a `click` event or a `keydown` event. Note that `onTap` and `onMouseClick` are mutually exclusive and comprehensive for `onClick`, i.e. one and only one will be called everytime `onClick` is called. |
| `onTap` | function | `function(event) {...}` | Function called for touch taps with 1 touch point, and on touchOnly devices for synthetic click events (e.g. a click event fired by assistive tech), and enter keydown events (if the element has focus). Event passed in is a `touchend` event, a `click` event, or a `keydown` event. Note that `onTap` and `onMouseClick` are mutually exclusive and comprehensive for `onClick`, i.e. one and only one will be called everytime `onClick` is called. |
| `onTapTwo` | function | `function(event) {...}` | Function called for taps with 2 touch points, e.g. a 2 finger tap. Event passed in is the `touchend` event from last touch point to leave the surface. |
| `forceState` | state object | `{ iState: 'normal', focus: false }` | Force enter this state. An object with keys for `iState` (one of the mutually exclusive states as a string) and `focus` (as a boolean). Note that for an `active` `iState`, you must specify `[type]Active` and not just `active`. |
| `mutableProps` |  | `mutableProps` | By default it's assumed that props passed in are immutable. A shallow compare is done, and if the props are the same, the component will not update. If you are passing in mutable props, add the `mutableProps` prop, and the component will always update. If you're not sure and notice buggy behavior, then add this property. |
| `...` | anything | `id="some-id"`, `tabIndex="1"`, etc... | All additional props received are passed through. |

#### Order that callbacks are called in:
1. Event callbacks are called first in the following order (higher specificity first):
  1. `onMouseClick` or `onTap` (they are mutually exclusive)
  * `onClick`
* `onStateChange`
* `onLeave` and `onEnter` state hooks
* `setStateCallback` is passed in as a callback to `setState`, and is called after `setState` finishes

Note that if you pass in other event handlers, e.g. `onMouseDown`, `onTouchEnd`, etc..., they will be called before React Interactive changes its state and calls any of its callbacks.

#### Merging styles and classes
- Styles have the following precedence when merged:
  1. `focus` state style if in the focus state
  2. iState style (`normal`, `hover`, or `active`)
  3. The `style` prop
- Classes are merged as a union without precedence.
  - `focus` state classes if in the focus state
  - iState classes (`normal`, `hover`, or `active`)
  - The `className` prop

## Interactive state machine comparison
Compared to CSS, React Interactive is a simpler state machine, with better touch device and keyboard support, and on enter/leave state hooks.
- Let's define some basic mouse, touch, and keyboard states:
  - `mouseOn`: the mouse is on the element
  - `buttonDown`: the mouse button is down while the mouse is on the element
  - `touchDown`: at least one touch point is in contact with the screen and started on the element
  - `focusKeyDown`:
    - For React Interactive, this is if the element has focus and the enter key is down, or the element is a button and the space bar or enter key is down, or the element is a checkbox or radio button and the space bar is down (convention is buttons are activated by both the space bar and enter key, and radio buttons and checkboxes are only activated by the space bar).
    - For CSS, this is something like, if the element is a button, checkbox, or radio button, has focus, and the space bar is down, then it is in the active state (i.e. the `foucsKeyDown` state for the purposes of this abstraction), but is not consistent across browsers. Note that even though the enter key triggers links and buttons, on most browsers pressing the enter key won't cause an element to enter the active state, which means there is zero visible feedback when triggering an element with the enter key.

### React Interactive state machine
| Interactive state | Mouse, touch and keyboard states |
|:------------------|:---------------------------------|
| *base styles* | *Not an interactive state, always applied, everything merges with them* |
| `normal` | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` |
| `hover` | `mouseOn && !buttonDown && !touchDown && !focusKeyDown` |
| `active` | `hoverActive` &#124;&#124; `keyActive` &#124;&#124; `touchActive` |
| `hoverActive` | `mouseOn && buttonDown && !touchDown && !focusKeyDown` |
| `keyActive` | `focusKeyDown && !touchDown` |
| `touchActive` | `touchDown` |
The focus state boolean can be combined with any of the above states, except for `keyActive`, which is only available while in the `focus` state.

### CSS interactive state machine
Note that since a state machine can only be in one state at a time, to view interactive CSS as a state machine it has to be thought of as a combination of pseudo class selectors that match based on the mouse, keyboard and touch states.

| Interactive state | Note | Mouse, touch and keyboard states | CSS Selector(s) |
|:------------------|:-----|:---------------------------------|:----------------|
| *base styles* | *Always applied, everything merges with them* | *Not an interactive state* | *`.class`* |
| `normal` | Not commonly used in CSS (zeroing out/overriding base styles is used instead)  | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` | `.class:not(:hover):not(:active)` |
| `hover` | Only hover styles applied | `(mouseOn && !buttonDown && !focusKeyDown)` &#124;&#124; `(after touchDown and sticks until you tap someplace else - the sticky hover CSS bug on touch devices)` | `.class:hover` |
| `hoverActive` | Both hover and active styles applied | `(mouseOn && buttonDown)` &#124;&#124; `(mouseOn && focusKeyDown)` &#124;&#124; `(touchDown, but not consistent across browsers)` | `.class:hover`, `.class:active` |
| `active` | Only active styles applied | `(buttonDown && !mouseOn currently, but had mouseOn when buttonDown started)` &#124;&#124; `(focusKeyDown && !mouseOn)` &#124;&#124; `(touchDown && and not on element currently, but not consistent across browsers)` | `.class:active` |

The focus state can be combined with any of the above CSS interactive states to double the total number of states that the CSS interactive state machine can be in.

Note that you could achieve mutually exclusive hover and active states if you apply hover styles with the `.class:hover:not(:active)` selector, and there are other states that you could generate if you wanted. You could also create a touch active state by using [Current Input](https://github.com/rafrex/current-input), so CSS has some flexibility, but it comes at the cost of simplicity, and on touch devices interactive CSS is not well supported. Also, there are no state change hooks with interactive CSS.


## Notes
#### `as` prop:
- If `as` is a ReactComponent:
  - Strictly speaking this means that `as` is either a ReactClass or a ReactFunctionalComponent as defined in the [React Glossary](https://facebook.github.io/react/docs/glossary.html).
  - In order for React Interactive to work `as` a ReactComponent, the component must pass down the props it receives from React Interactive to the top DOM node that it renders, and it cannot override any of the passed down event handlers, e.g. `onMouseEnter`. Also, the component cannot change its top DOM node once it's rendered unless the change is the result of new props. This is because React Interactive keeps a reference to the component's top DOM node so it can do things like call `focus()`, and if the top DOM node changes without React Interactive's knowledge, then things start to break. Note that React Router's Link component meets these requirements.
  - When `as` is a ReactComponent it is wrapped in a `<span>` in order for React Interactive to maintain a reference to the top DOM node without breaking encapsulation. Without the span wrapper the only way to access the top DOM node would be through using `ReactDOM.findDOMNode(component)`, which breaks encapsulation and is discouraged, and also doesn't work with stateless functional components.
- If `as` is a JSX/ReactElement:
  - The props of the top ReactElement are merged with, and take precedence over, Interactive's props. For example:
  ```javascript
  const jsxElement = <div hover={{ color: 'blue' }}>Some jsxElement text</div>;
  <Interactive
    as={jsxElement}
    hover={{ color: 'green' }}
    active={{ color: 'red' }}
  >Some other text</Interactive>
  ```
  - This will create a `div` with text that reads 'Some jsxElement text' and will be blue on hover and red on active. When the props are merged, `jsxElement`'s `hover` prop and `children` take precedence over `Interactive`'s `hover` prop and `children`, but since `jsxElement` didn't specify an `active` prop, `Interactive`'s `active` prop is still valid.

#### Focus state:
- React Interactive's focus state is always kept in sync with the browser's focus state. Added focus functionality like focus toggle and `tabOnlyFocus` is implemented by controlling the browser's focus state.
- If you add a `focus` prop without a `tabIndex` prop, then a `tabIndex` of `0` is added to make the element focusable by the browser.
- All elements will toggle focus except if the element's tag name is `input`, `textarea`, `button`, `select`, or `option`.
- For mouse interactions, the focus state is entered on mouse down, and toggled off on mouse up providing it didn't enter the focus state on the preceding mouse down.
- For touch interactions, the focus state in entered with a 1 touch point/finger tap, and toggled off on the next 1 touch point tap. Also, on touchOnly devices, a click event not preceded by a touch event will toggle focus on/off.
- The focus state change occurs in the same render as the mutually exclusive state changes. For example, on mouse down enters the `focus` state and the `hoverActive` state on the same render. The is achieved by controlling the browser's focus state - without this control the browser would fire the focus event immediately after the mouse down event resulting in two `setState` calls, one to enter the `hoverActive` state and one to enter the `focus` state (while two `setState` calls don't always mean two renders, in this situation it usually ends up that way because the two calls are not in the same synchronously executed code block).

#### React Interactive state machine:
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
