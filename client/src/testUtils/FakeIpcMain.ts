/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain, IpcMainInvokeEvent, IpcRenderer } from '@electron/electron';
import { EventEmitter } from 'events';

export class FakeIpcMain extends EventEmitter implements IpcMain {
  // setup in IpcRenderer constructor
  private renderer!: IpcRenderer;

  public linkRenderer(renderer: IpcRenderer): void {
    this.renderer = renderer;
  }

  public handle(
    channel: string,
    listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>
  ): void {
    const mainInvokeEvent = {} as IpcMainInvokeEvent;

    this.on(channel, (...args) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      listener(mainInvokeEvent, ...args)
        .then((res) => {
          this.renderer.emit(`${channel}-reply`, res);
        })
        .catch((e: Error) => {
          this.renderer.emit(`${channel}-reply-fail`, new Error(e.message));
        });
    });
  }

  public handleOnce(
    channel: string,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
  ): void {
    this.noop(channel, listener);
  }

  public removeHandler(channel: string): void {
    this.noop(channel);
  }

  // eslint-disable-next-line class-methods-use-this
  private noop(
    channel: string,
    listener?: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
  ): void {
    // eslint-disable-next-line no-console
    console.warn(channel, listener);
    throw new Error('method not yet mocked');
  }
}
