# Flow Flation: Walletless PWA on Flow

Flow Flation is a demonstrative game designed for the Flow blockchain, highlighting the power of Progressive Web Apps (PWAs) and walletless interactions.

[**Live Demo**](https://flow-flation.vercel.app/): Visit and install it as a PWA shortcut on your mobile device.

## Game Overview

**Objective:** Inflate the balloon as much as possible without popping it.

- As the balloon is inflated, it enlarges and undergoes color changes.
- Players must be wary of an obscured inflation threshold. Exceeding this limit will burst the balloon.
- Once content with their balloon's state, players can mint it into a non-fungible token (NFT).
- Players can then visualize their collection of balloons.

## Flow PWA Walletless Integration

This section guides you through setting up a basic PWA and integrating walletless onboarding via Magic.

### PWA Setup

1. Create a new PWA application using the React template:
   ```bash
   npx create-react-app name-of-our-PWA-app --template cra-template-pwa

2. In index.js, ensure that serviceWorkerRegistration.unregister(); is set to allow offline capabilities.

3. Build and run the app:
    ```bash
    yarn run build
    npx serve -s build
    ```
    **Tip:** To test on a mobile device, consider utilizing tools like ngrok.

4. Magic Integration for Walletless Onboarding
Create an account at Magic and configure a dedicated application to obtain an API key.
Incorporate the necessary libraries:
    ```bash
    yarn add magic-sdk @magic-ext/flow
    ```
	
    Initialize the Magic instance for Flow:
    ```javscript
    import { Magic } from "magic-sdk";
    import { FlowExtension } from "@magic-ext/flow";
    
    const magic = new Magic(<Your_magic_app_key>, {
      extensions: [
        new FlowExtension({
          rpcUrl: "https://rest-testnet.onflow.org",
          network: "testnet",
        }),
      ],
    });
    
    export default magic;
    ```
    The returned metaData contains user specifics such as address and email.

    Magic offers other authentication avenues like SMS and Social. Explore the official documentation for a comprehensive list.

5. Invoke Flow transactions using FCL (Flow Client Library):
    ```
    import * as fcl from "@onflow/fcl";
    import magic from "../magic";
    
    const AUTHORIZATION_FUNCTION = magic.flow.authorization;
    
    const response = await fcl.send([
      fcl.transaction`
        import NonFungibleToken from 0x631e88ae7f1d7c20
    
        transaction(recipient: Address) {
          prepare(signer: AuthAccount) {
            // transaction logic
          }
          execute {
            // execution logic
          }
        }
      `,
      fcl.args([
        fcl.arg(currentUser.publicAddress, t.Address)
      ]),
      fcl.proposer(AUTHORIZATION_FUNCTION),
      fcl.authorizations([AUTHORIZATION_FUNCTION]),
      fcl.payer(AUTHORIZATION_FUNCTION),
      fcl.limit(9999),
    ]);
    const transactionData = await fcl.tx(response).onceSealed();

