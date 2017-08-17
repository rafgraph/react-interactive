import { notifyOfAll } from './notifier';
import {
  deviceType,
  deviceHasTouch,
  deviceHasMouse,
  mouseEvents,
  touchEvents,
  queueTime,
} from './constants';

// the shape of what's being tracked globally
// the input object is the default export
const input = {
  mouse: {
    mouseOnDocument: false,
    clientX: 0,
    clientY: 0,
    buttons: 0,
  },
  touch: {
    touchOnScreen: false,
    recentTouch: false,
  },
  key: {
    recentEnterKeyDown: false,
  },
};

// update touch input tracking
let touchTimerID = null;
function updateTouch(e) {
  if (e.type === 'touchstart') {
    input.touch.touchOnScreen = true;
    input.mouse.mouseOnDocument = false;
  } else if (e.type === 'touchend' || e.type === 'touchcancel') {
    input.touch.recentTouch = true;
    if (touchTimerID) window.clearTimeout(touchTimerID);
    touchTimerID = window.setTimeout(() => {
      input.touch.recentTouch = false;
      touchTimerID = null;
    }, queueTime);
  }

  if (e.touches.length === 0) {
    input.touch.touchOnScreen = false;
  }
}

// update mouse input tracking
function updateMouse(e) {
  input.mouse.clientX = e.clientX;
  input.mouse.clientY = e.clientY;
  input.mouse.buttons = e.buttons;
  if (e.type === 'mouseleave') input.mouse.mouseOnDocument = false;
  else input.mouse.mouseOnDocument = true;
}

// only update mouse if the mouse event is not from a touch event
function updateHybridMouse(e) {
  if (input.touch.recentTouch || input.touch.touchOnScreen) return;
  updateMouse(e);
}

// update recent enter keydown tracking, used for form submission detection
let enterKeyDownTimerID = null;
function updateEnterKeyDown(e) {
  if (e.key === 'Enter') {
    input.key.recentEnterKeyDown = true;
    if (enterKeyDownTimerID) window.clearTimeout(enterKeyDownTimerID);
    enterKeyDownTimerID = window.setTimeout(() => {
      input.key.recentEnterKeyDown = false;
      enterKeyDownTimerID = null;
    }, queueTime);
  }
}

// update mouse from RI - this is required for enter and leave events from RI elements
// because when the mouse is moved onto an RI element the most recent mousemove event
// will have the mouse coordinates as off the element, so need to get updated coordinates
// from the react event
export function updateMouseFromRI(e) {
  updateMouse(e);
  input.mouse.mouseOnDocument = true;
}

// sign up for notification of touch events if the device supports the touch events api
if (deviceHasTouch) {
  notifyOfAll(Object.keys(touchEvents), updateTouch);
}

// sign up for notification of mouse events if the device has a mouse
if (deviceHasMouse) {
  notifyOfAll(
    Object.keys(mouseEvents),
    deviceType === 'hybrid' ? updateHybridMouse : updateMouse,
  );
}

// sign up for notification of enter keydown events for form submission detection
notifyOfAll(['keydown'], updateEnterKeyDown);

// focus registry used by RI to track events that cause focus/blur calls (e.g. mousedown)
// so focus/blur is not called twice as event bubbles through nested RIs
export const focusRegistry = {
  focus: null,
  blur: null,
};

export default input;
