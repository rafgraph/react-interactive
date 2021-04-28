import * as React from 'react';
import { Interactive } from 'react-interactive';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Button } from './Button';

interface GitHubIconLinkProps {
  href?: string;
  'aria-label'?: string;
  newWindow?: boolean;
  css?: React.ComponentProps<typeof Button>['css'];
}

export const GitHubIconLink: React.VFC<GitHubIconLinkProps> = ({
  newWindow = true,
  css,
  ...props
}) => (
  <Button
    {...props}
    as={Interactive.A}
    target={newWindow ? '_blank' : undefined}
    rel={newWindow ? 'noopener noreferrer' : undefined}
    focus="boxShadow"
    css={{
      display: 'inline-block',
      width: '36px',
      height: '36px',
      padding: '3px',
      borderRadius: '50%',
      // cast as any b/c of Stitches bug: https://github.com/modulz/stitches/issues/407
      ...(css as any),
    }}
  >
    <GitHubLogoIcon
      width="30"
      height="30"
      // scale up the svg icon because it doesn't fill the view box
      // see: https://github.com/radix-ui/icons/issues/73
      style={{ transform: 'scale(1.1278)' }}
    />
  </Button>
);
