// adapted from https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
let passive = false;
try {
  const options = Object.defineProperty({}, 'passive', {
    get() { passive = true; },
  });
  window.addEventListener('test', null, options);
} catch (e) { /* empty */ }

const passiveEventSupport = passive;
export default passiveEventSupport;
