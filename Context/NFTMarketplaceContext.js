import React, {useState, useEffect, useContext} from "react";
import Wenb3Modal from "web3modal";
import {ethers} from "ethers";
import { useRouter } from "next/router";
import Router from "next/router";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";



//const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// const projectId = "your project here";
// const projectSecretKey = "project secret key"
// const auth = `Basic ${Buffer.from(`${projectId} : ${projectSecretKey}`).toString(
//     "base64"
// )}`;
// const subdomain = "your subdomain";

// const client = ipfsHttpClient({
//     host: "infura-ipfs.io",
//     port: 5001,
//     protocol: "https",
//     headers: {
//         authorization: auth,
//     },
// });

//INTERNAL IMPORT
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";

//--fetching smart contract
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(

        NFTMarketplaceAddress,
        NFTMarketplaceABI,
        signerOrProvider
);



//------CONNECTING WITH SMART CONTRACT
const connectingWithSmartContract = async() => {
    try{
        const web3Modal = new Wenb3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        return contract; 
    } catch (error) {
        console.log("Something went wrong while connecting with contract");
    }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = (({children}) => {
    const titleData = "Discover, collect, and sell NFTs";

//------USESTATE
const [currentAccount, setCurrentAccount] = useState("");
const router = useRouter();

//-----CHECK IF WALLET IS CONNECTED
const checkIfWalletConnected = async () => {
    try{
        if(!window.ethereum) return console.log("install metamask");

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });


        if(accounts.length){
            setCurrentAccount(accounts[0])
        } else{
            console.log("no account found");
        }

        
    } catch(error) {
        console.log("Something went wrong while connecting to wallet");
    }
};

useEffect(() => {
    checkIfWalletConnected();
}, []);

//----CONNECT WALLET FUNCTION
const connectWallet = async () => {
    try{
        if(!window.ethereum) return console.log("install metamask");
            const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
       // window.location.reload();
    }catch(error){
        console.log("error while connecting to wallet");
    }
};

///-----UPLOAD TO IPFS FUNCTION
const uploadToIPFS = async(file) => {
    if (file) {
        try {

            console.log("File Name:", file.name);   // Log file name
            console.log("File Type:", file.type);
            const formData = new FormData();
            formData.append("file", file);
             
            const response = await axios ( {
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    pinata_api_key: `cf96e33c478f51fc6c5b`,
                    pinata_secret_api_key: `c61d618e72f7b8b1b31720e5a420e16951fe6d2e3ea55a9f68d063d8de46bedc`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

            return ImgHash;
        } catch (error) {
            console.log("unable to upload image to pinata");
        }
    }
    
};

//-----CREATE NFT FUNCTION
const createNFT = async(name, price, image, description, router) => {
    
       

        if( !name || !description || !price || !image ) 
            return console.log("data is missing");

            const data = JSON.stringify({ name, description, image });

            try {
                const response = await axios({
                    method: "POST",
                    url: " https://api.pinata.cloud/pinning/pinJSONToIPFS ",
                    data: data,
                    headers: {
                        pinata_api_key: `cf96e33c478f51fc6c5b`,
                        pinata_secret_api_key:`c61d618e72f7b8b1b31720e5a420e16951fe6d2e3ea55a9f68d063d8de46bed`,
                        "Content-Type": "application/json",
                    },
                });

                const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
                console.log(url);
                
                await createSale(url, price);
                router.push("/searchPage");
            } catch (error) {
                console.log("Error while creating NFT");
                
            } 
};

//------CREATE SALE FUNCTION
const createSale = async (url, formInputPrice, isReselling, id) => {
    try {

        const price = ethers.utils.parseUnits(formInputPrice, "ether");
        const contract = await connectingWithSmartContract()

        const listingPrice = await contract.getListingPrice()

        const transaction = !isReselling
         ? await contract.createToken(url, price, {
            value: listingPrice.toString(),
         })
         : await contract.resellToken(url, price, {
            value: listingPrice.toString(),
         });
        
        await transaction.wait();

        console.log(transaction);
        router.push("/searchPage");

    } catch (error) {
        console.log("error while creating sale")
    }
};

//-------FETCHNFTS FUNCTION 
const fetchNFTs = async () => {
    try {
        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);

        const data = await contract.fetchMarketItems();
        // console.log(data)

        const items = await Promise.all(
            data.map(
                async({tokenId, seller, owner, price: unformattedPrice})=> { 
                    const tokenURI = await contract.tokenURI(tokenId);

                    const {
                        data: {image, name, description},
                    } = await axios.get(tokenURI);
                    const price = ethers.utils.formatUnits(
                        unformattedPrice.toString(),
                    );

                    return {
                        price,
                        tokenId: tokenId.toNumber(),
                        seller,
                        owner, 
                        image,
                        name,
                        description ,
                        tokenURI,
                    };
                }
            )
        );
        return items;

    } catch (error) {
        console.log("Error while fetching NFTS");
    }
}

useEffect(() => {
    fetchNFTs();
}, []);

//------FETCHING MY NFT OR LISTED NFTs
const fetchMyNFTsOrListedNFTs = async(type) => {
    try{
      const contract = await connectingWithSmartContract();

      const data = 
        type == "fetchItemsListed" 
        ? await contract.fetchItemsListed()
        : await contract.fetchMyNFTs();

        const items = await Promise.all(
            data.map(async ({tokenId, seller, owner, price: unformattedPrice}) => {
                const tokenURI = await contract.tokenURI(tokenId);
                const {
                    data: {image, name, description},
                } = await axios.get(tokenURI)
                const price = ethers.utils.formatUnits(
                    unformattedPrice.toString(),
                    "ether"
                );

                return {
                    price,
                    tokenId: tokenId.toNumber(),
                    seller,
                    owner,
                    image,
                    name,
                    description,
                    tokenURI,
                };
            })
        );
        return items;

    } catch (error) {
        console.log("Error while fetching listed NFTs")
    }
};

useEffect(() => {
    fetchMyNFTsOrListedNFTs()
}, []);

//------BUY NFTs FUNCTION
const buyNFT = async (nft)=> {
    try {
        const contract = await connectingWithSmartContract();
        const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

        const transaction = await contract.createMarketSale(nft.tokenId, {
            value: price,
        });

        await transaction.wait();
        router.push("/author");
    } catch (error) {
        console.log("Error while buying NFT");
    }
};


    return(
        <NFTMarketplaceContext.Provider 
          value = {{
            checkIfWalletConnected,
            connectWallet,
            uploadToIPFS,
            createNFT,
            fetchNFTs,
            fetchMyNFTsOrListedNFTs,
            buyNFT,
            currentAccount,
            titleData,
        }}
        >

            {children}

        </NFTMarketplaceContext.Provider>
    )
});
