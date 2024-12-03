import { find, insertBid } from "../data/auction";
import { Auction, Bid, KnownError } from "../types/auction";

export const determineWinner = (auction: Auction): string | null => {
  if (!auction.bids.length || auction.endTime > new Date().toISOString()) {
    return null;
  }

  const winning = auction.bids.reduce(
    (highest, bid) =>
      bid.value > highest.value ||
      (bid.value === highest.value && bid.time < highest.time)
        ? bid
        : highest,
    { username: "", value: 0, time: new Date().toISOString() }
  );

  return winning.username;
};

export const placeBid = (id: string, bid: Bid) => {
  const auction = find(id);
  if (!auction) {
    throw new Error(KnownError.NotFound);
  }
  if (bid.time > auction.endTime) {
    throw new Error(KnownError.Ended);
  }
  const latestBidTime = auction.bids.at(-1)?.time;
  if (latestBidTime && bid.time <= latestBidTime) {
    throw new Error(KnownError.ConflictingBidTime);
  }
  const latestBidValue = auction.bids.at(-1)?.value ?? 0;
  if (bid.value <= latestBidValue) {
    throw new Error(KnownError.InferiorBidValue);
  }
  insertBid(id, bid);
  return bid;
};
