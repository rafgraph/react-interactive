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

  '&.hover': {
    textDecorationColor: '$green',
    textDecorationStyle: 'solid',
  },
  '&.mouseActive': {
    textDecorationColor: '$green',
    textDecorationStyle: 'solid',
    color: '$green',
  },
  '&.touchActive': {
    textDecorationColor: '$blue',
    textDecorationStyle: 'solid',
    color: '$blue',
  },
  '&.keyActive': {
    textDecorationColor: '$purple',
    textDecorationStyle: 'solid',
    color: '$purple',
  },
  variants: {
    focus: {
      outline: {
        '&.focusFromKey': {
          outline: '2px solid $colors$purple',
          outlineOffset: '2px',
        },
      },
      boxShadow: {
        // padding used to provide offset for boxShadow
        // margin undoes padding for page layout so boxShadow works like outline
        padding: '2px 3px',
        margin: '-2px -3px',

        // this is the main reason to use boxShadow instead of outline
        // with outline can only have square corners,
        // with boxShadow can use borderRadius to soften the corners
        borderRadius: '3px',

        '&.focusFromKey': {
          boxShadow: '0 0 0 2px $colors$purple',
        },
      },
    },
  },
  defaultVariants: {
    focus: 'boxShadow',
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
