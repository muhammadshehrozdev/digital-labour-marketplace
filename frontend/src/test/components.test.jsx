// Component library: keyboard use, focus, ARIA states (Batch 1 Part 4 and 9.3).
import { describe, test, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Trash2 } from 'lucide-react';
import { Button, Combobox, Dialog, IconButton, PasswordField, Stepper, StatusChip, TextArea, TextField, ToastProvider, useToast } from '../components/ui';
import { MemoryRouter } from 'react-router-dom';

describe('form fields', () => {
  test('label above, hint and error linked with aria-describedby, aria-invalid, required marker', () => {
    render(<TextField label="City" required hint="Where you work" error="Please write your city." />);
    const input = screen.getByLabelText(/^City/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Please write your city. Where you work');
    expect(screen.getByText('(required)')).toBeInTheDocument();
  });

  test('TextArea shows a live counter; urdu fields get dir="auto"', () => {
    render(<TextArea label="About" maxLength={10} value="abc" onChange={() => {}} urdu />);
    expect(screen.getByText('3/10')).toBeInTheDocument();
    expect(screen.getByLabelText('About')).toHaveAttribute('dir', 'auto');
  });

  test('PasswordField: show/hide toggle with a pressed state and the passphrase hint', async () => {
    render(<PasswordField />);
    const input = screen.getByLabelText(/^Password/);
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('15+ characters; a sentence you remember works well')).toBeInTheDocument();
  });
});

describe('buttons', () => {
  test('loading keeps the label for screen readers, disables, and sets aria-busy', () => {
    render(<Button loading>Save</Button>);
    const b = screen.getByRole('button', { name: 'Save' });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute('aria-busy', 'true');
  });

  test('IconButton always has an accessible name', () => {
    render(<IconButton label="Delete item" icon={Trash2} />);
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument();
  });
});

describe('Combobox (keyboard)', () => {
  test('type to filter, ArrowDown + Enter selects, Escape closes', async () => {
    const onSelect = vi.fn();
    render(<Combobox label="Skill" onSelect={onSelect} options={[{ value: 'a', label: 'House wiring' }, { value: 'b', label: 'Geyser installation' }, { value: 'c', label: 'House cleaning' }]} />);
    const user = userEvent.setup();
    const input = screen.getByRole('combobox', { name: 'Skill' });
    await user.type(input, 'house');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(2);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith({ value: 'c', label: 'House cleaning' });
    expect(input).toHaveValue('');
    await user.type(input, 'g');
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Dialog', () => {
  function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Open it</button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Example dialog"><p>Body</p></Dialog>
      </>
    );
  }

  test('Escape closes it and focus returns to the button that opened it', async () => {
    render(<Demo />);
    const user = userEvent.setup();
    const opener = screen.getByRole('button', { name: 'Open it' });
    await user.click(opener);
    expect(screen.getByRole('dialog', { name: 'Example dialog' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Body')).toBeNull();
    expect(opener).toHaveFocus();
  });

  test('the close button has a name', async () => {
    render(<Demo />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Open it' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Body')).toBeNull();
  });
});

describe('Stepper and status', () => {
  test('current step has aria-current="step"; done steps say "(done)"; compact text for phones', () => {
    render(<Stepper steps={[{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }]} current="b" completed={['a']} />);
    expect(screen.getByText('Two', { selector: 'span' }).closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('(done)')).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
  });

  test('status chips always use words (not colour alone), including the Module 3 skill states', () => {
    render(<MemoryRouter><StatusChip kind="skill" status="verified" /><StatusChip kind="skill" status="disputed" /><StatusChip kind="identity" status="Pending" /></MemoryRouter>);
    expect(screen.getByText('Verified by evidence')).toBeInTheDocument();
    expect(screen.getByText('Disputed')).toBeInTheDocument();
    expect(screen.getByText('Identity pending review')).toBeInTheDocument();
  });
});

describe('Toast', () => {
  function ToastDemo() {
    const toast = useToast();
    return <button type="button" onClick={() => toast.show({ title: 'Saved' })}>Save</button>;
  }
  test('appears in an aria-live="polite" region and can be dismissed', async () => {
    render(<ToastProvider><ToastDemo /></ToastProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const status = screen.getByRole('status');
    expect(status.parentElement).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Saved');
    await user.click(screen.getByRole('button', { name: 'Dismiss message' }));
    expect(screen.queryByText('Saved')).toBeNull();
  });
});
