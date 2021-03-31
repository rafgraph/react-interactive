// import React so the demo app is compatible with code sandbox
// which doesn't support the new JSX transform yet
// see https://github.com/codesandbox/codesandbox-client/issues/5307
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
);
