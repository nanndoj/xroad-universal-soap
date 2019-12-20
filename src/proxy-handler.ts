import { parseURL } from "./lib/parse-url";
import { Request, Response } from "express";
import { IURLObject } from "./types/IUrl";
import {
  formatXRoadResponse,
  parseXRoadMessageBody
} from "./lib/parse-message";
import { IXroadRequest } from "./types/IXroadRequest";

export const proxyMiddleware = (proxy: any) => (
  req: IXroadRequest,
  res: Response,
  next: Function
) => {
  const protocol = req.protocol;
  const urlObject: IURLObject = parseURL(req.url);

  req.url = urlObject.path;
  req.isWSDL = req.url.toUpperCase().endsWith("WSDL");

  if (!req.isWSDL) {
    let bufferArr: any[] = [];
    req.on("data", function(data: any) {
      bufferArr.push(data);
    });

    req.on("end", function() {
      try {
        const buffer = Buffer.concat(bufferArr);
        const message = parseXRoadMessageBody(buffer.toString());
        req.xroadRequestBody = message;
      } catch (err) {
        proxyErrorHandler(err, req, res);
      }
    });
  }

  const port = urlObject.port ? `:${urlObject.port}` : "";

  try {
    proxy.web(
      req,
      res,
      {
        target: `${protocol}://${urlObject.host}${port}`,
        changeOrigin: true
      },
      (err: Error) => proxyErrorHandler(err, req, res)
    );
  } catch (err) {
    proxyErrorHandler(err, req, res);
  }
};

export const proxyResponseHandler = (data: any, req: IXroadRequest) => {
  try {
    if (req.isWSDL) {
      return data;
    }

    return formatXRoadResponse(req.xroadRequestBody, data.toString());
  } catch (err) {
    return err;
  }
};

export const proxyErrorHandler = (err: Error, req: Request, res: Response) => {
  res.end(err.toString());
};
