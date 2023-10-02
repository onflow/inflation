import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import BalloonSampleNFT from "../contracts/BalloonSampleNFT.cdc"

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