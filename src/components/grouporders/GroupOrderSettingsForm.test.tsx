import { screen, waitFor } from '@testing-library/react';
import { MockedResponse } from '@apollo/client/testing';
import { renderWithProviders } from '../../test-utils';
import GroupOrderSettingsForm from './GroupOrderSettingsForm';
import { GET_ARTIST_NAMES, GET_SIGNINGEVENTS } from '../graphql/queries';
import { emptySettingsForm } from '../../utils/groupOrders';
import { click, type } from './testActions';

const mocks: MockedResponse[] = [
  { request: { query: GET_SIGNINGEVENTS }, result: { data: { signingEvent: [] } } },
  { request: { query: GET_ARTIST_NAMES }, result: { data: { artistNames: [{ name: 'Rebecca Guay', filename: null }] } } },
];

const renderForm = (onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined)) =>
  renderWithProviders(
    <GroupOrderSettingsForm initial={{ ...emptySettingsForm('runner'), name: 'IX run' }} submitLabel="Create draft" onSubmit={onSubmit} />,
    { mocks },
  );


const addArtist = async (name: string) => {
  await type(screen.getByRole('combobox', { name: 'Artist name' }), name);
  await click(screen.getByRole('button', { name: 'Add artist' }));
};

describe('GroupOrderSettingsForm', () => {
  it('requires choosing when participants pay', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderForm(onSubmit);
    await addArtist('Rebecca Guay');
    await click(screen.getByRole('button', { name: 'Create draft' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose when participants pay.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Many steps, each flushed through act, so it needs longer than the 5s default under a full run.
  it('builds the price grid: prices, TBD cells, and cells switched off', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderForm(onSubmit);
    await click(screen.getByRole('button', { name: 'Add type' }));
    await type(screen.getByRole('textbox', { name: 'Signature type 2' }), 'Sketch');
    await addArtist('Rebecca Guay');
    await addArtist('Kaja Foglio');

    await type(screen.getByRole('textbox', { name: 'Rebecca Guay Signature price' }), '5');
    await type(screen.getByRole('textbox', { name: 'Rebecca Guay card cap' }), '10');
    // Kaja copies Guay's row, then switches off the sketch.
    await click(screen.getByRole('button', { name: 'Copy prices to Kaja Foglio from the artist above' }));
    await click(screen.getByRole('button', { name: 'Kaja Foglio Sketch not offered' }));
    expect(screen.getByRole('button', { name: 'Offer Kaja Foglio Sketch' })).toBeInTheDocument();

    await click(screen.getByRole('radio', { name: 'Pay after signing' }));
    await click(screen.getByRole('button', { name: 'Create draft' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const { name, settings } = onSubmit.mock.calls[0][0];
    expect(name).toBe('IX run');
    expect(settings.paymentTiming).toBe('after-signing');
    expect(settings.organizerDiscordName).toBe('runner');
    const sketchId = settings.signatureTypes[1].id;
    expect(settings.signatureTypes).toEqual([{ id: 'sig', label: 'Signature' }, { id: sketchId, label: 'Sketch' }]);
    expect(settings.artists).toEqual([
      // Artists added after the Sketch column get every type, at TBD until priced.
      { name: 'Rebecca Guay', cap: 10, prices: [{ signatureTypeId: 'sig', price: 5 }, { signatureTypeId: sketchId, price: null }] },
      { name: 'Kaja Foglio', cap: null, prices: [{ signatureTypeId: 'sig', price: 5 }] },
    ]);
  }, 20000);

  it("doesn't add the same artist twice", async () => {
    renderForm();
    await addArtist('Rebecca Guay');
    await addArtist('rebecca guay');
    expect(screen.getAllByRole('row', { name: /Rebecca Guay/i })).toHaveLength(1);
  });

  it('shows the server message when saving fails', async () => {
    renderForm(jest.fn().mockRejectedValue(new Error('Rebecca Guay still has cards in this order')));
    await addArtist('Rebecca Guay');
    await click(screen.getByRole('radio', { name: 'Pay upfront' }));
    await click(screen.getByRole('button', { name: 'Create draft' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Rebecca Guay still has cards in this order');
  });
});
