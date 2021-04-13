import { Interactive } from 'react-interactive';
import { SunIcon } from '@modulz/radix-icons';
import { styled } from './stitches.config';

interface InteractiveButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
}
const InteractiveButton: React.VFC<InteractiveButtonProps> = ({
  onClick,
  className,
  children,
}) => (
  <Interactive as="button" className={className} onClick={onClick}>
    {children}
  </Interactive>
);
export const ButtonBase = styled(InteractiveButton, {
  color: '$highContrast',
  '&.hover, &.active': {
    color: '$green',
  },
  '&.focusFromKey': {
    outline: '2px solid $colors$green',
    outlineOffset: '2px',
  },
});

interface InteractiveCheckboxProps {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  className?: string;
}
const InteractiveCheckbox: React.VFC<InteractiveCheckboxProps> = ({
  checked,
  onChange,
  disabled,
  className,
}) => (
  <Interactive
    as="input"
    type="checkbox"
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    className={className}
  />
);
export const CheckboxBase = styled(InteractiveCheckbox, {
  appearance: 'checkbox',
  '&.focusFromKey': {
    outline: '2px solid $colors$green',
    outlineOffset: '1px',
  },
});

interface InteractiveLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}
const InteractiveLink: React.VFC<InteractiveLinkProps> = ({
  href,
  className,
  children,
}) => {
  return (
    <Interactive
      as="a"
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Interactive>
  );
};
export const Link = styled(InteractiveLink, {
  color: '$highContrast',
  borderBottom: '1px dotted $colors$green',
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
        '&.hover, &.active': {
          color: '$highContrast',
        },
      },
    },
  },
});

interface DarkModeButtonBaseProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
const DarkModeButtonBase: React.VFC<DarkModeButtonBaseProps> = ({
  onClick,
  className,
}) => (
  <ButtonBase className={className} onClick={onClick}>
    <SunIcon width="30" height="30" />
  </ButtonBase>
);
export const DarkModeButton = styled(DarkModeButtonBase, {
  width: '30px',
  height: '30px',
});
