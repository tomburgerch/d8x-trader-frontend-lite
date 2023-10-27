# Development

## Quantena testnet deployments

- Stable version: https://app.testnet.d8x.exchange/
- Development version: https://dev.testnet.d8x.exchange/

## Project setup/settings

This package is configured entirely via environment variables. You must specify:

- VITE_PROJECT_ID: Head over to [WalletConnect Cloud](https://cloud.walletconnect.com/) to sign in or sign up. Create (or use an existing) project and copy its associated project id.
  - Example:
    `VITE_PROJECT_ID=yourprojectid`
- VITE_API_URL: A semicolon separated list of endpoints served by your main REST API service.
  - For example, you could be hosting two main API services for two different chains, one at `https://api.mybackend.com` for Polygon zkEVM (chain ID 1101) and one at `https://api.test.mybackend.com` for Polygon zkEVM Testnet (chain ID 1442).
  - You must also define a default chain for your frontend, in this example it's mainnet (1101)
  - This entry should then take the form:
    `VITE_API_URL=1101::https://api.mybackend.com;1442::https://api.test.mybackend.com;default::https://api.mybackend.com`
- VITE_HISTORY_URL: A semicolon separated list of endpoints served by the History API service.
  - In line with the example above, you may be hosting the frontend on two different networks, Polyon zkEVM and Polygon zkEVM Testnet, using URLS `https://history.mybackend.com` and `https://history.test.mybackend.com`, respectively, with mainnet being your default landing page.
  - Then you would define
    `VITE_HISTORY_URL=1101::https://history.mybackend.com;1442::https://history.test.mybackend.com;default::https://history.mybackend.com`
- VITE_WEBSOCKET_URL: A semicolon separated list of endpoints served by the price Websocket service.
  - For example, you may be hosting `wss://ws.mybackend.com` for Polygon zkEVM and `wss://ws.test.mybackend.com` for Polygon zkEVM Testnet, again with Mainnet as default.
  - Then you would set this variable as
    `VITE_WEBSOCKET_URL=1101::wss://ws.mybackend.com/;1442::wss://ws.test.mybackend.com/;default::wss://ws.mybackend.com/`
- VITE_CANDLES_WEBSOCKET_URL: The URL of the candles service.
  - This service can be shared by different chains, but it adheres to the same notation as the previous two. If you are hosting this service at `wss://candles.mybackend.com`, then you would set this variable as
    `VITE_CANDLES_WEBSOCKET_URL=default::wss://candles.mybackend.com/`

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

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

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

### `npm run preview`

Starts a local web server that serves the built solution from `./build` folder for preview.

### `npm run prepare`

**Note: run this once!**

Creates configuration files for git hooks to work.

Note 1: In case `.husky/pre-commit` file is not created, run this command:

```
npx husky add .husky/pre-commit "npm run lint:staged"
```

Note 2: In case the `.husky/pre-commit` hook was ignored because it's not set as executable, run this command:

```
chmod ug+x .husky/*
```

---

# Branding the Frontend Kit

## Logo

### Header logo
A default interactive logo is contained in `src/assets/interactive-logo`

The interactive logo is used as **InteractiveLogo** in:  
- `src/components/header/EmptyHeader.tsx`
- `src/components/header/Header.tsx`
- `src/components/position-table/elements/modals/share-modal/ShareModal.tsx`

You can modify the interactive logo.

You can also add an svg file in `assets/interactive-logo` and import it as ReactComponent in the three files mentioned above. 

### Footer logo
A default static logo is contained in `src/assets/logo.svg`

You can update the svg file. 

## Colors & Color scheme
By default the FE supports a light and a dark color theme

### How to modify existing themes
Colors are defined in scss files in `src/styles`
- colors.scss (default theme)
- darkColors.scss (dark theme)

### Colors for TradingView chart
- Lightweight Trading view chart: `src/components/trading-view-chart/elements/chart-block/ChartBlock.tsx`
- Pro Trading view chart: `public/charting-lib-styles`

## Fonts
Fonts can be specified in `src/styles/theme/index.scss`

## Background
By default the FE has a mobile, a tablet and a desktop background. The background is handled by `src/components/static-background/StaticBackground.tsx`

### Mobile & Tablet background
The **MobileBackground** component is by default used for both the mobile and the table version of the FE. You can update the svg in `assets/background/mobile-background.svg`

You can also differentiate mobile from tablet background by:
- adding a second svg into `assets/background`
- importing that svg as a **TabletBackground** component into `StaticBackground.tsx`
- replacing **MobileBackground** by **TabletBackground** in the `if (isTablet)` statement

### Desktop Background
For desktop, the background is handled by the imported styles from `./StaticBackground.module.scss`

## PnL Poster
Backgrounds of the  PnL poster are color scheme specific and are stored in `src/assets/pnl-poster`

## Advanced styling options
Global styles are defined in `src/styles/theme/theme.ts` and in `index.scss`

Local styles are defined in corresponing components
