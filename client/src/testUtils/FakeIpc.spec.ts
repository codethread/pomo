import { FakeIpcMain } from '@test/FakeIpcMain';
import { FakeIpcRenderer } from '@test/FakeIpcRenderer';

describe('fake ipc', () => {
  it('should throw an error for unmocked methods', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mockIpcMain = new FakeIpcMain();
    const mockIpcRenderer = new FakeIpcRenderer(mockIpcMain);

    const myFunc = () => {};
    expect(() => mockIpcMain.handleOnce('foo', myFunc)).toThrowErrorMatchingInlineSnapshot(
      `"method not yet mocked"`
    );

    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenLastCalledWith('foo', myFunc);

    expect(() => mockIpcMain.removeHandler('bar')).toThrowErrorMatchingInlineSnapshot(
      `"method not yet mocked"`
    );

    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenLastCalledWith('bar', undefined);

    expect(() => mockIpcRenderer.postMessage('', null)).toThrowErrorMatchingInlineSnapshot(
      `"method not yet mocked"`
    );
    expect(() => mockIpcRenderer.sendSync('')).toThrowErrorMatchingInlineSnapshot(
      `"method not yet mocked"`
    );
    expect(() => mockIpcRenderer.sendTo(0, '')).toThrowErrorMatchingInlineSnapshot(
      `"method not yet mocked"`
    );
    expect(() => mockIpcRenderer.sendToHost('')).toThrowErrorMatchingInlineSnapshot(
      `"method not yet mocked"`
    );
  });

  it('should send and receive messages from Renderer to Main', () => {
    const mockIpcMain = new FakeIpcMain();
    const mockIpcRenderer = new FakeIpcRenderer(mockIpcMain);

    const spy = jest.fn();
    mockIpcMain.on('foo', spy);

    mockIpcRenderer.send('fake-news', 'trump');
    mockIpcRenderer.send('foo', 'bacon');
    mockIpcRenderer.send('foo', 'cheese');

    // null here for now as we don't need the ipcMainEvent, and it can be null
    expect(spy).not.toHaveBeenCalledWith(null, 'trump');
    expect(spy).toHaveBeenCalledWith(null, 'bacon');
    expect(spy).toHaveBeenCalledWith(null, 'cheese');
  });

  it('should invoke and handle messages from Renderer to Main', async () => {
    const mockIpcMain = new FakeIpcMain();
    const mockIpcRenderer = new FakeIpcRenderer(mockIpcMain);

    mockIpcMain.handle('foo', async (_, msg) => Promise.resolve(`${msg as string} sandwich`));

    expect(await mockIpcRenderer.invoke('foo', 'bacon')).toBe('bacon sandwich');
    expect(await mockIpcRenderer.invoke('foo', 'cheese')).toBe('cheese sandwich');
  });

  it('should invoke and handle errors from Renderer to Main', async () => {
    const mockIpcMain = new FakeIpcMain();
    const mockIpcRenderer = new FakeIpcRenderer(mockIpcMain);

    mockIpcMain.handle('foo', async () => Promise.reject(new Error('oh no!')));

    expect(mockIpcRenderer.invoke('foo', 'bacon')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"oh no!"`
    );
  });
});
