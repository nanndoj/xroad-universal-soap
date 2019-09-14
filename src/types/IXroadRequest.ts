import { Request } from "express";

export interface IXroadRequest extends Request {
    xroadRequestBody: Record<string, any>;
    isWSDL: boolean;
}