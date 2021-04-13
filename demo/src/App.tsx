import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { globalCss } from './stitches.config';
import { MainDemo } from './MainDemo';
import { DisabledEdgeCases } from './DisabledEdgeCases/DisabledEdgeCases';
import { TypeScriptExamples } from './TypeScriptExamples';

export const App = () => {
  globalCss();

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/typescript" component={TypeScriptExamples} />
        <Route path="/disabled-edge-cases" component={DisabledEdgeCases} />
        <Route component={MainDemo} />
      </Switch>
    </BrowserRouter>
  );
};
