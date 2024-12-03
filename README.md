# typescript-auctions

Sample Node REST API written in Typescript that implements a set of endpoints capable of creating Auctions, accepting Bids, and retrieving detailed information about existing Auctions.

In order to be accepted, a Bid must be placed on a currently active Auction, the timestamp of that Bid must be later than the last registered Bid, and its value must be higher the highest Bid. This ensures the system only keeps track of a sequence of valid Bids and a provides a better feedback for the User placing the Bid.

The winner of an Auction is defined by the highest bid placed before the ending time. In the event of a tie, the first user to place that bid is the winner. Only the highest bid of each User should be considered.

Endpoints are protected by a Basic authentication schema (`-u username:password`). User permissions are specific to each endpoint and are handled by an authorization middleware.

Clean architecture was put in practice to ensure the code's testability, reusability and extensibility, resulting in the following layers:

- `api`: interaction layer where the REST endpoints are exposed
- `core`: handles logic, allowing for easier and granular testing
- `data`: manages the in-memory database, allowing for extension in the future
- `types`: exposes interfaces and known errors used universally across the app

To ensure compatibility with the automated assessment, the endpoints follow the provided [API specs](./openapi.yaml) without any modification.

## Quick Start

The following commands are available:

### `npm install`

Installs application dependencies.

### `npm start` | `npm run dev`

Starts the server application locally at <http://localhost:3000>. Optionally in hot-reload `dev` mode.

### `npm run test` (`:watch`) (`:coverage`)

Executes all available tests. Optionally accepts modifiers for `watch` or `coverage` mode.

### `npm run build`

Builds the app for production on the `dist` folder.

## Endpoints

Once the application is up and running, you can find a complete endpoint documentation at <http://localhost:3000/docs>.

Here you can find some sample curl calls and their expected outputs:

### Create an auction

_request:_

```bash
curl -X POST -H "Content-Type: application/json" -u employee:employee_password -d '{"title": "Example Auction", "endTime": "2024-07-12T12:00:00Z"}' http://localhost:3000/auctions
```

_response:_

```json
{ "id": "abc123" }
```

### Place a bid on an auction

_request:_

```bash
curl -X POST -H "Content-Type: application/json" -u bidder1:bidder1_password -d '{"value": 50.50}' http://localhost:3000/auctions/abc123/bid
```

_response:_

```json

```

### Get an auction by ID

_request:_

```bash
curl -X GET -H "Authorization: Basic YmlkZGVyMTpiaWRkZXIxX3Bhc3N3b3Jk" http://localhost:3000/auctions/abc123
```

_response:_

```json
{
  "title": "Example Auction",
  "id": "abc123",
  "endTime": "2024-07-12T12:00:00Z",
  "winnerUsername": null
}
```
