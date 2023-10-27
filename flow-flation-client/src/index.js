import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import CurrentUserProvider from "./context/currentUserProvider";
import { init } from "@onflow/fcl-wc";
import * as fcl from "@onflow/fcl";
import PWAPrompt from "react-ios-pwa-prompt";

fcl.config({
  "flow.network": "testnet",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": `https://fcl-discovery.onflow.org/testnet/authn`,
});

const WALLET_CONNECT_PROJECT_ID =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;

init({
  projectId: WALLET_CONNECT_PROJECT_ID,
  metadata: {
    name: "Inflation",
    description: "The best Flow blockchain educational resource of all time.",
    url: "https://flow-inflation.vercel.app/",
    icons: ["https://cryptologos.cc/logos/flow-flow-logo.png"],
  },
  includeBaseWC: true,
  wallets: [],
  wcRequestHook: null,
  pairingModalOverride: null,
}).then(({ FclWcServicePlugin }) => {
  fcl.pluginRegistry.add(FclWcServicePlugin);
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CurrentUserProvider>
      <PWAPrompt
        timesToShow={100}
        promptOnVisit={1}
        copyClosePrompt="Close"
        permanentlyHideOnDismiss={false}
      />
      <App />
    </CurrentUserProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
