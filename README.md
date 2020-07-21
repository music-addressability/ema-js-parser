# EMA JS Parser

A Generic parser for Enhancing Music Notation Addressability (EMA) expressions ([read the API specification here](https://github.com/music-addressability/ema/blob/master/docs/api.md))

This parser is format agnostic, but requires some information about the document to which the EMA expression applies. These data must be structured according to the information request [documented in the API](https://github.com/music-addressability/ema/blob/master/docs/api.md#request-information-on-music-notation-document). For example:

```json
{
  "measures": 4,
  "staves": {"0" : ["Soprano", "Alto", "Tenor", "Bass"] },
}
```

Note that `measure_labels`, `beats`, and `completeness` from the EMA spec can be omitted. Stave labels can also be blank, but must be listed:

```json
"staves": {"0" : ["", "", "", ""] },
```

## Building and development

This is a TypeScript library that gets transpiled into JavaScript for use with Node and browsers. You'll need  [NodeJS](https://nodejs.org/) and a node package manager installed (we recommend [yarn](https://classic.yarnpkg.com/)).

To install and test:

```bash
yarn install
yarn test
```

To build JS code:

```bash
yarn build
```

## Usage

```js
import * as EmaExp from '../src/EmaExp'

// You can derive document information from an EMA server.
// `GET /{identifier}/info.json`
const docInfo = {
  measures: 4,
  staves: {0 : ['Soprano', 'Alto', 'Tenor', 'Bass'] },
  beats : {0 : {'count': 6, 'unit': 8} }
}

// return an EmaExpr object containing an EmaSelection measure selection with further selections in the object.
const exp = EmaExp.fromString(docInfo, '2-end/start-2/@all/cut')
// return an EmaSelection object containing a staff selection
const m = exp.selection.getMeasure(2)
// return an array of EmaBeatRage containing beat ranges
const s = m.getStaff(1)
// get start of beat range.
s[0].start
```

Methods are chainable:

```js
exp.selection.getMeasure(2).getStaff(1)[0].start
```

Beats do not get expanded (identified) because that's a job for the format-specific implementations.

See `tests/test.ts` for more examples.
