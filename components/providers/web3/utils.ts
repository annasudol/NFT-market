import { setupHooks, Web3Hooks } from "@hooks/web3/setupHooks";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { Web3Dependencies } from "@_types/hooks";
import { Contract, ethers, providers } from "ethers";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type Web3State = {
  isLoading: boolean; // true while loading web3State
  hooks: Web3Hooks;
} & Nullable<Web3Dependencies>;

export const createDefaultState = () => {
  return {
    ethereum: null,
    provider: null,
    contract: null,
    isLoading: true,
    hooks: setupHooks({ isLoading: true } as any),
  };
};

export const createWeb3State = ({ ethereum, provider, contract, isLoading }: Web3Dependencies) => {
  return {
    ethereum,
    provider,
    contract,
    isLoading,
    hooks: setupHooks({ ethereum, provider, contract, isLoading }),
  };
};

const NEXT_PUBLIC_SECRET_NETWORK_ID = process.env.NEXT_PUBLIC_SECRET_NETWORK_ID;
export const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT as string;

export const loadContract = async (
  name: string, // NftMarket
  provider: providers.Web3Provider
): Promise<Contract> => {
  if (!NEXT_PUBLIC_SECRET_NETWORK_ID) {
    return Promise.reject("Network ID is not defined!");
  }

  const res = await fetch(`/contracts/NftMarket.json`);
  const Artifact = await res.json();

  if (contractAddress) {
    const contract = new ethers.Contract(contractAddress, Artifact.abi, provider);

    return contract;
  } else {
    return Promise.reject(`Contract: [${name}] cannot be loaded!`);
  }
};
