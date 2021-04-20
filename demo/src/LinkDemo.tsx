import * as React from 'react';
import { Interactive, createInteractive } from 'react-interactive';
import { Link } from 'react-router-dom';
import { DemoContainer, DemoHeading } from './ui';
import { styled, keyframes, CSS } from './stitches.config';

const scale = keyframes({
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.03)' },
  '100%': { transform: 'scale(1)' },
});

const linkCss: CSS = {
  display: 'inline-block',
  textDecoration: 'underline',
  padding: '4px 5px 3px',
  '&.hover, &.mouseActive': {
    color: '$green',
  },
  '&.touchActive': {
    color: '$blue',
  },
  '&.keyActive': {
    color: '$purple',
  },
  '&.focusFromKey': {
    animation: `${scale} 500ms`,
    backgroundColor: '$backgroundPurple',
    padding: '3px 4px 2px',
    border: '1px solid $colors$purple',
    borderRadius: '3px',
    textDecoration: 'none',
  },
};

const AnchorLink = styled(Interactive.A, linkCss);
const RouterLink = styled(createInteractive(Link), linkCss);

export const LinkDemo: React.VFC = () => {
  return (
    <DemoContainer>
      <DemoHeading>Links</DemoHeading>
      <AnchorLink href="#">
        Anchor tag link – <code>as="a" href="#"</code>
      </AnchorLink>
      <RouterLink to="/">
        React Router link – <code>{'as={Link} to="/"'}</code>
      </RouterLink>
    </DemoContainer>
  );
};
