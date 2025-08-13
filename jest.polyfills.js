// jest.polyfills.js
// Polyfills necesarios para MSW en Node.js

const { TextDecoder, TextEncoder } = require('util');

// Polyfills para APIs web en Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill para fetch usando undici
const { fetch, Request, Response } = require('undici');

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
