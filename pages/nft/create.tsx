/* eslint-disable @next/next/no-img-element */

import type { NextPage } from "next";
import { ChangeEvent, useState } from "react";
import { BaseLayout } from "@ui";
import { NftMeta, PinataRes } from "@_types/nft";
import Link from 'next/link'
import axios from "axios";
import { useWeb3 } from "@providers/web3";
export const pinata_api_key = process.env.NEXT_PUBLIC_PINATA_API_KEY as string;
export const pinata_secret_api_key = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY as string;

const NftCreate: NextPage = () => {
  const { ethereum } = useWeb3();
  const [ipfsHash, setIpfsHash] = useState<string>();
  const [nftMeta, setNftMeta] = useState<NftMeta>({
    name: "",
    description: "",
    image: "",
  });

  const getSignedData = async () => {
    const messageToSign = await axios.get("/api/verify");
    const accounts = (await ethereum?.request({ method: "eth_requestAccounts" })) as string[];
    const account = accounts[0];

    const signedData = await ethereum?.request({
      method: "personal_sign",
      params: [JSON.stringify(messageToSign.data), account, messageToSign.data.id],
    });

    return { signedData, account };
  };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.error("Select a file");
      return;
    }
    const file = e.target.files[0];
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key,
          pinata_secret_api_key,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = resFile.data as PinataRes;
      setNftMeta({
        ...nftMeta,
        image: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`,
      });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNftMeta({ ...nftMeta, [name]: value });
  };

  const createNft = async () => {
    try {
      const { signedData, account } = await getSignedData();

      const res = await axios.post("/api/verify", {
        address: account,
        signature: signedData,
        nft: nftMeta,
      });
      res.status === 200 && setIpfsHash(res.data.IpfsHash)
      console.log(res, "/api/verify");
      // https://gateway.pinata.cloud/ipfs/QmRFYMjfbuwpwaDQeW7Raoi2sDhAfMw3oevVwpjGMC7DKf
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <BaseLayout>

        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        value={nftMeta.name}
                        onChange={handleChange}
                        type="text"
                        name="name"
                        id="name"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="My Nice NFT"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        value={nftMeta.description}
                        onChange={handleChange}
                        id="description"
                        name="description"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Some nft description..."
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Brief description of NFT</p>
                  </div>
                {nftMeta.image ? (
                  <img src={nftMeta.image} alt="img" />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleImage}
                            />
                          </label>

                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                )}
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  
                  {ipfsHash ? <><p>successfully created added NFT to IPFS</p><Link href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}>IPFS link</Link></> :
                  <button
                    onClick={createNft}
                    disabled={!nftMeta.image || !nftMeta.description || !nftMeta.name}
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-25 disabled:focus:none disabled:hover:none"
                  >
                    create NFT
                  </button>}
                </div>
              </div>
            </form>
          </div>
        </div>
    </BaseLayout>
  );
};

export default NftCreate;
