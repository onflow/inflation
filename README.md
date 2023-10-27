# Inflation: Walletless PWA on Flow

Inflation is a demonstrative game designed for the Flow blockchain, highlighting the power of Progressive Web Apps (PWAs) and walletless interactions.

[**Live Demo**](https://flation.vercel.app/): Visit and install it as a PWA shortcut on your mobile device.

## Game Overview

**Objective:** Inflate the balloon as much as possible without popping it.

- As the balloon is inflated, it enlarges and undergoes color changes.
- Players must be wary of an obscured inflation threshold. Exceeding this limit will burst the balloon.
- Once content with their balloon's state, players can mint it into a non-fungible token (NFT).
- Players can then visualize their collection of balloons.
<div align="center">
  <img src="https://i.imgur.com/UWsMOav.png" width="200" height="400">
  <img src="https://i.imgur.com/9A0CrlE.png" width="200" height="400">
</div>

## Flow PWA Walletless Quickstart

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
    yarn add magic-sdk @magic-ext/flow @onflow/fcl
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
    The returned metadata contains user specifics such as address and email.

    Magic offers other authentication avenues like SMS and Social. Explore the official documentation for a comprehensive list.

5. Invoke Flow transactions/scripts using FCL (Flow Client Library):
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
    

## Account Linking and WalletConnect Quickstart

This section guides you through setting up account linking and WalletConnect.

### Account Linking Setup
1. You can view the hybrid custody contracts [here](https://github.com/onflow/hybrid-custody)
2. Below is the Cadence transaction to connect a parent account
	```
          #allowAccountLinking
  
          import HybridCustody from 0x294e44e1ec6993c6
          
          import CapabilityFactory from 0x294e44e1ec6993c6
          import CapabilityDelegator from 0x294e44e1ec6993c6
          import CapabilityFilter from 0x294e44e1ec6993c6
          
          import MetadataViews from 0x631e88ae7f1d7c20
          
          transaction(parentFilterAddress: Address?, childAccountFactoryAddress: Address, childAccountFilterAddress: Address) {
              prepare(childAcct: AuthAccount, parentAcct: AuthAccount) {
                  // --------------------- Begin setup of child account ---------------------
                  var acctCap = childAcct.getCapability<&AuthAccount>(HybridCustody.LinkedAccountPrivatePath)
                  if !acctCap.check() {
                      acctCap = childAcct.linkAccount(HybridCustody.LinkedAccountPrivatePath)!
                  }
          
                  if childAcct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath) == nil {
                      let ownedAccount <- HybridCustody.createOwnedAccount(acct: acctCap)
                      childAcct.save(<-ownedAccount, to: HybridCustody.OwnedAccountStoragePath)
                  }
          
                  // check that paths are all configured properly
                  childAcct.unlink(HybridCustody.OwnedAccountPrivatePath)
                  childAcct.link<&HybridCustody.OwnedAccount{HybridCustody.BorrowableAccount, HybridCustody.OwnedAccountPublic, MetadataViews.Resolver}>(HybridCustody.OwnedAccountPrivatePath, target: HybridCustody.OwnedAccountStoragePath)
          
                  childAcct.unlink(HybridCustody.OwnedAccountPublicPath)
                  childAcct.link<&HybridCustody.OwnedAccount{HybridCustody.OwnedAccountPublic, MetadataViews.Resolver}>(HybridCustody.OwnedAccountPublicPath, target: HybridCustody.OwnedAccountStoragePath)
                  // --------------------- End setup of child account ---------------------
          
                  // --------------------- Begin setup of parent account ---------------------
                  var filter: Capability<&{CapabilityFilter.Filter}>? = nil
                  if parentFilterAddress != nil {
                      filter = getAccount(parentFilterAddress!).getCapability<&{CapabilityFilter.Filter}>(CapabilityFilter.PublicPath)
                  }
          
                  if parentAcct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) == nil {
                      let m <- HybridCustody.createManager(filter: filter)
                      parentAcct.save(<- m, to: HybridCustody.ManagerStoragePath)
                  }
          
                  parentAcct.unlink(HybridCustody.ManagerPublicPath)
                  parentAcct.unlink(HybridCustody.ManagerPrivatePath)
          
                  parentAcct.link<&HybridCustody.Manager{HybridCustody.ManagerPrivate, HybridCustody.ManagerPublic}>(HybridCustody.OwnedAccountPrivatePath, target: HybridCustody.ManagerStoragePath)
                  parentAcct.link<&HybridCustody.Manager{HybridCustody.ManagerPublic}>(HybridCustody.ManagerPublicPath, target: HybridCustody.ManagerStoragePath)
                  // --------------------- End setup of parent account ---------------------
          
                  // Publish account to parent
                  let owned = childAcct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
                      ?? panic("owned account not found")
          
                  let factory = getAccount(childAccountFactoryAddress).getCapability<&CapabilityFactory.Manager{CapabilityFactory.Getter}>(CapabilityFactory.PublicPath)
                  assert(factory.check(), message: "factory address is not configured properly")
          
                  let filterForChild = getAccount(childAccountFilterAddress).getCapability<&{CapabilityFilter.Filter}>(CapabilityFilter.PublicPath)
                  assert(filterForChild.check(), message: "capability filter is not configured properly")
          
                  owned.publishToParent(parentAddress: parentAcct.address, factory: factory, filter: filterForChild)
          
                  // claim the account on the parent
                  let inboxName = HybridCustody.getChildAccountIdentifier(parentAcct.address)
                  let cap = parentAcct.inbox.claim<&HybridCustody.ChildAccount{HybridCustody.AccountPrivate, HybridCustody.AccountPublic, MetadataViews.Resolver}>(inboxName, provider: childAcct.address)
                      ?? panic("child account cap not found")
          
                  let manager = parentAcct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
                      ?? panic("manager no found")
          
                  manager.addAccount(cap: cap)
              }
          }
	```
**Note:** For the sake of this example, well use some pre defined factory and filter implementations. You can find them on the repo but on testnet we can use 0x1055970ee34ef4dc and 0xe2664be06bb0fe62 for the factory and filter address respectively. 0x1055970ee34ef4dc provides NFT capabilities and 0xe2664be06bb0fe62 which is the AllowAllFilter. These generalized implementations likely cover most use cases, but you'll want to weigh the decision to use them according to your risk tolerance and specific scenario

3. You could use this with FCL like so to connect a parent account do the child Magic account
	```
    const parentAuthz = fcl.currentUser().authorization;
    const childAuthz = AUTHORIZATION_FUNCTION;
    try {
      const response = await fcl.mutate({
        cadence: `
           <INSERT_TRANSACTION_HERE>
          `,
        limit: 9999,
        payer: parentAuthz,
        proposer: parentAuthz,
        authorizations: [childAuthz, parentAuthz],
        args: (arg, t) => [
          arg(null, t.Optional(t.Address)),
          arg("0x1055970ee34ef4dc", t.Address),
          arg("0xe2664be06bb0fe62", t.Address),
        ],
      });
      await fcl.tx(response).onceSealed();
	```

4. Now in order for you to grab all parent accounts linked to the child magic account you can do the following
	```
    import HybridCustody from 0x294e44e1ec6993c6

    pub fun main(child: Address): [Address] {
        let acct = getAuthAccount(child)
        let o = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)

        if o == nil {
          return []
        }
    
        return o!.getParentStatuses().keys
    }  
	```
5. And finally to remove a linked account you can run a transaction like so
	```
	await fcl.send([
        fcl.transaction`
        import HybridCustody from 0x294e44e1ec6993c6
        
        transaction(parent: Address) {
            prepare(acct: AuthAccount) {
                let owned = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
                    ?? panic("owned not found")
        
                owned.removeParent(parent: parent)
        
                let manager = getAccount(parent).getCapability<&HybridCustody.Manager{HybridCustody.ManagerPublic}>(HybridCustody.ManagerPublicPath)
                    .borrow() ?? panic("manager not found")
                let children = manager.getChildAddresses()
                assert(!children.contains(acct.address), message: "removed child is still in manager resource")
            }
        }
        `,
        fcl.args([fcl.arg(account, t.Address)]),
        fcl.proposer(AUTHORIZATION_FUNCTION),
        fcl.authorizations([AUTHORIZATION_FUNCTION]),
        fcl.payer(AUTHORIZATION_FUNCTION),
        fcl.limit(9999),
      ]);
	```



### Wallet Connect Setup

1. Create an ccount on [walletconnect.com](https://walletconnect.com/) and create a project
2. You will be given a Project ID
3. Install @onflow/fcl-wc
     ```bash
    yarn add @onflow/fcl-wc
4. Init WalletConnect wherever you are initiating fcl
	```
    import { init } from "@onflow/fcl-wc";

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
    ```