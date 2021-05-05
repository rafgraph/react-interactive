import * as React from 'react';
import { Interactive, createInteractive } from 'react-interactive';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Link } from '../ui/Link';
import { DemoContainer, DemoHeading } from '../ui/DemoContainer';
import { styled, keyframes, CSS } from '../stitches.config';

const scale = keyframes({
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.03)' },
  '100%': { transform: 'scale(1)' },
});

const linkCss: CSS = {
  display: 'inline-block',
  textDecoration: 'underline',
  borderRadius: '3px',
  padding: '3px 4px 2px',
  margin: '1px -4px',
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
    textDecoration: 'none',
    backgroundColor: '$backgroundPurple',
    boxShadow: '0 0 0 1px $colors$purple',
    // adds a 3D drop shadow as well
    // boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
};

const AnchorLink = styled(Interactive.A, linkCss);
const RouterLink = styled(createInteractive(ReactRouterLink), linkCss);

const P = styled('p', {
  marginTop: '10px',
});

const Button = styled(Interactive.Button, {
  display: 'block',
  padding: '10px 26px',
  marginTop: '16px',
  fontFamily: '$mono',
  textAlign: 'center',
  backgroundColor: '$formElementsBackground',
  border: '1px solid',
  borderRadius: '1000px',

  '&.hover': {
    borderColor: '$green',
    boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
  // focusFromKey styles are overridden by active styles (below), but not hover styles (above)
  '&.focusFromKey': {
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.mouseActive': {
    color: '$green',
    borderColor: '$green',
    boxShadow: '1px 2px 3px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.touchActive': {
    color: '$blue',
    borderColor: '$blue',
    boxShadow: '0 0 0 1px $colors$blue',
  },
  '&.keyActive': {
    color: '$purple',
    borderColor: '$purple',
    boxShadow: '0 0 0 1px $colors$purple, 1px 2px 3px 0px rgba(0, 0, 0, 0.38)',
  },
  '&.disabled': {
    opacity: 0.5,
  },
});

export const LinksAndButtons: React.VFC = () => {
  return (
    <DemoContainer id="links">
      <DemoHeading>Links and Buttons</DemoHeading>
      <AnchorLink href="#">
        Anchor tag link – <code>as="a" href="#"</code>
      </AnchorLink>
      <RouterLink to="/">
        React Router link – <code>{'as={Link} to="/"'}</code>
      </RouterLink>
      <P>
        Another{' '}
        <Link href="#" newWindow={false}>
          link with different styling
        </Link>{' '}
        that appears in the middle of some text.
      </P>
      <Button>as="button"</Button>
    </DemoContainer>
  );
};
