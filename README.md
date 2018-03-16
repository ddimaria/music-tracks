# Music Tracks
This NodeJS server was authored in the KOA framework with TypeScript.

[![Build Status](https://travis-ci.org/ddimaria/music-tracks.svg?branch=develop)](https://travis-ci.org/ddimaria/music-tracks)

The functional requirements are:
* Create an endpoint for rendering a json list of tracks. The endpoint should demonstrate the following behavior:
* Rendered properties:
  * Name, Filesize, and Duration of each track
  * Render a count of the number of playlists each track is in.

## Prerequisites
* Node.js (8+): recommend using [nvm](https://github.com/creationix/nvm)
* Docker (if building a docker image) https://www.docker.com/docker-mac

## Installation
First, clone this repo and `cd` into the main directory.  Then:
```shell
npm install
```

## Development
During development, the `/app` folder is being watched for changes.

All changes invoke the TypeScript compiler, which restarts the app upon completion.
```shell
npm run watch
```

## Build the Server
To compile the TypeScript code and place into the `/dist` folder:
```shell
npm build
```

## Code Linter
A TypeScript linter has been added to keep code consistent among developers.
```shell
npm run lint
```
To autofix linting errors (not all errors are auto-fixable):
```shell
npm run fix
```

## Tests and Coverage
The test coverage percentage should be 90% or greater for any submitted PRs.

For TDD, invoke continuous testing by:
```shell
npm test
```
For an html and text coverage report (html located in the `/coverage` folder):
```shell
npm run coverage
```

## Docker
To build a container using the `dockerfile`:
```shell
npm run image:build -- --no-cache
```

To run the server within the container:
```shell
npm run image:run -- start --
```

---

## API
For a swagger version of this documention, see http://localhost:3000/swagger

## Get Tracks
#### GET `/api/v1/tracks?keyword={keyword}&category={category}&limit={limit}&offset={offset}&sort={sort}`
Retrieves an array of tracks that match the query string criteria.
#### Request
Filters are passed in the query string:

| Name | Type | Description | Possible Values |
| --- | --- | --- | --- |
| keyword | string | All or part of a word to match against | any string |
| category | string | Catetories to search | name, composer, album, genre, artist, all (default) |
| limit | number | Limits the number of returned matches | any positive integer |
| offset | number | For paging, it specifies the number of rows to skip | any positive integer |
| sort | string | Sorts the results: `+` for asc, `-` for desc | +name,+filesize,+duration,+playlistcount |

#### Response
If not matches, then a `404 Not Found` is returned, otherwise:
```js
[
  {
    "Name": "Walk On Water",  // name of the track
    "Filesize": 9.27,         // in MB
    "Duration": 4.93,         // in minutes
    "PlaylistCount": 3        // the number of playists this track appears in
  },
  ....etc
]
```

---

## Assumptions
* Megabytes expressed in base 2.

## Design Decisions
* Since I've only played with `KOA` once before, it was chosen as the node server framework.
* To get some degree of type safety and better editor autocomplete and insights, `typescript` was implemented.
* To keep things simple and portable, `sqlite` was added for file-based data persistence.
* I'm using ES6 imports/exports rather than Node's CommonJS module loader to have parity with my frontend coding style.
* I skipped using an ORM and a DB migration/seeder b/c of the simplicity of this endpoint and b/c the DB is readonly and already created.

## Thoughts on Improvements
Because time was limited, there were many improvements I didn't implement.  These include:
* As the project grows, segment files into folders (e.g. routes, config, db, models, controllers ...etc).
* Implement knex or sequelize.
* Swaggerize the docblocks for the routes.
* Implement a .env file with `dotenv`.
