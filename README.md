# React Interactive

[Live example](http://react-interactive.rafrex.com)

Interactive state machine as a React component. There are 5 mutually exclusive states, plus 1 boolean state that can be combined with the other 5.
- The 5 mutually exclusive states are:
  - `normal`
  - `hover`
  - \*`hoverActive`
  - \*`touchActive`
  - \*`keyActive`
- The 1 boolean state is:
  - `focus`

\*The 3 separate `[type]Active` states can be treated as a single `active` state if desired. `hoverActive` (mouse on and button down), `touchActive` (touch on screen), `keyActive` (has focus and enter key down).

Compared to CSS, React Interactive is a simpler state machine with better touch device and keyboard support, and on enter/leave state hooks. See [comparison](https://github.com/rafrex/react-interactive#interactive-state-machine-comparison).

#### Basic Examples
```javascript
// Interactive and focusable div
<Interactive
  as="div"
  normal={{ color: 'black' }}
  hover={{ color: 'green' }}
  active={{ color: 'blue' }} // style to use for the hoverActive, touchActive and keyActive states
  focus={{ outline: '2px solid green' }}
  style={{ fontSize: '16px', padding: '3px', border: '2px dotted black' }}
  onClick={this.handleClick}
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
  // hook called on every state change, receives prevState and nextState objects
  onStateChange{this.handleInteractiveStateChange}
  hover={{
    style: { color: 'green' },
    // hooks called on enter/leave of the hover state
    onEnter: this.handleEnterHover,
    onLeave: this.handleLeaveHover,
  }}
  active="hover" // use the hover state style for the active state
  style={{ color: 'black', padding: '3px' }}
>This is an interactive link with state change hooks</Interactive>
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
  focus={{ focusFromTabStyle: { outline: '2px solid orange' }}}
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
  // use focusFromTabClassName to only apply the class when focus comes from the keyboard
  focus={{ focusFromTabClassName: 'tab-focus-class' }}
  className="some-class"
>This is an interactive div with CSS classes instead of inline styles</Interactive>
```

#### Installing `react-interactive`
```shell
$ npm install react-interactive
```
```javascript
import Interactive from 'react-interactive';
```
