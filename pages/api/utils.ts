import { NextApiRequest } from 'next';
import { withIronSession, Session } from 'next-iron-session';
import contract from "../../public/contracts/NftMarket.json";
import { NextApiResponse } from 'next';
import { ethers } from "ethers"
const abi = contract.abi;
import { NftMarketContract } from '@_types/nftMarketContract';
const NETWORKS = {
  "5777": "Ganache"
}

type NETWORK = typeof NETWORKS;

const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

export const contractAddress = contract["networks"][targetNetwork]["address"];

export function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: "nft-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false
    }
  })
}

export const addressCheckMiddleware = async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
  return new Promise(async (resolve, reject) => {
    const message = req.session.get("message-session");
    const provider = new ethers.providers.JsonRpcBatchProvider("HTTP://127.0.0.1:7545");
    debugger;
    const contract = new ethers.Contract(contractAddress, abi, provider) as unknown as NftMarketContract;
    const name = await contract.name();
    console.log(contract, 'contract')
    return message ? resolve("Correct Address") : reject("Wrong Address")
  })
}