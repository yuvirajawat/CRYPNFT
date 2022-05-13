import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
//actor class to create programitacally
actor class NFT(name:Text,owner:Principal,content:[Nat8])=this{
    private let itemName=name;
    private var nftOwner=owner;
    private let imageBytes=content;

    public query func getName():async Text{
        return name;
    };
    public query func getOwner():async Principal{
        return owner;
    };
    public query func getAsset():async [Nat8]{
        return imageBytes;
    };
    // get nft canister id
    public query func getCanisterId():async Principal{
        return Principal.fromActor(this);
    };
    //function to transfer ownership on call of owner
    public shared(msg) func transferOwnership(newOwner:Principal):async Text{
        if(nftOwner == msg.caller ){
            nftOwner:= newOwner;
            return "Success";
        }
        else{
            return "Transfer Error: not initiated by owner";
        }
    };
};