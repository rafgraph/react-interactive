import useDarkMode from 'use-dark-mode';
import { StateLog } from './StateLog';
import { ShowOnDemo } from './ShowOnDemo';
import { LinkDemo } from './LinkDemo';
import { StressTest } from './StressTest';
import { styled, darkThemeClass } from './stitches.config';
import { Link, DarkModeButton } from './Interactive';

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
  marginRight: '6px',
});

const DemoInfoText = styled('p', {
  color: '$lowContrast',
  margin: '12px 0',
});

export const MainDemo = () => {
  const darkMode = useDarkMode(undefined, {
    classNameDark: darkThemeClass,
  });

  return (
    <MainDemoContainer>
      <HeaderContainer>
        <H1>React Interactive Demo</H1>
        <DarkModeButton onClick={darkMode.toggle} />
      </HeaderContainer>
      <Link
        type="lowContrast"
        href="https://github.com/rafgraph/react-interactive"
      >
        https://github.com/rafgraph/react-interactive
      </Link>
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
