import React from 'react';
import useDarkMode from 'use-dark-mode';
import { Interactive, InteractiveState } from 'react-interactive';
import { styled, globalStyles, darkThemeClass } from './stitches.config';
import { StyledLink, StyledDarkModeToggle } from './Interactive';

const AppDiv = styled('div', {
  maxWidth: '400px',
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

export const App = () => {
  globalStyles();

  const darkMode = useDarkMode(undefined, {
    classNameDark: darkThemeClass,
  });

  const [iState, updateIState] = React.useState<InteractiveState>({
    hover: false,
    active: false,
    focus: false,
    disabled: false,
  });

  return (
    <AppDiv>
      <H1>
        <span>React Interactive Demo</span>
        <StyledDarkModeToggle onClick={darkMode.toggle} />
      </H1>
      <StyledLink
        type="lowContrast"
        href="https://github.com/rafgraph/react-interactive"
      >
        https://github.com/rafgraph/react-interactive
      </StyledLink>
      <P>
        This demo site for React Interactive v1 is under construction 🚧🚧 the{' '}
        <StyledLink href="https://react-interactive-v0.rafgraph.dev">
          v0 demo site can be found here
        </StyledLink>
        .
      </P>
      <div>
        <Interactive
          onStateChange={({ state }) => {
            updateIState(state);
          }}
        >
          hover me
        </Interactive>
        <div>hover: {`${iState.hover}`}</div>
      </div>
    </AppDiv>
  );
};
