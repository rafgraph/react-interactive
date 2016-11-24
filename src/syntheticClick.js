import { notifyOfAll } from './notifier';
import { deviceHasTouch, queueTime } from './constants';

let blockClick = false;
let blockClickTimerID = null;
let blockClickCounter = 0;

// call node.click() on tap, and block a subsequent click fired by the browser if there is one,
// note that blocking the subsequent click event fired by the browser is required because
// when the tap/node.click() call results in a change to the layout of the DOM,
// e.g. hide something, the subsequent click event fired by the browser will land
// on the DOM in it's new layout, and if where the tap occurred now has something different
// that has a click handler, e.g. a link, then the subsequent click event will land on
// and trigger the click handler, which is very bad, so it needs to be blocked.
export default function syntheticClick(node) {
  // only block one subsequent click event per node.click() call
  blockClickCounter++;
  if (blockClickTimerID !== null) window.clearTimeout(blockClickTimerID);
  blockClick = false;
  node.click();
  blockClick = true;
  // reset click blocking if subsequent click isn't added to browser's queue w/in queueTime
  blockClickTimerID = window.setTimeout(() => {
    blockClick = false;
    blockClickCounter = 0;
    blockClickTimerID = null;
  }, queueTime);
}

function handleClick(e) {
  if (!blockClick) return;
  e.stopPropagation();
  e.preventDefault();
  blockClickCounter--;
  // reset click blocking if the number of clicks to block is met
  if (blockClickCounter === 0) {
    blockClick = false;
    if (blockClickTimerID !== null) {
      window.clearTimeout(blockClickTimerID);
      blockClickTimerID = null;
    }
  }
}

// only required for touch devices because called on touchend tap to control tapClick
if (deviceHasTouch) notifyOfAll(['click'], handleClick);
