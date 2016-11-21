# React Interactive

[Live example](http://react-interactive.rafrex.com)
- Use **inline styles for all interactive states** - `hover`, `active`, `focus`, etc... (no style tags or CSS added to the page)
- Separate `active` states for mouse, touch, and keyboard interactions (not possible with CSS)
- Separate styles for the `focus` state based on how it was entered - from mouse, touch, or tab key (not possible with CSS)
- State change hook to easily incorporate the interactive state into your component (not possible with CSS)
- Built in touch device and keyboard support - a `click` event is generated on mouse click, touch tap (without delay), and enter keydown
- Option to use class names instead of inline styles if you prefer to write styles separately with CSS

```javascript
import Interactive from 'react-interactive';
...
<Interactive
  as="div" // what the Interactive component is rendered as, can be anything
  hover={{ color: 'green' }}

  active={{ color: 'blue' }}
  // OR
  hoverActive={{ color: 'red' }}
  touchActive={{ color: 'blue' }}
  keyActive={{ color: 'orange' }}

  focus={{ outline: '2px solid green' }}
  // OR
  focus={{
    focusFromTabStyle: { outline: '2px solid orange' },
    focusFromMouseStyle: { outline: '2px solid green' },
    focusFromTouchStyle: { outline: '2px solid blue' },
  }}

  // hook called on every state change, receives prevState and nextState objects
  onStateChange={this.handleInteractiveStateChange}
  onClick={this.handleClick}
  style={{ fontSize: '16px', padding: '3px', color: 'black' }}
>This is an interactive and focusable div</Interactive>
```
