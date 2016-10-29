import passiveEventSupport from './detectPassiveEventSupport';

const notifyOfAllSubs = {};
const notifyOfNextSubs = {};
const subsIDs = {};

let nextID = 0;
function setNotifyOfNext(event, callback) {
  if (nextID === 1000000) nextID = 0;
  const ID = nextID;
  nextID++;
  subsIDs[event][ID] = notifyOfNextSubs[event].push({ ID, callback }) - 1;
  return ID;
}

function removeFromNotifyOfNext(event, id) {
  if (subsIDs[event][id] !== 'undefined') {
    notifyOfNextSubs[event].splice([subsIDs[event][id]], 1);
    delete subsIDs[event][id];
  }
}

export function notifyOfNext(events, callback) {
  if (typeof events === 'string') {
    return setNotifyOfNext(events, callback);
  }
  const ids = [];
  events.forEach((event) => {
    ids.push(setNotifyOfNext(event, callback));
  });
  return ids;
}

export function cancelNotifyOfNext(events, ids) {
  if (typeof events === 'string') {
    removeFromNotifyOfNext(events, ids);
  } else {
    events.forEach((event, idx) => {
      removeFromNotifyOfNext(event, ids[idx]);
    });
  }
}


export function notifyOfAll(events, callback) {
  events.forEach((event) => {
    notifyOfAllSubs[event] = callback;
  });
}

function eventHandler(e) {
  notifyOfAllSubs[e.type] && notifyOfAllSubs[e.type](e);
  if (notifyOfNextSubs[e.type].length === 0) return;
  const reNotifyOfNext = [];
  const reNotifyOfNextIDs = {};
  notifyOfNextSubs[e.type].forEach((sub) => {
    if (sub.callback(e) === 'reNotifyOfNext') {
      reNotifyOfNextIDs[sub.id] = reNotifyOfNext.push(sub) - 1;
    }
  });
  notifyOfNextSubs[e.type] = reNotifyOfNext;
  subsIDs[e.type] = reNotifyOfNextIDs;
}

const listenerOptions = passiveEventSupport ? {
  capture: true,
  passive: true,
} : true;


const eventList = [
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mousedown',
  'mouseup',
  'touchstart',
  'touchend',
  'touchcancel',
  'scroll',
  'dragstart',
];

eventList.forEach((event) => {
  notifyOfNextSubs[event] = [];
  subsIDs[event] = {};
  document.addEventListener(event, eventHandler, listenerOptions);
});
