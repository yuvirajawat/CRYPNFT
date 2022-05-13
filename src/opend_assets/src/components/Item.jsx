import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {HttpAgent, Actor} from "@dfinity/agent";
import {idlFactory} from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import {Principal} from "@dfinity/principal";
import { setTokenSourceMapRange } from "../../../../node_modules/typescript/lib/typescript";
import Button from "./Button";
import { opend } from "../../../declarations/opend/index";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const id=props.id;
  const localhost="http://localhost:8080/";
  //create new agent
  const agent=new HttpAgent({host:localhost});
  //TODO: while deploying live remove following line
  agent.fetchRootKey();
  //useState Hoooks
  const [name,setName]=useState();
  const [asset,setAsset]=useState();
  const [owner,setOwner]=useState();
  const [button,setButton]=useState();
  const [priceInput,setPriceInput]=useState();
  const [loaderHidden ,setLoaderHidden]=useState(true);
  const [blur,setBlur]=useState();
  const [sellStatus,setSellStatus]=useState("");
  const [priceLabel,setPriceLabel]=useState();
  const [shouldDisplay,setDisplay]=useState(true);
  let NFTActor;
  
  async function loadNFT(){
    //create new actor from idlFactory
      NFTActor= await Actor.createActor(idlFactory,{
        agent,
        canisterId:id,
      });
      //async function calls
      const name= await NFTActor.getName();
      const owner=await NFTActor.getOwner();
      const imageData= await NFTActor.getAsset();
      //to store image in binary
      const imageContent =new Uint8Array(imageData);
      //create blob object
      //A blob object is simply a group of bytes that holds the data stored in a file.
      //The content of the blob can easily be read as ArrayBuffer which makes blobs very convenient to store the binary data.

      const image= URL.createObjectURL(new Blob([imageContent.buffer],{type:"image/png"}));
      setName(name);
      setOwner(owner.toText());
      setAsset(image);
      //if in collection page
      if(props.role == "collection")
      {
        const nftIsListed=await opend.isListed(props.id);
        //if listed change properties of nft
        if(nftIsListed)
        {
          setOwner("CRYPNFT");
          setBlur({filter:"blur(6px)"});
          setSellStatus("Listed")
        }
        else{
          setButton(<Button handleClick={handleSell} text="Set Price to Sell"/>);
        }
        //set price label
        const listingPrice= await opend.getListingPrice(props.id);
        setPriceLabel(<PriceLabel listingPrice={listingPrice.toString()}/>);
      }
      //on discover page
      else if (props.role == "discover")
      {
        //if not own nft show buy button
        const originalOwner= await opend.getOriginalOwner(props.id);
        if(originalOwner.toText() != CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text="Buy"/>);
        }
        if(originalOwner.toText() == "CRYPNFT"){
          setOwner("CRYPNFT");
        }
        const listingPrice= await opend.getListingPrice(props.id);
        console.log(listingPrice);
        setPriceLabel(<PriceLabel listingPrice={listingPrice.toString()}/>);
      }
    }
  useEffect(()=>{
    loadNFT();
  },[]);
  let price;
  //function called on clicking set price for sale
  function handleSell(){
    console.log("sell clicked");
    // get input
    setPriceInput(<input
      placeholder="Price in DCT"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=>{price=e.target.value}}
    />);
    //update button on receiving data
    setButton(<Button handleClick={sellItem} text="Confirm Sell"/>)
  }
  //confirm sell
  async function sellItem(){
    setBlur({filter:"blur(6px)"});
    setLoaderHidden(false);
    const listingResult =await opend.listItem(props.id,Number(price));
    console.log("listing: "+listingResult);
    if(listingResult == "Success"){
      //transfer ownership to crypnft
      const openDID= await opend.getOpenDCanisterId();
      const transferResult=await NFTActor.transferOwnership(openDID);
      console.log("transfer: "+transferResult);
      if(transferResult == "Success"){
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("CRYPNFT");
        setSellStatus("Listed");
        
      }
    }
  }
  //function on clicking buy
  async function handleBuy(){
    setLoaderHidden(false);
    //create token actor 
    const tokenActor= await Actor.createActor(tokenIdlFactory,{
      agent,
      canisterId:Principal.fromText("s24we-diaaa-aaaaa-aaaka-cai"),
    })

    const sellerId= await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListingPrice(props.id);
    //transfer amount to seller
    const result=await tokenActor.transfer(sellerId,itemPrice);
    //transfer ownership
    if (result == "Success") {
      //if transaction success call completePurchase in main.mo
      const transferResult = await opend.completePurchase(
        props.id,
        sellerId,
        CURRENT_USER_ID
      );
      console.log("purchase: " + transferResult);
      if(transferResult=="Success"){
        setOwner(CURRENT_USER_ID.toText());
      }
      setLoaderHidden(true);
      setDisplay(false);
    }
    
  }
  return (
    <div style={{display:shouldDisplay?"inline":"none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={asset}
          style={blur}
        />
         <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
        {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
