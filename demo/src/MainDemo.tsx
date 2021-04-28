import { StateLog } from './StateLog';
import { ShowOnDemo } from './ShowOnDemo';
import { LinkDemo } from './LinkDemo';
import { StressTest } from './StressTest';
import { styled } from './stitches.config';
import { GitHubIconLink } from './ui/GitHubIconLink';
import { DarkModeButton } from './ui/DarkModeButton';

const MainDemoContainer = styled('div', {
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

const DemoInfoText = styled('p', {
  margin: '20px 0',
});

export const MainDemo = () => {
  return (
    <MainDemoContainer>
      <HeaderContainer>
        <H1>React Interactive Demo</H1>
        <HeaderIconContainer>
          <GitHubIconLink
            aria-label="GitHub repository for React Interactive"
            href="https://github.com/rafgraph/react-interactive"
          />
          <DarkModeButton />
        </HeaderIconContainer>
      </HeaderContainer>
      <DemoInfoText>
        Try out this demo on both mouse and touch devices, and test the keyboard
        navigation too!
      </DemoInfoText>
      <StateLog />
      <ShowOnDemo />
      <LinkDemo />
      <StressTest />
    </MainDemoContainer>
  );
};
