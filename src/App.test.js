import { render, screen } from '@testing-library/react';
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

import App from './App';

test('renders login page by default', () => {
  render(<App />);
  const welcomeHeading = screen.getByText(/welcome back/i);
  expect(welcomeHeading).toBeInTheDocument();
});
