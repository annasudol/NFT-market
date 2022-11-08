import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";
import * as util from "ethereumjs-util";
const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

import contract from "../../public/contracts/NftMarket.json";
import { NftMarketContract } from "@_types/nftMarketContract";

const NETWORKS = {
  "5777": "Ganache"
}

type NETWORK = typeof NETWORKS;
export const contractAddress = contract["networks"][targetNetwork]["address"];

const abi = contract.abi;


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
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    ) as unknown as NftMarketContract;
    let nonce: string | Buffer = "\x19Ethereum signed Message: \n" + JSON.stringify(message).length + JSON.stringify(message);
    nonce = util.keccak(Buffer.from(nonce, "utf-8"));
    console.log(nonce, 'nonce');
    const { v, r, s } = util.fromRpcSig(req.body.signature);
    console.log(v, r, s, ' v, r, s');
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuffer = util.pubToAddress(pubKey);
    const address = util.bufferToHex(pubKey);
    console.log(address, 'addrBuffer')



    if (message) {
      resolve("Correct Address");
    } else {
      reject("Wrong Address");
    }
  })
}