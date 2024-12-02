import { Auction, Bid } from "../types/auction";

export const find = (id: string) => {
  return auctions.find((auction) => auction.id === id);
};

export const placeBid = (id: string, bid: Bid) => {
  return find(id)?.bids.push(bid);
};

export const create = (auction: Auction) => {
  return auctions.push(auction);
};

const auctions: Auction[] = [];
