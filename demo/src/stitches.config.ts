import { createStyled } from '@stitches/react';

export const { styled, css } = createStyled({
  prefix: '',
  tokens: {
    colors: {
      $pageBackground: 'rgb(240,240,240)',
      $highContrast: 'rgb(0,0,0)',
      $lowContrast: 'rgb(128,128,128)',
      $green: 'rgb(0,168,0)',
    },
  },
  breakpoints: {},
  utils: {},
});

export const darkThemeClass = css.theme({
  colors: {
    $pageBackground: 'rgb(32,32,32)',
    $highContrast: 'rgb(192,192,192)',
    $lowContrast: 'rgb(136,136,136)',
    $green: 'rgb(0,168,0)',
  },
});

export const globalStyles = css.global({
  'button, input': {
    all: 'unset',
  },
  'body, div, span, a, p, h1, h2, h3, code, button, form, input': {
    margin: 0,
    border: 0,
    padding: 0,
    boxSizing: 'inherit',
    font: 'inherit',
    fontWeight: 'inherit',
    textDecoration: 'inherit',
    textAlign: 'inherit',
    color: 'inherit',
    background: 'transparent',
  },
  html: {
    height: '100%',
  },
  body: {
    height: '100%',
    color: '$highContrast',
    fontFamily: 'system-ui, Helvetica Neue, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    fontSize: '16px',
    boxSizing: 'border-box',
    textSizeAdjust: 'none',
  },
  '#root': {
    minHeight: '100%',
    backgroundColor: '$pageBackground',
  },
});
