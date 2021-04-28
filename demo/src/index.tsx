import * as React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { globalCss } from './stitches.config';
import { App } from './App';
import { DisabledEdgeCase } from './other/DisabledEdgeCase';
import { PageJumpEdgeCase } from './other/PageJumpEdgeCase';
import { TypeScriptExamples } from './other/TypeScriptExamples';

export const Index = () => {
  globalCss();

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/disabled-edge-case" component={DisabledEdgeCase} />
        <Route path="/page-jump-edge-case" component={PageJumpEdgeCase} />
        <Route path="/typescript" component={TypeScriptExamples} />
        <Route render={() => <Redirect to="/" />} />
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
  document.getElementById('root'),
);
