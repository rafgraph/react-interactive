import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { globalCss } from './stitches.config';
import { MainDemo } from './MainDemo';
import { TypeScriptExamples } from './TypeScriptExamples';
import { DisabledEdgeCase } from './DisabledEdgeCase/DisabledEdgeCase';
import { PageJumpEdgeCase } from './PageJumpEdgeCase';

export const App = () => {
  globalCss();

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/typescript" component={TypeScriptExamples} />
        <Route path="/disabled-edge-case" component={DisabledEdgeCase} />
        <Route path="/page-jump-edge-case" component={PageJumpEdgeCase} />
        <Route component={MainDemo} />
      </Switch>
    </BrowserRouter>
  );
};
