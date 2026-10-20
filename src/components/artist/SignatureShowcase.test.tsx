import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignatureShowcase from './SignatureShowcase';
import { EMPTY_SIGNATURE_IMAGE } from '../../utils/signatureExamples';

const examples = [
  { id: 'a', imageUrl: 'https://cdn.test/a.jpg', label: 'Regular' },
  { id: 'b', imageUrl: 'https://cdn.test/b.jpg', label: 'Shadow' },
  { id: 'c', imageUrl: 'https://cdn.test/c.jpg', label: 'Sketch' },
];

describe('SignatureShowcase', () => {
  it('shows the empty card frame when there are no examples', () => {
    render(<SignatureShowcase artistName="Jane" examples={[]} />);
    expect(screen.getByRole('heading', { name: 'Example signature' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No signature example for Jane yet' })).toHaveAttribute('src', EMPTY_SIGNATURE_IMAGE);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows a single example without thumbnails', () => {
    render(<SignatureShowcase artistName="Jane" examples={[examples[2]]} />);
    expect(screen.getByRole('img', { name: 'Jane signature example: Sketch' })).toHaveAttribute('src', examples[2].imageUrl);
    expect(screen.getByText('Sketch')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('does not repeat the heading for a lone "Signature" example', () => {
    render(<SignatureShowcase artistName="Jane" examples={[{ ...examples[0], label: 'Signature' }]} />);
    expect(screen.queryByText('Signature')).not.toBeInTheDocument();
  });

  it('switches the main slab when a thumbnail is picked', async () => {
    render(<SignatureShowcase artistName="Jane" examples={examples} />);
    expect(screen.getByRole('heading', { name: 'Example signatures' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Jane signature example: Regular' })).toHaveAttribute('src', examples[0].imageUrl);
    expect(screen.getByRole('button', { name: 'Regular' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Shadow' }));

    expect(screen.getByRole('img', { name: 'Jane signature example: Shadow' })).toHaveAttribute('src', examples[1].imageUrl);
    expect(screen.getByRole('button', { name: 'Shadow' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Regular' })).toHaveAttribute('aria-pressed', 'false');
  });
});
