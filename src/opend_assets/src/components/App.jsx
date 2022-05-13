import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import homeImage from "../../assets/home-img.png";
import Item from "./Item";
import { nft } from "../../../declarations/nft/index";
import Minter from "./Minter";

function App() {
  // const nftID="rrkah-fqaaa-aaaaa-aaaaq-cai";
  return (
    <div className="App">
      <Header />
       <Footer />
    </div>
  );
}

export default App;
