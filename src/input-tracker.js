import detectIt from 'detect-it';
import { notifyOfAll } from './notifier';

const input = {
  mouse: {},
  touch: {},
};

let touchTimerID = null;
let touchEndTimerID = null;

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
    if (e.type === 'touchend') {
      input.touch.recentTouchEnd = true;
      if (touchEndTimerID) window.clearTimeout(touchEndTimerID);
      touchEndTimerID = window.setTimeout(() => {
        input.touch.recentTouchEnd = false;
        touchEndTimerID = null;
      }, 100);
    }
  }
}

let mouseDownTimerID = null;
function updateMouse(e) {
  if (input.touch && (input.touch.recentTouch || input.touch.touchOnScreen)) return;
  input.mouse.event = e;
  if (e.type === 'mouseleave') input.mouse.mouseOnDocument = false;
  else input.mouse.mouseOnDocument = true;
  if (e.type === 'mousedown') {
    input.mouse.recentMouseDown = true;
    if (mouseDownTimerID) window.clearTimeout(mouseDownTimerID);
    mouseDownTimerID = window.setTimeout(() => {
      input.mouse.recentMouseDown = false;
      mouseDownTimerID = null;
    }, 100);
  }
}

export function updateMouseFromRI(e) {
  input.mouse.mouseOnDocument = true;
  input.mouse.event = e.nativeEvent;
}

if (detectIt.hasTouchEventsApi) {
  input.touch = {
    recentTouchEnd: false,
    recentTouch: false,
    touchOnScreen: false,
    event: {},
  };
  notifyOfAll(['touchstart', 'touchend', 'touchcancel'], updateTouch);
}

if (detectIt.deviceType !== 'touchOnly') {
  input.mouse = {
    mouseOnDocument: false,
    recentMouseDown: false,
    event: {},
  };
  notifyOfAll(['mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'mouseup'], updateMouse);
}

export default input;
