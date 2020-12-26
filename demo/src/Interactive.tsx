import React from 'react';
import { SunIcon } from '@modulz/radix-icons';
import { styled } from './stitches.config';

const DarkModeToggle: React.VFC<{ onClick: () => void }> = (props) => {
  return (
    <button {...props}>
      <SunIcon width="30" height="30" />
    </button>
  );
};

export const StyledDarkModeToggle = styled(DarkModeToggle, {
  color: '$highContrast',
  width: '30px',
  height: '30px',
  display: 'inline-block',
  ':hover, &:active': {
    color: '$green',
  },
  ':focus': {
    // have separate outlineColor b/c tokens don't work in outline shorthand
    // https://github.com/modulz/stitches/issues/103
    outlineColor: '$green',
    outline: '2px solid',
    outlineOffset: '2px',
  },
});

export const StyledLink = styled('a', {
  color: '$highContrast',
  borderBottom: '2px dotted $green',
  textDecoration: 'none',

  ':hover, &:active': {
    borderBottomStyle: 'solid',
  },

  ':focus': {
    // have separate outlineColor b/c tokens don't work in outline shorthand
    // https://github.com/modulz/stitches/issues/103
    outlineColor: '$green',
    outline: '2px solid',
    outlineOffset: '2px',
  },

  variants: {
    type: {
      lowContrast: {
        color: '$lowContrast',
        fontSize: '14px',
        borderBottomWidth: '1px',

        ':hover, &:active': {
          color: '$highContrast',
        },
      },
    },
  },
});
