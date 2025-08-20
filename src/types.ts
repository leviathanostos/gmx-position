import { Result } from 'ethers';

export type EventDataType = {
  addressItems: Result;
  uintItems: Result;
  intItems: Result;
  boolItems: Result;
  bytes32Items: Result;
  bytesItems: Result;
  stringItems: Result;
};

export type SimplePosition = {
  account: string;
  market: string;
  // positionKey: string;
  collateralToken: string;
  isLong: boolean;
  sizeInUsd: string;
  sizeInTokens: string;
  collateralAmount: string;
  executionPrice: string;
};
