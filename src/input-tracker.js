import detectIt from 'detect-it';
import { notifyOfAll } from './notifier';

const input = {};

let touchTimerID = null;

function updateTouch(e) {
  input.touch.event = e;
  if (e.type === 'touchstart') {
    input.touch.touchOnScreen = true;
    if (input.mouse) input.mouse.mouseOnDocument = false;
  } else if (e.type === 'touchend' || e.type === 'touchcancel') {
    input.touch.touchOnScreen = false;
    input.touch.recentTouch = true;
    if (touchTimerID) window.clearTimeout(touchTimerID);
    touchTimerID = window.setTimeout(() => {
      input.touch.recentTouch = false;
      touchTimerID = null;
    }, 600);
  }
}

function updateMouse(e) {
  input.mouse.event = e;
  if (e.type === 'mouseleave') input.mouse.mouseOnDocument = false;
  else input.mouse.mouseOnDocument = true;
}

export function updateMouseFromRI(e) {
  input.mouse.mouseOnDocument = true;
  input.mouse.event = e.nativeEvent;
}

if (detectIt.hasTouchEventsApi) {
  input.touch = {
    recentTouch: false,
    touchOnScreen: false,
    event: new TouchEvent('touchend'),
  };
  notifyOfAll(['touchstart', 'touchend', 'touchcancel'], updateTouch);
}

if (detectIt.deviceType !== 'touchOnly') {
  input.mouse = {
    mouseOnDocument: false,
    event: new MouseEvent('mouseleave'),
  };
  notifyOfAll(['mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'mouseup'], updateMouse);
}

export default input;
