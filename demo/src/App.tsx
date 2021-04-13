import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { MainDemo } from './MainDemo';
import { DisabledEdgeCases } from './DisabledEdgeCases/DisabledEdgeCases';
import { TypeScriptExamples } from './TypeScriptExamples';

export const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/typescript" component={TypeScriptExamples} />
      <Route path="/disabled-edge-cases" component={DisabledEdgeCases} />
      <Route component={MainDemo} />
    </Switch>
  </BrowserRouter>
);
