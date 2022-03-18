import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Hello World text', () => {
  render(<App />);
  expect(screen.getByText('TigerGraph Hello World App')).toBeInTheDocument();
});
