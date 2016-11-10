import { notifyOfAll } from './notifier';
import { deviceType, hasTouchEventsApi, mouseEvents, touchEvents } from './constants';

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
};

// update touch input tracking
let touchTimerID = null;
function updateTouch(e) {
  if (e.type === 'touchstart') {
    input.touch.touchOnScreen = true;
    input.mouse.mouseOnDocument = false;
  } else if (e.touches.length === 0) {
    input.touch.touchOnScreen = false;
    input.touch.recentTouch = true;
    if (touchTimerID) window.clearTimeout(touchTimerID);
    touchTimerID = window.setTimeout(() => {
      input.touch.recentTouch = false;
      touchTimerID = null;
    }, 600);
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

// update mouse from RI - this is required for enter and leave events from RI elements
// because when the mouse is moved onto an RI element the most recent mousemove event
// will have the mouse coordinates as off the element, so need to get updated coordinates
// from the react event
export function updateMouseFromRI(e) {
  updateMouse(e);
  input.mouse.mouseOnDocument = true;
}

// sign up for notification of touch events if the device has the touch events api
if (hasTouchEventsApi) {
  notifyOfAll(Object.keys(touchEvents), updateTouch);
}

// sign up for notification of mouse events if the device is mouseOnly or hybrid
if (deviceType !== 'touchOnly') {
  notifyOfAll(Object.keys(mouseEvents), deviceType === 'hybrid' ? updateHybridMouse : updateMouse);
}

export default input;
