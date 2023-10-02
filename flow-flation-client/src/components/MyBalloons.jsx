import React, { useContext, useEffect, useState } from "react";
import BalloonNFTView from "./BalloonNFTView";
import LogIn from "./LogIn";
import CurrentUserContext from "../context/currentUserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import * as fcl from "@onflow/fcl";

const getNFTs = async (address) => {
  const items = await fcl.query({
    cadence: `
        import BalloonSampleNFT from 0x66c97ae98630d4a2

        pub struct NFT {
            pub let id: UInt64
            pub let name: String
            pub let rgbColor: String
            pub let inflation: UInt64
            init(
                id: UInt64,
                name: String,
                rgbColor: String,
                inflation: UInt64
            ) {
                self.id = id
                self.name = name
                self.rgbColor = rgbColor
                self.inflation = inflation
            }
        }
        
        pub fun main(address: Address): [NFT] {
            let account = getAccount(address)
        
            let collection = account
                .getCapability(BalloonSampleNFT.CollectionPublicPath)
                .borrow<&{BalloonSampleNFT.BalloonSampleNFTCollectionPublic}>()
                ?? panic("Could not borrow a reference to the collection")
            
            let ids = collection.getIDs()
            let toReturn : [NFT] = []
        
            for id in ids {
                let nft = collection.borrowBalloonSampleNFT(id: id)!
        
                toReturn.append(NFT(
                    id: id,
                    name: nft.name,
                    rgbColor: nft.rgbColor,
                    inflation: nft.inflation
                ))
            }
            return toReturn
        }
    `,
    args: (arg, t) => [arg(address, t.Address)],
  });
  return items;
};

export default function MyBalloons() {
  const [loading, setLoading] = useState(false);
  const [balloons, setBalloons] = useState([]);
  const { currentUser, userStatusLoading } = useContext(CurrentUserContext);

  useEffect(() => {
    const getItems = async () => {
      if (currentUser?.publicAddress != null) {
        setLoading(true);
        const res = await getNFTs(currentUser.publicAddress);
        setBalloons(res);
        setLoading(false);
      }
    };
    if (currentUser != null) {
      getItems();
    }
  }, [currentUser]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // You can adjust the sizing as needed
    gap: "20px",
    padding: "20px",
  };

  return (
    <Box style={{ overflowX: "hidden", overflowY: "auto", maxHeight: "100vh" }}>
      {!currentUser ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <LogIn />
        </div>
      ) : (
        <div style={gridStyle}>
          {balloons.map((balloonData) => (
            <div key={balloonData.id} className="balloon-card">
              <BalloonNFTView
                rgbColor={balloonData.rgbColor}
                inflation={balloonData.inflation}
              />
            </div>
          ))}
        </div>
      )}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading || userStatusLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
