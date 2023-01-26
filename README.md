## Project setup/settings

Some helpful configurations for the project

### Setup autoformatting using Prettier

We have rules which are defined in the `.prettierre.json` file. These rules should work when code is saved.

Please set up it accordingly this topic: [https://prettier.io/docs/en/editors.html](https://prettier.io/docs/en/editors.html).

### Create environment file

Copy `.env.example` file and paste as `.env` file. Make changes if necessary.

**Note: Without this environment file requests to server would not work.**

### Setup nvm

- Install [nvm](https://github.com/nvm-sh/nvm), for windows you can use [nvm-windows](https://github.com/coreybutler/nvm-windows)
- Run `nvm use` in terminal
- Now you can use `npm i` or `npm ci` with higher confidence

Note: for advance usage and better DX, setup automatic detection of `.nvmrc` config,
e.g. explore this [post](https://stackoverflow.com/questions/23556330/run-nvm-use-automatically-every-time-theres-a-nvmrc-file-on-the-directory)


---
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run prepare`

**Note: run this once!**

Creates configuration files for git hooks to work.
