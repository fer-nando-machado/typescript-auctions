import { Bid } from "./bid";

export type Auction = {
  id: string;
  title: string;
  endTime: string;
  bids: Bid[];
  winnerUsername?: string;
};
