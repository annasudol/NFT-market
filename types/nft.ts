export type NftMeta = {
  name: string;
  description: string;
  image: string;
};

export type NftCore = {
  tokenId: number;
  price: number;
  creator: string;
  isListed: boolean;
};

export type Nft = {
  meta: NftMeta;
} & NftCore;

export type PinataRes = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};

export type FileReq = {
  data: FormData;
  contentType: string;
  fileName: string;
};
