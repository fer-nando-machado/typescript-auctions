# typescript-auctions

Sample Node REST API written in Typescript that implements a set of endpoints capable of creating auctions, accepting bids, and retrieving information about auctions.

All endpoints support a Basic authentication schema and user permissions are handled by an authorization middleware.

Clean architecture was put in practice to ensure the code's testability, reusability and extensibility, resulting in the following layers:

- `api`: interaction layer where the REST endpoints are exposed
- `core`: handles pure logic, allowing for easier and granular testing
- `data`: manages the in-code database, allowing for extension in the future
- `types`: exposes the interfaces used universally across the app

## Quick Start

The following commands are available:

### `npm install`

Installs application dependencies.

### `npm start` | `npm run dev`

Starts the server application locally at <http://localhost:3000>. Optionally in hot-reload `dev` mode.

### `npm test` (`:watch`) (`:coverage`)

Executes all available tests. Optionally accepts modifiers for `watch` or `coverage` mode.

### `npm run build`

Builds the app for production on the `dist` folder.

## Endpoints

Once the application is up and running, you can find a complete endpoint documentation at <http://localhost:3000/swagger>.

Here you can find some sample curl calls and their expected outputs:

### Create an auction

_request:_

```bash
curl -X POST -H "Content-Type: application/json" -u employee:employee_password -d '{"title": "Example Auction", "endTime": "2024-07-13T12:00:00Z"}' http://localhost:3000/auctions
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
  "endTime": "2024-07-13T12:00:00Z",
  "winnerUsername": null
}
```
