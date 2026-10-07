import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FilterChip from './FilterChip';
import GlowPill from './GlowPill';
import MonoLabel from './MonoLabel';
import SegmentedControl from './SegmentedControl';
import Slab from './Slab';

describe('SegmentedControl', () => {
  const Harness = () => {
    const [value, setValue] = useState<'all' | 'week' | 'month'>('all');
    return (
      <SegmentedControl
        aria-label="Date range"
        value={value}
        onChange={setValue}
        options={[
          { value: 'all', label: 'All' },
          { value: 'week', label: 'This week', shortLabel: 'Week' },
          { value: 'month', label: 'This month' },
        ]}
      />
    );
  };

  it('marks the selected segment and changes on click', () => {
    render(<Harness />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(radios[2]);
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('moves selection with arrow keys and wraps around', () => {
    render(<Harness />);
    const radios = screen.getAllByRole('radio');
    fireEvent.keyDown(radios[0], { key: 'ArrowLeft' });
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[2]).toHaveFocus();
    fireEvent.keyDown(radios[2], { key: 'ArrowRight' });
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('only the selected segment is in the tab order', () => {
    render(<Harness />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map(r => r.tabIndex)).toEqual([0, -1, -1]);
  });
});

describe('FilterChip', () => {
  it('exposes pressed state and the count suffix', () => {
    const onClick = jest.fn();
    render(<FilterChip active count={2} onClick={onClick}>Filters</FilterChip>);
    const chip = screen.getByRole('button', { name: 'Filters · 2' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('omits aria-pressed for dropdown chips and hides a zero count', () => {
    render(<FilterChip dropdown count={0} aria-haspopup="menu">Location</FilterChip>);
    const chip = screen.getByRole('button', { name: 'Location' });
    expect(chip).not.toHaveAttribute('aria-pressed');
    expect(chip).toHaveAttribute('aria-haspopup', 'menu');
  });
});

describe('GlowPill', () => {
  it('renders an internal link when given `to`', () => {
    render(
      <MemoryRouter>
        <GlowPill to="/calendar/42">Signing at MagicCon in 3 days →</GlowPill>
      </MemoryRouter>
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/calendar/42');
  });

  it('renders an external link in a new tab when given `href`', () => {
    render(<GlowPill href="https://example.com">Event site</GlowPill>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders plain text when not interactive', () => {
    render(<GlowPill variant="onArt">Oct 21</GlowPill>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Oct 21')).toBeInTheDocument();
  });
});

describe('Slab', () => {
  it('shows the caption and badges', () => {
    render(<Slab src="/art.jpg" alt="Seb McKinnon art" title="Seb McKinnon" meta="Montréal, QC" topLeft={<span>badge</span>} />);
    expect(screen.getByText('Seb McKinnon')).toBeInTheDocument();
    expect(screen.getByText('Montréal, QC')).toBeInTheDocument();
    expect(screen.getByText('badge')).toBeInTheDocument();
  });

  it('removes a broken image so only the striped placeholder remains', () => {
    render(<Slab src="/missing.jpg" alt="Missing art" />);
    fireEvent.error(screen.getByAltText('Missing art'));
    expect(screen.queryByAltText('Missing art')).toBeNull();
  });

  it('renders no image when src is absent', () => {
    render(<Slab alt="none" />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('MonoLabel', () => {
  it('renders with the requested element', () => {
    render(<MonoLabel component="h2">Artist info</MonoLabel>);
    expect(screen.getByRole('heading', { name: 'Artist info' })).toBeInTheDocument();
  });
});
