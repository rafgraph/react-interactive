import useDarkMode from 'use-dark-mode';
import { StateLog } from './StateLog';
import { styled, darkThemeClass } from './stitches.config';
import { Link, DarkModeButton } from './Interactive';

const MainDemoContainer = styled('div', {
  maxWidth: '500px',
  padding: '14px 15px 25px',
  margin: '0 auto',
});

const H1 = styled('h1', {
  fontSize: '26px',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '2px',
});

const P = styled('p', {
  margin: '12px 0',
});

export const MainDemo = () => {
  const darkMode = useDarkMode(undefined, {
    classNameDark: darkThemeClass,
  });

  return (
    <MainDemoContainer>
      <H1>
        <span>React Interactive Demo</span>
        <DarkModeButton onClick={darkMode.toggle} />
      </H1>
      <Link
        type="lowContrast"
        href="https://github.com/rafgraph/react-interactive"
      >
        https://github.com/rafgraph/react-interactive
      </Link>
      <P>
        This demo site for React Interactive v1 is under construction 🚧🚧 the{' '}
        <Link href="https://react-interactive-v0.rafgraph.dev">
          v0 demo site can be found here
        </Link>
        .
      </P>
      <StateLog />
    </MainDemoContainer>
  );
};
