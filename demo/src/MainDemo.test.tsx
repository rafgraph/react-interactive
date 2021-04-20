import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainDemo } from './MainDemo';

describe('renders links to rollpkg', () => {
  const { container } = render(
    <MemoryRouter>
      <MainDemo />
    </MemoryRouter>,
  );
  const links = container.getElementsByTagName('a');
  const hrefs = Object.values(links).map((link) => link.getAttribute('href'));

  test('renders link to react interactive', () => {
    expect(hrefs).toContain('https://github.com/rafgraph/react-interactive');
  });
});
