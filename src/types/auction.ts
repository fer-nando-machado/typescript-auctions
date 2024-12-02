export interface Auction {
  id: string;
  title: string;
  endTime: string;
  bids: Bid[];
}

export interface Bid {
  username: string;
  value: number;
}
