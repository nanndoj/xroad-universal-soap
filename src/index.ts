import * as httpProxy from 'http-proxy';
import express from 'express';
import {proxyErrorHandler, proxyMiddleware,  proxyResponseHandler} from "./proxy-handler";
//@ts-ignore
import transformerProxy from 'transformer-proxy';

// Create a proxy server with custom application logic
// @ts-ignore
const proxy = httpProxy.createProxyServer({});
const app = express();

proxy.on('error', proxyErrorHandler);

app.use(transformerProxy(proxyResponseHandler));
// @ts-ignore
app.use(proxyMiddleware(proxy));


const PORT = 5991;
app.listen(PORT, () => console.log(`Proxy server listening on port ${PORT}`))