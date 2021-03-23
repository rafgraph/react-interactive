import React from 'react';
import { SunIcon } from '@modulz/radix-icons';
import { styled } from './stitches.config';
import { Interactive } from 'react-interactive';

const DarkModeToggle: React.VFC<{ onClick: () => void }> = (props) => {
  return (
    <Interactive {...props} as="button">
      <SunIcon width="30" height="30" />
    </Interactive>
  );
};

export const StyledDarkModeToggle = styled(DarkModeToggle, {
  color: '$highContrast',
  width: '30px',
  height: '30px',
  display: 'inline-block',
  '&.hover, &.active': {
    color: '$green',
  },
  '&.focusFromKey': {
    outline: '2px solid $colors$green',
    outlineOffset: '2px',
  },
});

interface InteractiveLinkProps {
  children: React.ReactNode;
  href: string;
}

const InteractiveLink: React.VFC<InteractiveLinkProps> = (props) => (
  <Interactive {...props} as="a" />
);

export const StyledLink = styled(InteractiveLink, {
  color: '$highContrast',
  borderBottom: '2px dotted $green',
  textDecoration: 'none',

  '&.hover, &.active': {
    borderBottomStyle: 'solid',
  },

  '&.focusFromKey': {
    outline: '2px solid $colors$green',
    outlineOffset: '2px',
  },

  variants: {
    type: {
      lowContrast: {
        color: '$lowContrast',
        fontSize: '14px',
        borderBottomWidth: '1px',

        '&.hover, &.active': {
          color: '$highContrast',
        },
      },
    },
  },
});
