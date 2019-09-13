"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const isFQDN_1 = __importDefault(require("validator/lib/isFQDN"));
const isIP_1 = __importDefault(require("validator/lib/isIP"));
exports.parseRequestURL = req => {
  const url = req.url;
  if (!url || !url.length) {
    throw "Invalid URL";
  }
  const separator = "/";
  const urlParts = url.split(separator);
  if (url.startsWith(separator)) {
    urlParts.shift();
  }
  const host = urlParts[0];
  if (!isFQDN_1.default(host) && !isIP_1.default(host)) {
    throw "Parse Error: invalid host";
  }
  return {
    protocol: "http",
    host,
    path: ["", ...urlParts.slice(1)].join("/")
  };
};
//# sourceMappingURL=parse-url.js.map
