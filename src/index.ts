import * as httpProxy from 'http-proxy';
import express from 'express';
import http from 'http';
import https, { AgentOptions } from 'https';
import path from 'path';
import fs from 'fs';
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

// Create the http server
const HTTP_PORT = process.env.PORT || 5080;
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => console.log(`Proxy server listening on http port ${HTTP_PORT}`));

// Create the https server
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const KEY = process.env.KEY || path.join(__dirname, 'sslcert/localhost.key.pem');
const CERT = process.env.CERT || path.join(__dirname, 'sslcert/localhost.cert.pem');

const privateKey  = fs.readFileSync(KEY, 'utf8');
const certificate = fs.readFileSync(CERT, 'utf8');

const credentials: AgentOptions = {key: privateKey, cert: certificate};

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(HTTPS_PORT, () => console.log(`Proxy server listening on https port ${HTTPS_PORT}`));