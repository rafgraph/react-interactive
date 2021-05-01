import { Interactive } from 'react-interactive';
import { styled } from '../stitches.config';

export const Button = styled(Interactive.Button, {
  color: '$highContrast',
  '&.hover, &.mouseActive': {
    color: '$green',
    borderColor: '$green',
  },
  '&.touchActive': {
    color: '$blue',
    borderColor: '$blue',
  },
  '&.keyActive': {
    color: '$purple',
    borderColor: '$purple',
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
        '&.focusFromKey': {
          boxShadow: '0 0 0 2px $colors$purple',
        },
      },
    },
  },
  defaultVariants: {
    focus: 'outline',
  },
});
