"use strict";
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const httpProxy = __importStar(require("http-proxy"));
const express_1 = __importDefault(require("express"));
const proxy_handler_1 = require("./proxy-handler");
const transformer_proxy_1 = __importDefault(require("transformer-proxy"));
const proxy = httpProxy.createProxyServer({});
const app = express_1.default();
proxy.on("error", proxy_handler_1.proxyErrorHandler);
app.use(transformer_proxy_1.default(proxy_handler_1.proxyResponseHandler));
app.use(proxy_handler_1.proxyMiddleware(proxy));
app.listen(5050, () => console.log(`Proxy server listening on port 5050`));
//# sourceMappingURL=index.js.map
