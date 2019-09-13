"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_url_1 = require("./lib/parse-url");
const parse_message_1 = require("./lib/parse-message");
exports.proxyMiddleware = proxy => (req, res, next) => {
  const urlObject = parse_url_1.parseRequestURL(req);
  req.url = urlObject.path;
  let bufferArr = [];
  req.on("data", function(data) {
    bufferArr.push(data);
  });
  req.on("end", function() {
    try {
      const buffer = Buffer.concat(bufferArr);
      const message = parse_message_1.parseXRoadMessageBody(buffer.toString());
      req.xroadRequestBody = message;
    } catch (err) {
      exports.proxyErrorHandler(err, req, res);
    }
  });
  try {
    proxy.web(
      req,
      res,
      {
        target: `${urlObject.protocol}://${urlObject.host}`,
        changeOrigin: true
      },
      err => exports.proxyErrorHandler(err, req, res)
    );
  } catch (err) {
    exports.proxyErrorHandler(err, req, res);
  }
};
exports.proxyResponseHandler = (data, req) => {
  try {
    return parse_message_1.formatXRoadResponse(
      req.xroadRequestBody,
      data.toString()
    );
  } catch (err) {
    return err;
  }
};
exports.proxyErrorHandler = (err, req, res) => {
  res.end(err.toString());
};
//# sourceMappingURL=proxy-handler.js.map
