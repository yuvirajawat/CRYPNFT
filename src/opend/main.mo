import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import HashMap"mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";
actor OpenD {
    //create custom datatype Listing
    private type Listing ={
        itemOwner: Principal;
        itemPrice:Nat;
    };
    //use hashmaps for storing the list of nfts(nftids), owners(id,list of nfts) and listing(nft,price)
    var mapOfNFT = HashMap.HashMap<Principal, NFTActorClass.NFT> (1,Principal.equal,Principal.hash);
    var mapOfOwners = HashMap.HashMap<Principal,List.List<Principal>> (1,Principal.equal,Principal.hash);
    var mapOfListings = HashMap.HashMap<Principal,Listing> (1,Principal.equal,Principal.hash);
    
    //function to mint nft from frontend
    public shared(msg) func mint(imgData:[Nat8],name:Text): async Principal{
        let owner=msg.caller;//returns canisterid owner of main actor
        //experimental cycles for minting
        Cycles.add(100_500_000_000);
        let newNFT= await NFTActorClass.NFT(name,owner,imgData);//create 
        let newNFTPrincipal=await newNFT.getCanisterId();//get id
        //store
        mapOfNFT.put(newNFTPrincipal,newNFT);
        addToOwnershipMap(owner,newNFTPrincipal);
        return newNFTPrincipal;
    };


    //function to add nft to a particular owner
    private func addToOwnershipMap(owner:Principal,nftId:Principal){
        //switch statement of question return
        var ownedNfts:List.List<Principal> = switch(mapOfOwners.get(owner)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        //update
        ownedNfts:=List.push(nftId,ownedNfts);
        mapOfOwners.put(owner,ownedNfts);

    };
    //function to get all nfts of a owner
    public query func getOwnedNFTs(user:Principal):async [Principal]{
            var userNfts:List.List<Principal> = switch(mapOfOwners.get(user)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        return List.toArray(userNfts);
    };
    //function to get all listed nfts for sale
    public query func getListedNFTs():async [Principal]{
       return Iter.toArray(mapOfListings.keys());
    };
    //function to list item for sale
    public shared(msg) func listItem(id:Principal,price:Nat):async Text{
        //question return process
            var item : NFTActorClass.NFT = switch(mapOfNFT.get(id)){
                case null return "NFT does not exist";
                case (?result) result;
            };
            let owner=await item.getOwner();
            if(Principal.equal(owner,msg.caller)){
                    let newListing:Listing ={
                        itemOwner=owner;
                        itemPrice=price;
                    };
                    mapOfListings.put(id,newListing);
                    return "Success";
            }
            else{
                return "you don't owm this nft"

            }
            
    };
    // openD canister id
    public query func getOpenDCanisterId():async Principal{
        return Principal.fromActor(OpenD);
    };
    //function to check if nft is listed or not
    public query func isListed(id:Principal):async Bool{
        if(mapOfListings.get(id)== null)
        {
            return false;
        }
        else{
            return true;
        }
    };
    //check original owner of a nft in discover section
    public query func getOriginalOwner(id:Principal):async Principal{
        var listing: Listing = switch(mapOfListings.get(id)){
            case null return Principal.fromText("");
            case (?result) result;
        };
        return listing.itemOwner;
    };
    //function to get listing price for price label
    public query func getListingPrice(id:Principal):async Nat{
        var listing: Listing = switch(mapOfListings.get(id)){
            case null return 0;
            case (?result) result;
        };
        return listing.itemPrice;
    };
    //function to complete purchase from discover and transfer ownership to buyer
    public shared(msg) func completePurchase(nftid:Principal,seller:Principal,buyer:Principal):async Text{
        var purchaseNFT:NFTActorClass.NFT = switch(mapOfNFT.get(nftid)){
            case null return "NFT does not exist";
            case (?result) result;
        };
        //transfer ownership
        let transferResult=await purchaseNFT.transferOwnership(buyer);
        Debug.print(debug_show(transferResult));
        if(transferResult == "Success"){
            //remove from listing
            mapOfListings.delete(nftid);
            var ownedNFTs: List.List<Principal> = switch(mapOfOwners.get(seller)){
                case null List.nil<Principal>();
                case (?result) result;
            };
            //update seller's owned nft: he does not own anymore
            ownedNFTs:= List.filter(ownedNFTs, func (listItemId:Principal):Bool{
                return listItemId !=nftid;
            });
            //update ownership for buyer in ownership map
            addToOwnershipMap(buyer,nftid);
            return "Success";
        }
        else{
            return "Error";
        }

    };
};
