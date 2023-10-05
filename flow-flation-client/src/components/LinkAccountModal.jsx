import React, { useState, useEffect, useContext } from "react";
import Button from "./Button";
import MaterialUIButton from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CurrentUserContext from "../context/currentUserContext";
import CircularProgress from "@mui/material/CircularProgress";
import magic from "../magic";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  maxHeight: "90%",
};

const getParentAccounts = async (childAccountAddress) => {
  const accounts = await fcl.query({
    cadence: `
    import HybridCustody from 0x294e44e1ec6993c6

    pub fun main(child: Address): [Address] {
        let acct = getAuthAccount(child)
        let o = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned account not found")
    
        return o.getParentStatuses().keys
    }   
    `,
    args: (arg, t) => [arg(childAccountAddress, t.Address)],
  });
  return accounts;
};

const AUTHORIZATION_FUNCTION = magic.flow.authorization;

function LinkAccountModal({ open, setOpen }) {
  const [isLoading, setIsLoading] = useState(false);
  const [removingParents, setRemovingParents] = useState([]);

  const [parents, setParents] = useState([]);
  const handleClose = () => {
    setIsLoading(false);
    setOpen(false);
  };
  const { currentUser } = useContext(CurrentUserContext);

  useEffect(() => {
    const getParents = async () => {
      setIsLoading(true);
      if (currentUser != null) {
        const res = await getParentAccounts(currentUser.publicAddress);
        setParents(res);
      }
      setIsLoading(false);
    };
    if (currentUser != null) {
      getParents();
    }
  }, [currentUser]);

  async function handleRemove(account) {
    try {
      setRemovingParents((prevParents) => [...prevParents, account]);
      var response = await fcl.send([
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

      await fcl.tx(response).onceSealed();
    } catch (error) {
      console.error("FAILED TRANSACTION", error);
    }
    setRemovingParents((prevParents) =>
      prevParents.filter((parent) => parent !== account)
    );
    const res = await getParentAccounts(currentUser.publicAddress);
    setParents(res);
  }

  async function handleConfirm() {
    setIsLoading(true);
    fcl.unauthenticate();

    const parentAuthz = fcl.currentUser().authorization;
    const childAuthz = AUTHORIZATION_FUNCTION;
    try {
      const response = await fcl.mutate({
        cadence: `
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
    } catch (error) {
      console.error("FAILED TRANSACTION", error);
    }

    const res = await getParentAccounts(currentUser.publicAddress);
    setParents(res);
    setIsLoading(false);
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Box sx={style}>
          <IconButton
            edge="end"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: "absolute", right: 12, top: 8 }}
            style={{ color: "#49EF8B" }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="simple-modal-title" variant="h6" component="h2">
            Link a Parent Account
          </Typography>

          {parents.map((parent, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Typography style={{ marginRight: "16px" }}>{parent}</Typography>{" "}
              {removingParents.includes(parent) ? (
                <CircularProgress size={24} style={{ color: "#49EF8B" }} />
              ) : (
                <Button
                  label="Remove Link"
                  onClick={() => handleRemove(parent)}
                />
              )}
            </Box>
          ))}

          <Box mt={2} display="flex" justifyContent="flex-end">
            <MaterialUIButton onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </MaterialUIButton>
            {isLoading ? (
              <CircularProgress size={24} style={{ color: "#49EF8B" }} />
            ) : (
              <Button label="Link New Account" onClick={handleConfirm} />
            )}
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default LinkAccountModal;
