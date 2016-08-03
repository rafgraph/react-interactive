# React Interactive

Interactive component for React with 4 independent states (is a state machine, can only be in one of the 4 at any given time):
- `normal`
- `hover`
- `active`
- `touchActive`

## API

### API for `<Interactive />`
Note that there are no default values for any prop, and the only required prop is `as`.

| Prop Name | Type | Example | Description |
|:----------|:-----|:--------|:------------|
| `as` | string or component class | `'div'` or `MyComponent` | Html tag name as a string, or a React component class (Interactive's callbacks are passed down as props to your component). **This is required.** |
| `onNormal` | object or string | `{ color: 'black' }` or <br> `{ style: {...}, className: 'some-clase', onEnter: function, onLeave: function, }` or <br> `'hover'` | Options object for `normal` state (or string indicating a state to match). It can be either a regular style object, or an object with any of these four keys: `style`, `className`, `onEnter`, `onLeave`. The style value is a style object and is merged with, and takes precedence over, the style prop. The className value is a string of class names and is merged with the className prop. The onEnter and onLeave values are functions that are called when transitioning to and from the state, respectively. If it's a string, it must indicate one of the other states, e.g. `hover`, and that state's options object will be used for both states. |
| `onHover` | object or string | `{ color: 'green' }` or ...same as above | Same as above, but for the `hover` state. |
| `onActive` | object or string | `{ color: 'red' }` or ...same as above | Same as above, but for the `active` state.  |
| `onTouchActive` | object or string | `{ color: 'blue' }` or ...same as above | Same as above, but for the `touchActive` state. |
| `style` | object | `{ margin: '10px' }` | Styles that are always applied. Styles are merged with state styles. State styles take precedence when there are conflicts. |
| `className` | string | `'some-class other-class'` | Classes that are always applied to the element, and are merged with state classes if provided. |
| `onStateChange` | function | `function({ prevState, nextState }) {...}` | Function called on each state change. Receives an object with `prevState` and `nextState` keys as the sole argument. The value of each key is a string representing one of the four states: `normal`, `hover`, `active`, `touchActive` |
| `onClick` | function | `function(event) {...}` | Function called for both mouse clicks and touch taps (without any delay). The event passed in will either be a `click` event or a `touchend` event. |
| `onMouseClick` | function | `function(event) {...}` | Function called only on mouse clicks. Not called for click events generated from touches. Event passed in is a `click` event. |
| `onTap` | function | `function(event) {...}` | Function called on touch tap. Event passed in is a `touchend` event. |
| `...` | anything | `id='some-id'` | All additional props received are passed through. |
|  |  |  |  |  |

Order that callbacks are called in:
1. `onLeave` callback for state being left
2. `onEnter` callback for state being entered
3. `onStateChange`
4. `onClick` / `onMouseClick` / `onTap` if applicable

Note that both `onClick` and either `onMouseClick` or `onTap` will be called for mouse clicks and taps. `onMouseClick` or `onTap` will be called before `onClick`.

Note that if you pass in other event handlers, e.g. `onTouchStart`, they will be called after any React Interactive state changes and callbacks.

### API for children
For example, `<Interactive as="div"><div showOnParent="hover">foo</div></Interactive>`

| Prop Name | Type | Default | Values | Example | Description |
|:----------|:-----|:--------|:-------|:--------|:------------|
| `showOnParent` | string | always show | `normal`, `hover`, `active`, `touchActive` | `'hover touchActive'` | Only render child when parent is in one of the specified states. List as a space separated string. |
