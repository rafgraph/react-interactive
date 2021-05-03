import * as React from 'react';
import { Interactive } from 'react-interactive';
import { styled } from '../stitches.config';

const StyledLink = styled(Interactive.A, {
  color: '$highContrast',

  // can't use shorthand for textDecoration because of bug in Safari v14
  // textDecoration: 'underline $colors$green dotted from-font',
  textDecorationLine: 'underline',
  textDecorationStyle: 'dotted',
  textDecorationColor: '$green',
  textDecorationThickness: 'from-font',

  // padding used to provide offset for boxShadow focus styles,
  // margin undoes padding for page layout so boxShadow works like outline
  padding: '2px 3px',
  margin: '-2px -3px',
  // this is the main reason to use boxShadow instead of outline for focus styles,
  // with outline can only have square corners,
  // with boxShadow can use borderRadius to soften the corners
  borderRadius: '3px',

  '&.hover': {
    textDecorationColor: '$green',
    textDecorationStyle: 'solid',
  },
  '&.mouseActive': {
    color: '$green',
    textDecorationColor: '$green',
    textDecorationStyle: 'solid',
  },
  '&.touchActive': {
    color: '$blue',
    textDecorationColor: '$blue',
    textDecorationStyle: 'solid',
  },
  '&.keyActive': {
    color: '$purple',
    textDecorationColor: '$purple',
    textDecorationStyle: 'solid',
  },
  '&.focusFromKey': {
    boxShadow: '0 0 0 2px $colors$purple',
  },
});

interface LinkProps extends React.ComponentPropsWithoutRef<typeof StyledLink> {
  newWindow?: boolean;
}

export const Link: React.VFC<LinkProps> = ({ newWindow = true, ...props }) => (
  <StyledLink
    {...props}
    target={newWindow ? '_blank' : undefined}
    rel={newWindow ? 'noopener noreferrer' : undefined}
  />
);
