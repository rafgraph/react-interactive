import { StateLog } from './demos/StateLog';
import { Links } from './demos/Links';
import { ShowOn } from './demos/ShowOn';
import { FormElements } from './demos/FormElements';
import { CssStickyHoverBug } from './demos/CssStickyHoverBug';
import { StressTest } from './demos/StressTest';
import { styled } from './stitches.config';
import { GitHubIconLink } from './ui/GitHubIconLink';
import { DarkModeButton } from './ui/DarkModeButton';
import { DemoContainer } from './ui/DemoContainer';

const AppContainer = styled('div', {
  maxWidth: '500px',
  padding: '10px 15px 25px',
  margin: '0 auto',
});

const HeaderContainer = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
});

const H1 = styled('h1', {
  display: 'flex',
  alignItems: 'center',
  fontSize: '26px',
  marginRight: '10px',
});

const HeaderIconContainer = styled('span', {
  width: '80px',
  display: 'inline-flex',
  justifyContent: 'space-between',
});

export const App = () => {
  return (
    <AppContainer>
      <HeaderContainer>
        <H1>React Interactive Demo</H1>
        <HeaderIconContainer>
          <GitHubIconLink
            title="GitHub repository for React Interactive"
            href="https://github.com/rafgraph/react-interactive"
          />
          <DarkModeButton />
        </HeaderIconContainer>
      </HeaderContainer>
      <DemoContainer as="p" css={{ paddingBottom: '20px' }}>
        Try out this demo on both mouse and touch devices, and test the keyboard
        navigation too!
      </DemoContainer>
      <StateLog />
      <Links />
      <ShowOn />
      <FormElements />
      <CssStickyHoverBug />
      <StressTest />
    </AppContainer>
  );
};
