import { render, screen } from '@testing-library/react';
import App from './App';

test('shows loading indicator', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Loading activities.../i);
  expect(loadingElement).toBeInTheDocument();
});
