export interface Auction {
  id: string;
  title: string;
  endTime: string;
  bids: Bid[];
}

export interface Bid {
  username: string;
  value: number;
  time: string;
}

export enum KnownError {
  MissingRequiredFields = "Missing required fields",
  InferiorBidValue = "Bid value must be greater than highest bid",
  ConflictingBidTime = "Another bid was placed before this bid",
  Ended = "This auction has ended",
  NotFound = "The requested Auction was not found",
}
