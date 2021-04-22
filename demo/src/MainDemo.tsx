import useDarkMode from 'use-dark-mode';
import { StateLog } from './StateLog';
import { ShowOnDemo } from './ShowOnDemo';
import { LinkDemo } from './LinkDemo';
import { StressTest } from './StressTest';
import { styled, darkThemeClass } from './stitches.config';
import { GitHubRepoButtonLink, DarkModeButton } from './Interactive';

const MainDemoContainer = styled('div', {
  maxWidth: '500px',
  padding: '14px 15px 25px',
  margin: '0 auto',
});

const HeaderContainer = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '2px',
});

const H1 = styled('h1', {
  fontSize: '26px',
  marginRight: '10px',
});

const HeaderIconContainer = styled('span', {
  flexShrink: 0,
  width: '70px',
  display: 'inline-flex',
  justifyContent: 'space-between',
});

const DemoInfoText = styled('p', {
  margin: '12px 0',
});

export const MainDemo = () => {
  // put a try catch around localStorage so this app will work in codesandbox
  // when the user blocks all third party cookies in chrome,
  // which results in a security error when useDarkMode tries to access localStorage
  // see https://github.com/codesandbox/codesandbox-client/issues/5397
  let storageProvider: any = null;
  try {
    storageProvider = localStorage;
  } catch {}
  const darkMode = useDarkMode(undefined, {
    classNameDark: darkThemeClass,
    storageProvider,
  });

  return (
    <MainDemoContainer>
      <HeaderContainer>
        <H1>React Interactive Demo</H1>
        <HeaderIconContainer>
          <GitHubRepoButtonLink />
          <DarkModeButton onClick={darkMode.toggle} />
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
