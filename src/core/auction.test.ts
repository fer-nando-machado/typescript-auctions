import { selectWinner } from "../core/auction";
import { Auction } from "../types/auction";

describe("selectWinner", () => {
  it("should return null if the auction has not ended yet", () => {
    const auction: Auction = {
      id: "1",
      title: "Test",
      endTime: new Date(Date.now() + 10000).toISOString(),
      bids: [],
    };
    expect(selectWinner(auction)).toBeNull();
  });

  it("should return null if the auction has no bids", () => {
    const auction: Auction = {
      id: "1",
      title: "Test",
      endTime: new Date(Date.now() - 10000).toISOString(),
      bids: [],
    };
    expect(selectWinner(auction)).toBeNull();
  });

  it("should select the winner with the highest bid", () => {
    const auction: Auction = {
      id: "1",
      title: "Test",
      endTime: new Date(Date.now() - 10000).toISOString(),
      bids: [
        { username: "alice", value: 150 },
        { username: "betty", value: 100 },
      ],
    };

    expect(selectWinner(auction)).toBe("alice");
  });

  it("should select the winner based on the first bid in case of a tie", () => {
    const auction: Auction = {
      id: "1",
      title: "Test",
      endTime: new Date(Date.now() - 10000).toISOString(),
      bids: [
        { username: "alice", value: 150 },
        { username: "betty", value: 150 },
      ],
    };

    expect(selectWinner(auction)).toBe("alice");
  });

  it("should consider the highest bid by each user", () => {
    const auction: Auction = {
      id: "1",
      title: "Test",
      endTime: new Date(Date.now() - 10000).toISOString(),
      bids: [
        { username: "alice", value: 100 },
        { username: "betty", value: 125 },
        { username: "alice", value: 200 },
        { username: "betty", value: 150 },
        { username: "alice", value: 150 },
      ],
    };

    expect(selectWinner(auction)).toBe("alice");
  });
});
