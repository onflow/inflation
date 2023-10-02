import { Magic } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";

console.log(process.env.REACT_APP_MAGIC_KEY);

const magic = new Magic(process.env.REACT_APP_MAGIC_KEY, {
  extensions: [
    new FlowExtension({
      rpcUrl: "https://rest-testnet.onflow.org",
      network: "testnet",
    }),
  ],
});

export default magic;
