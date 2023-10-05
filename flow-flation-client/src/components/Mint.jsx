import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Button from "./Button";
import LogIn from "./LogIn";
import * as fcl from "@onflow/fcl";
import magic from "../magic";
import CurrentUserContext from "../context/currentUserContext";
import * as t from "@onflow/types";
import BalloonNFTView from "./BalloonNFTView";

const AUTHORIZATION_FUNCTION = magic.flow.authorization;

export default function Mint({ rgbColor, inflation, onReset }) {
  const [loading, setLoading] = useState(false);
  const [minted, setMinted] = useState(false);
  const [message, setMessage] = useState("");

  const { currentUser, setCurrentUser, userStatusLoading } =
    useContext(CurrentUserContext);

  useEffect(() => {
    magic.user.isLoggedIn().then(async (magicIsLoggedIn) => {
      if (magicIsLoggedIn) {
        const metaData = await magic.user.getMetadata();
        setCurrentUser(metaData);
      }
    });
  }, [setCurrentUser]);

  const mint = async () => {
    try {
      setLoading(true);
      var response = await fcl.send([
        fcl.transaction`
                import NonFungibleToken from 0x631e88ae7f1d7c20
                import BalloonSampleNFT from 0x66c97ae98630d4a2

                /// Mints a new BalloonSampleNFT into recipient's account

                transaction(recipient: Address, rgbColor: String, inflation: UInt64) {

                    /// Reference to the receiver's collection
                    let recipientCollectionRef: &{NonFungibleToken.CollectionPublic}

                    /// Previous NFT ID before the transaction executes
                    let mintingIDBefore: UInt64

                    prepare(signer: AuthAccount) {
                        if signer.borrow<&BalloonSampleNFT.Collection>(from: BalloonSampleNFT.CollectionStoragePath) == nil {
                            // Create a new empty collection
                            let collection <- BalloonSampleNFT.createEmptyCollection()

                            // save it to the account
                            signer.save(<-collection, to: BalloonSampleNFT.CollectionStoragePath)

                            // create a public capability for the collection
                            signer.link<&{NonFungibleToken.CollectionPublic, BalloonSampleNFT.BalloonSampleNFTCollectionPublic}>(
                                BalloonSampleNFT.CollectionPublicPath,
                                target: BalloonSampleNFT.CollectionStoragePath
                            )
                        }
                        
                        
                        self.mintingIDBefore = BalloonSampleNFT.totalSupply

                        // Borrow the recipient's public NFT collection reference
                        self.recipientCollectionRef = getAccount(recipient)
                            .getCapability(BalloonSampleNFT.CollectionPublicPath)
                            .borrow<&{NonFungibleToken.CollectionPublic}>()
                            ?? panic("Could not get receiver reference to the recipient's NFT Collection")
                    }

                    execute {

                        let currentIDString = self.mintingIDBefore.toString()

                        BalloonSampleNFT.mintNFT(
                            recipient: self.recipientCollectionRef,
                            name: "Example NFT #".concat(currentIDString),
                            rgbColor: rgbColor,
                            inflation: inflation
                        )
                    }

                    post {
                        self.recipientCollectionRef.getIDs().contains(self.mintingIDBefore): "The next NFT ID should have been minted and delivered"
                        BalloonSampleNFT.totalSupply == self.mintingIDBefore + 1: "The total supply should have been increased by 1"
                    }
                }
      `,
        fcl.args([
          fcl.arg(currentUser.publicAddress, t.Address),
          fcl.arg(rgbColor, t.String),
          fcl.arg(inflation, t.UInt64),
        ]),
        fcl.proposer(AUTHORIZATION_FUNCTION),
        fcl.authorizations([AUTHORIZATION_FUNCTION]),
        fcl.payer(AUTHORIZATION_FUNCTION),
        fcl.limit(9999),
      ]);

      var data = await fcl.tx(response).onceSealed();
      setLoading(false);

      if (data.status === 4 && data.statusCode === 0) {
        setMessage("Congrats!!!");
        setMinted(true);
      } else {
        setMessage(`Oh No: ${data.errorMessage}`);
      }
    } catch (error) {
      console.error("FAILED TRANSACTION", error);
    }
  };

  return (
    <Container className="App">
      {!currentUser ? (
        <LogIn />
      ) : (
        <>
          {minted ? (
            <Box mt={4}>
              <Typography>{message}</Typography>
              <Button label="Play Again" onClick={onReset} />
            </Box>
          ) : (
            <>
              <Box mt={4}>
                <Typography>{message}</Typography>
                <Button label="Mint" onClick={mint} />
              </Box>
              <Box mt={2}>
                <Button label="Return to Game" onClick={onReset} />
              </Box>
            </>
          )}
          <Box mt={4}>
            <BalloonNFTView rgbColor={rgbColor} inflation={inflation} />
          </Box>
        </>
      )}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading || userStatusLoading}
      >
        <CircularProgress style={{ color: "#49EF8B" }} />
      </Backdrop>
    </Container>
  );
}
