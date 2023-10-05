import BalloonSampleNFT from "../contracts/BalloonSampleNFT.cdc"
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

    if collection == nil {
        return []
    }

    
    let ids = collection!.getIDs()
    let toReturn : [NFT] = []

    for id in ids {
        let nft = collection!.borrowBalloonSampleNFT(id: id)!

        toReturn.append(NFT(
            id: id,
            name: nft.name,
            rgbColor: nft.rgbColor,
            inflation: nft.inflation
        ))
    }
    return toReturn
}