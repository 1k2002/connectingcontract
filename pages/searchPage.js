import React, { useEffect, useState, useContext } from "react";

//INTRNAL IMPORT
import Style from "../styles/searchPage.module.css";
import { Slider, Brand } from "../components/componentsindex";
import { SearchBar } from "../SearchPage/searchBarIndex";
import { Filter } from "../components/componentsindex";

import { NFTCardTwo, Banner } from "../collectionPage/collectionIndex";
import images from "../img";

// SMART CONTRACT IMPORT
import { NFTMarketplaceContext }  from "../Context/NFTMarketplaceContext"

const searchPage = () => {
  const { fetchNFTs } = useContext(NFTMarketplaceContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([])


  useEffect(() => {
    fetchNFTs().then((item) => {
      setNfts(item.reverse());
      setNftsCopy(item)
      console.log(nfts);
    });
  }, []);

  const onHandleSearch = (value) => {
    const filteredNFTS = nfts.filter(({name}) => 
      name.toLowerCase().includes(value.toLowerCase())
    
    );

    if(filteredNFTS.length === 0) {
      setNfts(nftsCopy);
    } else {
      setNfts(filteredNFTS)
    }
  };

  const onClearSearch = () => {
    if(nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };


 // const collectionArray = [ 
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  // ];
  return (
    <div className={Style.searchPage}>
      <Banner bannerImage={images.creatorbackground2} />
    <SearchBar  
      onHandleSearch = {onHandleSearch}
      onClearSearch = {onClearSearch}
    />
      <Filter />
      <NFTCardTwo NFTData={nfts} />
      <Slider />
      <Brand />
    </div>
  );
};

export default searchPage;

// import React, { useEffect, useState, useContext } from "react";

// // INTERNAL IMPORTS
// import Style from "../styles/searchPage.module.css";
// import { Slider, Brand, Filter } from "../components/componentsindex";
// import { SearchBar } from "../SearchPage/searchBarIndex";
// import { NFTCardTwo, Banner } from "../collectionPage/collectionIndex";
// import images from "../img";

// // SMART CONTRACT IMPORT
// import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

// const SearchPage = () => {
//   const { fetchNFTs } = useContext(NFTMarketplaceContext);
//   const [nfts, setNfts] = useState([]);
//   const [nftsCopy, setNftsCopy] = useState([]);

//   // Fetch NFTs when component mounts
//   useEffect(() => {
//     fetchNFTs().then((items) => {
//       setNfts([...items].reverse()); // Avoid in-place reversal
//       setNftsCopy(items);
//     });
//   }, []); // Empty dependency array to prevent infinite fetch loop

//   // Log `nfts` only when it changes
//   useEffect(() => {
//     console.log("Updated NFTs:", nfts);
//   }, [nfts]);

//   const onHandleSearch = (value) => {
//     const filteredNFTs = nftsCopy.filter(({ name }) =>
//       name.toLowerCase().includes(value.toLowerCase())
//     );

//     if (filteredNFTs.length === 0) {
//       setNfts(nftsCopy); // Restore original NFTs if no match found
//     } else {
//       setNfts(filteredNFTs);
//     }
//   };

//   const onClearSearch = () => {
//     if (nfts.length && nftsCopy.length) {
//       setNfts(nftsCopy); // Reset to original NFT list
//     }
//   };

//   return (
//     <div className={Style.searchPage}>
//       <Banner bannerImage={images.creatorbackground2} />
//       <SearchBar 
//         onHandleSearch={onHandleSearch} 
//         onClearSearch={onClearSearch} 
//       />
//       <Filter />
//       <NFTCardTwo NFTData={nfts} />
//       <Slider />
//       <Brand />
//     </div>
//   );
// };

// export default SearchPage;