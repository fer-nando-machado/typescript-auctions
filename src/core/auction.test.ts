import { determineWinner, placeBid } from "../core/auction";
import { Auction, KnownError } from "../types/auction";
import { find, insertBid } from "../data/auction";

const PAST_ISO_STRING = new Date(Date.now() - 10000).toISOString();
const FUTURE_ISO_STRING = new Date(Date.now() + 10000).toISOString();

jest.mock("../data/auction");

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

describe("placeBid", () => {
  it("should successfully place a Bid if all conditions are met", () => {
    jest.mocked(find).mockReturnValueOnce({
      id: "1",
      title: "Red Corvette",
      endTime: FUTURE_ISO_STRING,
      bids: [{ username: "alice", value: 100, time: PAST_ISO_STRING }],
    });

    const newBid = {
      username: "betty",
      value: 200,
      time: new Date().toISOString(),
    };
    const insertBidMock = insertBid as jest.Mock;
    placeBid("1", newBid);
    expect(insertBidMock).toHaveBeenCalledWith("1", newBid);
  });

  it("should throw an error if the Auction is not found", () => {
    jest.mocked(find).mockReturnValueOnce(undefined);

    expect(() =>
      placeBid("000000", {
        username: "alice",
        value: 200,
        time: new Date().toISOString(),
      })
    ).toThrow(KnownError.NotFound);
  });

  it("should throw an error if the Bid is placed after the Auction is over", () => {
    jest.mocked(find).mockReturnValueOnce({
      id: "1",
      title: "Yellow Submarine",
      endTime: PAST_ISO_STRING,
      bids: [],
    });

    expect(() =>
      placeBid("1", {
        username: "betty",
        value: 200,
        time: new Date().toISOString(),
      })
    ).toThrow(KnownError.Ended);
  });

  it("should throw an error if the Bid time conflicts with the latest Bid", () => {
    jest.mocked(find).mockReturnValueOnce({
      id: "1",
      title: "Blue Falcon",
      endTime: FUTURE_ISO_STRING,
      bids: [{ username: "alice", value: 100, time: PAST_ISO_STRING }],
    });

    expect(() =>
      placeBid("1", { username: "betty", value: 200, time: PAST_ISO_STRING })
    ).toThrow(KnownError.ConflictingBidTime);
  });

  it("should throw an error if the Bid value is lower than the latest Bid", () => {
    jest.mocked(find).mockReturnValueOnce({
      id: "1",
      title: "Mario Kart",
      endTime: FUTURE_ISO_STRING,
      bids: [{ username: "alice", value: 100, time: PAST_ISO_STRING }],
    });

    expect(() =>
      placeBid("1", {
        username: "betty",
        value: 50,
        time: new Date().toISOString(),
      })
    ).toThrow(KnownError.InferiorBidValue);
  });
});
