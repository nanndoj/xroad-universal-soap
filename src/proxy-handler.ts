import {parseRequestURL} from "./lib/parse-url";
import {Request, Response} from "express";
import {IURLObject} from "./types/IUrl";
import {formatXRoadResponse, parseXRoadMessageBody} from "./lib/parse-message";
import {IXroadRequest} from "./types/IXroadRequest";

export const proxyMiddleware = (proxy: any) => (req: IXroadRequest, res: Response, next: Function) => {
    const urlObject: IURLObject = parseRequestURL(req);

    req.url = urlObject.path;

    console.log('URL Object', urlObject);

    let bufferArr: any[] = [];
    req.on('data', function (data: any) {
        bufferArr.push(data)
    });

    req.on('end', function () {
        try {
            console.log('1 - Lendo request');
            const buffer = Buffer.concat(bufferArr);
            const message = parseXRoadMessageBody(buffer.toString());
            console.log('2 - message:', message);
            req.xroadRequestBody = message;
            console.log(3);
        } catch (err) {
            proxyErrorHandler(err, req, res);
        }

    });

    try {
        proxy.web(req, res, {
            target: `${urlObject.protocol}://${urlObject.host}`,
            changeOrigin: true
        }, (err: Error) => proxyErrorHandler(err, req, res));
    } catch(err) {
        proxyErrorHandler(err, req, res);
    }
};

export const proxyResponseHandler = (data: any, req: IXroadRequest) => {
    try {
        console.log(data.toString());
        console.log(formatXRoadResponse(req.xroadRequestBody, data.toString()));
        return formatXRoadResponse(req.xroadRequestBody, data.toString());
    } catch(err) {
        return err;
    }
};

export const proxyErrorHandler = (err: Error, req: Request, res: Response) => {
    console.log(err.toString());
    res.end(err.toString());
};