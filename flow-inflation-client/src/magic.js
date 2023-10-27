import { Magic } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";

const magic = new Magic(process.env.REACT_APP_MAGIC_KEY, {
  extensions: [
    new FlowExtension({
      rpcUrl: "https://rest-testnet.onflow.org",
      network: "testnet",
    }),
  ],
});

export default magic;
