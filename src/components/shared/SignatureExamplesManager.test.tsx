import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import SignatureExamplesManager from './SignatureExamplesManager';
import {
  ADD_SIGNATURE_EXAMPLE,
  REMOVE_SIGNATURE_EXAMPLE,
  REORDER_SIGNATURE_EXAMPLES,
  UPDATE_SIGNATURE_EXAMPLE,
} from '../graphql/mutations';

// jsdom has no canvas, so skip the resize step. Plain functions, not jest.fn:
// CRA's resetMocks would clear a mock implementation before each test.
jest.mock('../../utils/signatureExamples', () => ({
  ...jest.requireActual('../../utils/signatureExamples'),
  prepareSignatureImage: async () => ({ base64Data: 'data:image/jpeg;base64,AAAA', contentType: 'image/jpeg' }),
}));

const examples = [
  { id: 'e1', imageUrl: 'https://cdn.test/1.jpg', label: 'Regular' },
  { id: 'e2', imageUrl: 'https://cdn.test/2.jpg', label: 'Sketch' },
];

const result = (field: string, list: typeof examples, extra: Record<string, unknown> = {}) => ({
  data: { [field]: { id: 'a1', signatureExamples: list, ...extra } },
});

function renderManager(mocks: MockedResponse[], list = examples) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <SignatureExamplesManager artistId="a1" examples={list} />
    </MockedProvider>,
  );
}

beforeAll(() => {
  global.URL.createObjectURL = () => 'blob:preview';
  global.URL.revokeObjectURL = () => {};
});

describe('SignatureExamplesManager', () => {
  it('uploads a new example with a label', async () => {
    const added = [...examples, { id: 'e3', imageUrl: 'https://cdn.test/3.jpg', label: 'Shadow' }];
    const addMock: MockedResponse = {
      request: {
        query: ADD_SIGNATURE_EXAMPLE,
        variables: { artistId: 'a1', label: 'Shadow', base64Data: 'data:image/jpeg;base64,AAAA', contentType: 'image/jpeg' },
      },
      newData: jest.fn(() => result('addSignatureExample', added)),
    };
    const { container } = renderManager([addMock]);

    const addButton = screen.getByRole('button', { name: 'Add example' });
    expect(addButton).toBeDisabled();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, new File(['x'], 'sig.png', { type: 'image/png' }));
    await userEvent.type(screen.getByRole('combobox', { name: 'Signature type' }), 'Shadow');
    await userEvent.click(addButton);

    await waitFor(() => expect(addMock.newData).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Signature type' })).toHaveValue(''));
  });

  it('renames an example on blur', async () => {
    const updateMock: MockedResponse = {
      request: { query: UPDATE_SIGNATURE_EXAMPLE, variables: { artistId: 'a1', exampleId: 'e2', label: 'Doodle' } },
      newData: jest.fn(() => result('updateSignatureExample', [examples[0], { ...examples[1], label: 'Doodle' }])),
    };
    renderManager([updateMock]);

    const field = screen.getByRole('textbox', { name: 'Label for Sketch' });
    await userEvent.clear(field);
    await userEvent.type(field, 'Doodle{Enter}');

    await waitFor(() => expect(updateMock.newData).toHaveBeenCalled());
  });

  it('moves an example down', async () => {
    const reorderMock: MockedResponse = {
      request: { query: REORDER_SIGNATURE_EXAMPLES, variables: { artistId: 'a1', exampleIds: ['e2', 'e1'] } },
      newData: jest.fn(() => result('reorderSignatureExamples', [examples[1], examples[0]])),
    };
    renderManager([reorderMock]);

    expect(screen.getByRole('button', { name: 'Move Regular up' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Move Regular down' }));

    await waitFor(() => expect(reorderMock.newData).toHaveBeenCalled());
  });

  it('removes an example after confirming, and shows API errors', async () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const removeMock: MockedResponse = {
      request: { query: REMOVE_SIGNATURE_EXAMPLE, variables: { artistId: 'a1', exampleId: 'e1' } },
      result: { errors: [new GraphQLError('Signature example not found.')] },
    };
    renderManager([removeMock]);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Regular' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove Regular' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Signature example not found.');
    confirm.mockRestore();
  });

  it('locks renaming and reordering for the unsaved legacy photo', () => {
    renderManager([], [{ id: 'legacy-jane', imageUrl: 'https://cdn.test/signatures/jane.jpg', label: 'Signature' }]);
    expect(screen.getByRole('textbox', { name: 'Label for Signature' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Signature' })).toBeEnabled();
    expect(screen.getByText(/renamed or reordered once you add another/)).toBeInTheDocument();
  });

  it('hides the add row at the limit', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ id: `e${i}`, imageUrl: `https://cdn.test/${i}.jpg`, label: `Type ${i}` }));
    renderManager([], many);
    expect(screen.queryByRole('button', { name: 'Add example' })).not.toBeInTheDocument();
    expect(screen.getByText(/maximum of 8/)).toBeInTheDocument();
  });
});
