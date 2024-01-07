# Pomo 🍅

Simple Pomodoro timer, with integrations such as Slack, to politely mute your notifications and let
your colleagues know when you'll be back

## Usage

**🚧 Currently in Beta**

_MacOS only right now_

To use the app, head to the [Releases](https://github.com/codethread/pomo/releases) and grab the
`.dmg` or `arm64.dmg` file, depending on whether you've got an intel or arm chip (`assets` is a
dropdown, see screenshot below, the `version` number may change, but you get the idea).

There are many small features to add and these are tracked on the
[Roadmap](https://github.com/codethread/pomo/projects/1)

Please
[raise any bugs or request any features here](https://github.com/codethread/pomo/issues/new/choose).

![image](https://user-images.githubusercontent.com/10004500/128321790-3ff8d2e2-4e39-41f9-90d5-571b7af72605.png)

### Slack Integration

If you want to use the slack settings, you can go to the settings in the Pomo app, (the button at
the top left takes you there), and then you’ll see a form to add the relevant credentials:

- a slack token: go to https://my.slack.com/customize, open your browser devTools and copy what you
  get from typing `TS.boot_data.api_token`

  _you can copy and paste this into the browser console, then click the page to automate this_  
  **always** check you understand what you are running when you paste code to your browser console

  ```javascript
  document.body.addEventListener('click', () => {
    navigator.clipboard.writeText(TS.boot_data.api_token).then(
      () => {
        alert('saved to clipboard');
      },
      (e) => alert('failed', e.message)
    );
  });
  ```

  \*tested in chrome

- a 'd' cookie: to get the cookies, you can go to slack in the browser (like any normal chat window,
  not the customise page) and grab the `d` and `d-s` cookies
- a 'd-s' cookie: as above.

![image](https://user-images.githubusercontent.com/10004500/128473497-ade85352-52f0-4546-a35c-33d3d0ed42bb.png)

## Contributing

_Pomo is not yet ready for contribution, but once V1 is released, all contributions will be welcome,
and the approach to making changes will be very clear_

Pomo is a [tauri](https://tauri.app/) app built using:

- [Typescript](https://www.typescriptlang.org/) throughout (with very strict settings)
- [React](https://reactjs.org/) for the GUI
- [Xstate](https://xstate.js.org/docs/) for state management
- Github actions for CI

Install a node manager of your choice (volta is supported and recommended)

Install Dependencies

```bash
pnpm install
pnpm machine
```

Run the tauri app and client locally

```bash
pnpm dev
```

Some other useful commands

| command        | description                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm clean`   | [**aggressive**] remove all files not recognised by git, then install all dependencies                                                                                                                     |
| `pnpm machine` | generate types for the xstate machines (this should be re-run when updating the models or machines                                                                                                         |
| `pnpm dev`     | run the project locally in watch mode, both in browser and electron                                                                                                                                        |
| `pnpm lint`    | use eslint to check source code in the repo for errors                                                                                                                                                     |
| `pnpm test`    | use [ts-jest](https://kulshekhar.github.io/ts-jest/) to run the project's unit tests. This will also compile via [typescript](https://www.typescriptlang.org/) to check for type errors as part of ts-jest |
| `pnpm build`   | build the project for production and e2e testing (no the same as the release script)                                                                                                                       |
| `pnpm checks`  | runs the full checklist of lint, test, build and e2e                                                                                                                                                       |
| `pnpm release` | see [releasing wiki](https://github.com/codethread/pomo/wiki/Releasing) for information                                                                                                                    |

## License

[MIT](https://choosealicense.com/licenses/mit/)
