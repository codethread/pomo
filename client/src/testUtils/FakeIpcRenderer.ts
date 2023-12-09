/* eslint-disable class-methods-use-this,@typescript-eslint/no-explicit-any */
import { IpcRenderer } from 'electron';
import { EventEmitter } from 'events';
import { FakeIpcMain } from '@test/FakeIpcMain';

export class FakeIpcRenderer extends EventEmitter implements IpcRenderer {
  constructor(private readonly mockIpcMain: FakeIpcMain) {
    super();
    mockIpcMain.linkRenderer(this);
  }

  public send(channel: string, ...args: any[]): void {
    // a little massaging to use the builtin eventEmitter to send the message to our mock
    const ipcMainEvent = null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.mockIpcMain.emit(channel, ipcMainEvent, ...args);
  }

  public async invoke(channel: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.on(`${channel}-reply`, (res) => {
        this.removeAllListeners(`${channel}-reply`);
        this.removeAllListeners(`${channel}-reply-fail`);
        resolve(res);
      });

      this.on(`${channel}-reply-fail`, (e) => {
        this.removeAllListeners(`${channel}-reply`);
        this.removeAllListeners(`${channel}-reply-fail`);
        reject(e);
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.mockIpcMain.emit(channel, ...args);
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public postMessage(_: string, __: any, ___?: MessagePort[]): void {
    throw new Error('method not yet mocked');
  }

  public sendSync(_: string, ...__: any[]): any {
    throw new Error('method not yet mocked');
  }

  public sendTo(_: number, __: string, ...___: any[]): void {
    throw new Error('method not yet mocked');
  }

  public sendToHost(_: string, ...__: any[]): void {
    throw new Error('method not yet mocked');
  }
}
