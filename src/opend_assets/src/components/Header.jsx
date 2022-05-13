import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {BrowserRouter,Link,Switch, Route} from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import {opend} from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {

  const [userOwnedGallery, setUserOwnedGallery]=useState();
  const [listedGallery,setListedGallery]=useState();
  async function getNFTs(){
    const userNFTIds=await opend.getOwnedNFTs(CURRENT_USER_ID);
    setUserOwnedGallery(<Gallery title="My Collection" ids={userNFTIds} role="collection"/>)

    const listedNFTIds= await opend.getListedNFTs();
    console.log(listedNFTIds);
    setListedGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover"/>)
  }

useEffect(()=>{
  getNFTs();
},[]);

  return (
    <BrowserRouter forceRefresh={true}>
    <div className="app-root-1">
      <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
        <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
          <div className="header-left-4"></div>
          <Link to="/"><img className="header-logo-11" src={logo} /></Link>
          <div className="header-vertical-9"></div>
          <Link to="/"><h5 className="Typography-root header-logo-text">CRYPNFT</h5></Link>
          <div className="header-empty-6"></div>
          <div className="header-space-8"></div>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
           <Link to="/discover" >Discover</Link>
          </button>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to ="/minter">Create</Link>
          </button>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
          <Link to ="/collection">My NFT's</Link>
          </button>
        </div>
      </header>
    </div>
    <Switch>
      <Route exact path="/">
      <section class="header">
        <div style={{width:"700px",marginTop:"50px"}}><h1 style={{ fontSize:"42px",letterSpacing:"2px",textAlign:"center"}}>Discover, collect, and sell extraordinary NFTs</h1>
        <h3 style={{fontWeight:"300",letterSpacing:"2px"}}>Coolest NFT marketplace</h3>
        </div>
        <img className="header-img" src="https://lh3.googleusercontent.com/O3Zi9hd5QlOFeVWZuKCUgW8bMfbg5MJ_3ph2LALoZKuNxLB3SFKPxy1rCPViUErGNRrFm1FdIGmjpQJwmWk3Ti42jc3YjOhUjTSp=s550"/>
      </section>
      </Route>
      <Route path="/discover">
        {listedGallery}
      </Route>
      <Route path="/minter">
        <Minter />
      </Route>
      <Route path="/collection">
        {userOwnedGallery}
      </Route>
    </Switch>
    </BrowserRouter>
  );
}

export default Header;
