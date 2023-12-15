import { render, screen } from '@client/testHelpers/rtl';
import { InputText } from './InputText';
import userEvent from '@testing-library/user-event';

test('it works', async () => {
  const spy = vi.fn();

  await render(<InputText id="my button" onChange={spy} />);

  expect(spy).not.toHaveBeenCalled();
  await userEvent.type(screen.getByRole('textbox'), 'hello');

  screen.getByDisplayValue('hello');
  expect(spy).toHaveBeenCalledTimes(5);
});
