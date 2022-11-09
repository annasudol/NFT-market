import axios from 'axios';
import React, { useEffect, useState } from 'react'


function SendNft() {

    const [fileImg, setFileImg] = useState(null);
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")



    const sendJSONtoIPFS = async (ImgHash: any) => {

        try {

            const resJSON = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
                data: {
                    "name": name,
                    "description": desc,
                    "image": ImgHash
                },
                headers: {
                    'pinata_api_key': `a5322b306731a117fc2a`,
                    'pinata_secret_api_key': `6b6ae2bb50c20389c779c79e8047aa9971f522fd0bd649ea1407476f31dbff2d`,
                },
            });

            console.log("final ", `ipfs://${resJSON.data.IpfsHash}`)
            const tokenURI = `ipfs://${resJSON.data.IpfsHash}`;
            console.log("Token URI", tokenURI);
            // mintNFT(tokenURI, currentAccount)   // pass the winner

        } catch (error) {
            console.log("JSON to IPFS: ")
            console.log(error);
        }


    }

    const sendFileToIPFS = async (e: any) => {

        e.preventDefault();
        console.log(process.env.PINATA_API_KEY, 'process.env.PINATA_API_KEY');
        console.log(process.env.PINATA_SECRET_API_KEY, 'process.env.PINATA_SECRET_API_KEY')

        if (fileImg) {
            try {

                const formData = new FormData();
                formData.append("file", fileImg);

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        'pinata_api_key': `a5322b306731a117fc2a`,
                        'pinata_secret_api_key': `6b6ae2bb50c20389c779c79e8047aa9971f522fd0bd649ea1407476f31dbff2d`,
                        "Content-Type": "multipart/form-data"
                    },
                });
                console.log(resFile, 'resFile')
                const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
                //https://gateway.pinata.cloud/ipfs/Qme6dsJENfPLzRcWMnUy86MFHYPvw1ymTytxn7q7bwXj4U
                // console.log(response.data.IpfsHash);
                sendJSONtoIPFS(ImgHash)


            } catch (error) {
                console.log("File to IPFS: ")
                console.log(error)
            }
        }
    }




    useEffect(() => {
        console.log(fileImg)
    }, [fileImg])


    return (
        <div className='mt-3 text-center'>
            <h2 className='text-white mb-3'>Send NFT</h2>
            <form onSubmit={sendFileToIPFS}>
                <input type="file" onChange={(e: any) => setFileImg(e.target.files[0])} required />
                <input type="text" onChange={(e) => setName(e.target.value)} placeholder='name' required value={name} />
                <input type="text" onChange={(e) => setDesc(e.target.value)} placeholder="desc" required value={desc} />
                <br />
                <button className='bttn_ui me-3' type='submit' >Mint NFT</button>

            </form>
            <div className='text-white mt-2'> The NFT will be sent to the winner </div>
        </div>
    )
}

export default SendNft