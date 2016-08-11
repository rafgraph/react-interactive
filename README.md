# React Interactive

Interactive state machine as a React component with 8 total states. There are 4 mutually exclusive states, plus 1 boolean state that can be combined with any of the other 4.
- The 4 mutually exclusive states are:
  - `normal`
  - `hover`
  - `active`
  - `touchActive`
- The 1 boolean state is:
  - `focus`

#### Basic Example
```javascript
<Interactive
  as="div"
  normal={{ color: 'black' }}
  hover={{ color: 'green' }}
  active={{ color: 'red' }}
  touchActive={{ color: 'blue' }}
  focus={{ border: '2px dotted green' }}
  style={{ fontSize: '16px', border: '1px solid black' }}
  onClick={handleClick}
/>
```

## API

### API for `<Interactive />`
Note that there are no default values for any prop, and the only required prop is `as`.

| Prop | Type | Example | Description |
|:-----|:-----|:--------|:------------|
| `as` | string or component class | `"div"` or `MyComponent` | Html tag name as a string, or a React component class (Interactive's callbacks are passed down as props to your component). **This is required.** |
| `normal` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'black' }` <br> or <br> `{ style: {...}, className: 'some-clase', onEnter: function(state){...}, onLeave: function(state){...}, }` <br> or <br> `'hover'` | Style or options object for `normal` state, or a string indicating a state to match. If it's an object, it can be either a regular style object, or an options object with any of these four keys: `style`, `className`, `onEnter`, `onLeave`. If it's an options object, the style value is a style object and is merged with both the style prop (takes precedence over) and the focus state style (does not takes precedence over); the className value is a string of class names and is merged with the className prop; the onEnter and onLeave values are functions that are called when transitioning to and from the state, respectively, and receive the state as a string as their only argument (are called after `setState` finishes). If it's a string, it must indicate one of the other states whose value is an object, e.g. `hover`, and that state's object will be used for both states. |
| `hover` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'green' }` <br> or... (same as above) | Same as above, but for the `hover` state. |
| `active` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'red' }` <br> or... (same as above) | Same as above, but for the `active` state.  |
| `touchActive` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ color: 'blue' }` <br> or... (same as above) | Same as above, but for the `touchActive` state. |
| `focus` | style&nbsp;object <br> or <br> options&nbsp;object <br> or <br> string | `{ border: '2px dotted green' }` <br> or... (same as above) | Same as above, except when the `focus` state style is merged with the style prop and one of the mutually exclusive state styles, the focus state style takes precedence over both. |
| `forceState` | state object | `{ iState: 'normal', focus: false }` | Force enter this state. An object with keys for `state` (one of the 4 mutually exclusive states as a string) and `focus` (as a boolean). Can be useful for dealing with edge cases where the browser doesn't fire the necessary event. |
| `style` | style object | `{ margin: '10px' }` | Styles that are always applied. Styles are merged with state styles. State styles take precedence when there are conflicts. |
| `className` | string | `"some-class other-class"` | Classes that are always applied to the element, and are merged with state classes if provided. |
| `onStateChange` | function | `function({ prevState, nextState, event }) {...}` | Function called on each state change prior to calling `setState`. Receives an object with `prevState`, `nextState` and `event` keys as the sole argument. The value of `pprevState` and `nextState` keys is a state object with values for `state` (one of the 4 mutually exclusive states as a string) and `focus` (as a boolean), for example `{ state: 'hover', focus: false }`. The `event` is the event that caused the state change - note that since it's a synthetic React event, if you want to access it asynchronously you need to call `event.persist()`, otherwise it will be reused by React. `onStateChange` can be used instead of, or along with, the `onEnter` and `onLeave` callbacks for each state, the main difference being that `onStateChange` is called before Interactive calls `setState` on itself. |
| `onClick` | function | `function(event) {...}` | Function called for both mouse clicks and touch taps (without any delay). The event passed in will either be a `click` event or a `touchend` event. |
| `onMouseClick` | function | `function(event) {...}` | Function called only on mouse clicks. Not called for click events generated from touches. Event passed in is a `click` event. |
| `onTap` | function | `function(event) {...}` | Function called on touch tap. Event passed in is a `touchend` event. |
| `...` | anything | `id="some-id"`, `tabIndex="1"`, etc... | All additional props received are passed through. |
|  |  |  |  |  |

#### Order that callbacks are called in:
1. Action callbacks are called first in the following order (higher specificity first):
  1. `onMouseClick` or `onTap`
  * `onClick`
* `onStateChange`
* `setState` for Interactive is called next, with the following hooks passed in as a callback to `setState`, after `setState` finishes they will be called in the following order:
  1. `onLeave` callback for state being left
  * `onEnter` callback for state being entered

Note that if you pass in other event handlers, e.g. `onTouchStart`, they will be called after any React Interactive state changes and callbacks.

#### Merging styles and classes
- Styles have the following precedence when merged:
  1. `focus` state style if in the focus state
  2. One of the 4 mutually exclusive states' style (`normal`, `hover`, `active`, or `touchActive`)
  3. The `style` prop
- Classes are merged as a union without precedence.
  - `focus` state classes if in the focus state
  - One of the 4 mutually exclusive states' classes (`normal`, `hover`, `active`, or `touchActive`)
  - The `className` prop

### API for children - TODO
For example, `<Interactive as="div"><div showOnParent="hover">foo</div></Interactive>`

| Prop Name | Type | Default | Values | Example | Description |
|:----------|:-----|:--------|:-------|:--------|:------------|
| `showOnParent` | string | always show | `normal`, `hover`, `active`, `touchActive` | `'hover touchActive'` | Only render child when parent is in one of the specified states. List as a space separated string. |


## Interactive state machine comparison
Compared to CSS, React Interactive is a simpler state machine, with better touch device support, and on enter/leave state hooks.
- Let's define some basic mouse, touch, and keyboard states:
  - `mouseOn`: the mouse is on the element
  - `buttonDown`: the mouse button is down while the mouse is on the element
  - `touchDown`: touch is on the screen and started on the element
  - `focusKeyDown`:
    - For React Interactive, this if the element has focus and the space bar or enter key is down.
    - For CSS, this is something like, if the element is a button, has focus, and the space bar is down, then it is in the `foucsKeyDown` state, but is not consistent across browsers (haven’t done enough testing to know all the edge cases).

### React Interactive state machine
| Interactive state | Mouse, touch and keyboard states |
|:------------------|:---------------------------------|
| *base styles* | *Not an interactive state, always applied, everything merges with them* |
| normal | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` |
| hover | `mouseOn && !buttonDown && !touchDown && !focusKeyDown` |
| active | `(buttonDown && mouseOn && !touchDown)` &#124;&#124; `(focusKeyDown && !touchDown)` |
| touchActive | `touchDown` |
The focus state can be combined with the above 4 mutually exclusive states, for a total of 8 states that the React Interactive state machine can be in.

### CSS interactive state machine
Note that since a state machine can only be in one state at a time, to view interactive CSS as a state machine it has to be thought of as a combination of pseudo class selectors that match based on the mouse, keyboard and touch states.

| Interactive state | Note | Mouse, touch and keyboard states | CSS Selector(s) |
|:------------------|:-----|:---------------------------------|:----------------|
| *base styles* | *Always applied, everything merges with them* | *Not an interactive state* | *`.class`* |
| normal | Rarely used in CSS (overriding base styles is used instead)  | `!mouseOn && !buttonDown && !touchDown && !focusKeyDown` | `.class:not(:hover):not(:active)` |
| hover | Only hover styles applied | `(mouseOn && !buttonDown && !focusKeyDown)` &#124;&#124; `(after touchDown and sticks until you tap someplace else - the sticky hover bug)` | `.class:hover` |
| hoverActive | Both hover and active styles applied | `(mouseOn && buttonDown)` &#124;&#124; `(mouseOn && focusKeyDown)` &#124;&#124; `(touchDown, but not consistent across browsers)` | `.class:hover`, `.class:active` |
| active | Only active styles applied | `(buttonDown && !mouseOn currently, but had mouseOn when buttonDown started)` &#124;&#124; `(focusKeyDown && !mouseOn)` &#124;&#124; `(touchDown && and not on element currently, but not consistent across browsers)` | `.class:active` |
|  |  |  |  |

The focus state can be combined with any of the above CSS interactive states, for a doubling of the total number of states that the CSS interactive state machine can be in.

Note that you could achieve mutually exclusive hover and active states if you apply hover styles with the `.class:hover:not(:active)` selector, and there are other states that you could generate if you wanted. You could also create a touch active state by using [Current Input](https://github.com/rafrex/current-input), so CSS has some flexibility, but it comes at the cost of simplicity, and on touch devices interactive CSS is not well supported. Also, there are no state change hooks with CSS.
