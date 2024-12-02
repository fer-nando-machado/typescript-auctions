import { Auction } from "../types/auction";

export const selectWinner = (auction: Auction): string | null => {
  if (new Date(auction.endTime) > new Date()) return null;
  if (!auction.bids.length) return null;

  let maxBid = 0;
  let winnerIndex = Infinity;
  auction.bids.forEach((bid, index) => {
    if (bid.value > maxBid || (bid.value === maxBid && index < winnerIndex)) {
      maxBid = bid.value;
      winnerIndex = index;
    }
  });

  return auction.bids[winnerIndex].username;
};
