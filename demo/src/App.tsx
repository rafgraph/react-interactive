import { StateLog } from './demos/StateLog';
import { LinksAndButtons } from './demos/LinksAndButtons';
import { ShowOn } from './demos/ShowOn';
import { CssStickyHoverBug } from './demos/CssStickyHoverBug';
import { FormElements } from './demos/FormElements';
import { StressTest } from './demos/StressTest';
import { styled } from './stitches.config';
import { GitHubIconLink } from './ui/GitHubIconLink';
import { DarkModeButton } from './ui/DarkModeButton';
import { DemoContainer } from './ui/DemoContainer';

const AppContainer = styled('div', {
  maxWidth: '500px',
  padding: '12px 15px 25px',
  margin: '0 auto',
});

const HeaderContainer = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
});

const H1 = styled('h1', {
  fontSize: '26px',
  marginRight: '16px',
});

const HeaderIconContainer = styled('span', {
  width: '78px',
  display: 'inline-flex',
  justifyContent: 'space-between',
  gap: '12px',
});

export const App = () => {
  return (
    <AppContainer>
      <HeaderContainer>
        <H1>React Interactive Demo</H1>
        <HeaderIconContainer>
          <DarkModeButton />
          <GitHubIconLink
            title="GitHub repository for React Interactive"
            href="https://github.com/rafgraph/react-interactive"
          />
        </HeaderIconContainer>
      </HeaderContainer>
      <DemoContainer as="p" css={{ paddingBottom: '20px' }}>
        Try out this demo on both mouse and touch devices, and test the keyboard
        navigation too!
      </DemoContainer>
      <StateLog />
      <LinksAndButtons />
      <ShowOn />
      <CssStickyHoverBug />
      <FormElements />
      <StressTest />
    </AppContainer>
  );
};
