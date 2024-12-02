export const determineWinner = (auction: any): string | null => {
  if (new Date(auction.endTime) > new Date()) return null;

  let winner = null;
  let maxBid = 0;

  const userBids: { [key: string]: number } = {};

  for (const bid of auction.bids) {
    userBids[bid.username] = Math.max(bid.value, userBids[bid.username] || 0);

    if (userBids[bid.username] > maxBid) {
      maxBid = userBids[bid.username];
      winner = bid.username;
    }
  }

  return winner;
};

export const generateId = (): string => {
  return Math.random().toString(36).slice(2, 8);
};
