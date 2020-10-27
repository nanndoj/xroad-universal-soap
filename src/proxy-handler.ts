import { parseURL } from "./lib/parse-url";
import { Request, Response } from "express";
import { IURLObject } from "./types/IUrl";
import {
  formatXRoadResponse,
  parseXRoadMessageBody
} from "./lib/parse-message";
import { IXroadRequest } from "./types/IXroadRequest";
import chalk from "chalk";

import isGzip from "is-gzip";
import zlib from "zlib";

import _debug from "debug";
import { IncomingMessage } from "http";
const debug = _debug("soap-proxy");

export const proxyMiddleware = (proxy: any) => (
  req: IXroadRequest,
  res: Response,
  next: Function
) => {
  const protocol = req.protocol;
  const urlObject: IURLObject = parseURL(req.url);

  debug("Mounting the url object:");
  debug(urlObject);
  req.url = urlObject.path;

  req.isWSDL = req.url.toUpperCase().endsWith("WSDL");

  debug("isWSDL? ", req.isWSDL);
  if (!req.isWSDL) {
    let bufferArr: any[] = [];
    req.on("data", function(data: any) {
      bufferArr.push(data);
    });

    req.on("end", function() {
      try {
        const buffer = Buffer.concat(bufferArr);

        debug("Proxy response:");
        debug(buffer.toString());

        const message = parseXRoadMessageBody(buffer.toString());
        req.xroadRequestBody = message;
      } catch (err) {
        debug("error");
        proxyErrorHandler(err, req, res);
      }
    });
  }

  const port = urlObject.port ? `:${urlObject.port}` : "";

  debug("Host: ", `${protocol}://${urlObject.host}${port}`);

  if (!!urlObject.authorizationHeader) {
    debug("Authorization: ", urlObject.authorizationHeader);
    req.headers["authorization"] = urlObject.authorizationHeader;
  }

  try {
    proxy.web(
      req,
      res,
      {
        target: `${protocol}://${urlObject.host}${port}`,
        changeOrigin: true
      },
      (err: Error, data: IncomingMessage) => {
        debug(data);
      }
    );
  } catch (err) {
    proxyErrorHandler(err, req, res);
  }
};

export const proxyResponseHandler = (data: any, req: IXroadRequest) => {
  return new Promise((resolve, reject) => {
    try {
      if (req.isWSDL) {
        resolve(data);
      }
      if (isGzip(data)) {
        zlib.gunzip(data, (err, data) => {
          resolve(formatXRoadResponse(req.xroadRequestBody, data.toString()));
        });
      } else {
        resolve(formatXRoadResponse(req.xroadRequestBody, data.toString()));
      }
    } catch (err) {
      reject(err);
    }
  });
};

export const proxyErrorHandler = (err: Error, req: Request, res: Response) => {
  debug(chalk.red("Error proxying the request:"));
  debug(err);
  res.end(err.toString());
};
