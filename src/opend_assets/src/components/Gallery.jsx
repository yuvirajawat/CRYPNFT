import React, { useEffect, useState } from "react";
import { propTypes } from "../../../../node_modules/react-bootstrap/esm/Image";
import Item from "./Item";
import {Principal} from "@dfinity/principal";

function Gallery(props) {
  const [items,setItems]=useState();

  function fetchNFTs(){
    if(props.ids != undefined){
      setItems(
        props.ids.map(
          (NFTid)=>(<Item id={NFTid} key={NFTid.toText()} role={props.role}/>)
        )
      );
    }
  }
  // only 1 time on page load
  useEffect(()=>{
      fetchNFTs();
  },[]);
  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="grid-container">
      {items}
      </div>
    </div>
  );
}

export default Gallery;
