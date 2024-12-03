import { determineWinner } from "../core/auction";
import { Auction } from "../types/auction";

const PAST_ISO_STRING = new Date(Date.now() - 10000).toISOString();
const FUTURE_ISO_STRING = new Date(Date.now() + 10000).toISOString();

describe("determineWinner", () => {
  it("should return null if the Auction has not ended yet", () => {
    const auction: Auction = {
      id: "1",
      title: "Red Corvette",
      endTime: FUTURE_ISO_STRING,
      bids: [],
    };
    expect(determineWinner(auction)).toBeNull();
  });

  it("should return null if the Auction has no Bids", () => {
    const auction: Auction = {
      id: "2",
      title: "Yellow Submarine",
      endTime: PAST_ISO_STRING,
      bids: [],
    };
    expect(determineWinner(auction)).toBeNull();
  });

  it("should select the winner with the highest Bid", () => {
    const auction: Auction = {
      id: "3",
      title: "Blue Falcon",
      endTime: PAST_ISO_STRING,
      bids: [
        { username: "alice", value: 150, time: PAST_ISO_STRING },
        { username: "betty", value: 100, time: PAST_ISO_STRING },
      ],
    };

    expect(determineWinner(auction)).toBe("alice");
  });

  it("should select the winner based on the first Bid in case of a tie", () => {
    const auction: Auction = {
      id: "4",
      title: "Mystery Machine",
      endTime: PAST_ISO_STRING,
      bids: [
        {
          username: "alice",
          value: 150,
          time: new Date(Date.now() - 50000).toISOString(),
        },
        {
          username: "betty",
          value: 150,
          time: new Date(Date.now() - 25000).toISOString(),
        },
      ],
    };

    expect(determineWinner(auction)).toBe("alice");
  });

  it("should consider the highest Bid by each user", () => {
    const auction: Auction = {
      id: "5",
      title: "Mario Kart",
      endTime: PAST_ISO_STRING,
      bids: [
        { username: "alice", value: 100, time: PAST_ISO_STRING },
        { username: "betty", value: 125, time: PAST_ISO_STRING },
        { username: "alice", value: 200, time: PAST_ISO_STRING },
        { username: "betty", value: 150, time: PAST_ISO_STRING },
        { username: "alice", value: 150, time: PAST_ISO_STRING },
      ],
    };

    expect(determineWinner(auction)).toBe("alice");
  });
});
