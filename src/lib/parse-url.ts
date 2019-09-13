import isFQDN from 'validator/lib/isFQDN';
import isIP from 'validator/lib/isIP';
import {IURLObject} from "../types/IUrl";
import { Request } from "express";
import {IncomingMessage} from "http";

export const parseRequestURL = (req: IncomingMessage): IURLObject =>  {
    const url = req.url;

    if(!url || !url.length) {
        throw "Invalid URL";
    }

    const separator = '/';
    const urlParts = url.split(separator);

    if(url.startsWith(separator)) {
        // Remove the firs element
        urlParts.shift();
    }

    // The first part of the URL must be the HOST
    const host = urlParts[0];

    if(!isFQDN(host) && !isIP(host)) {
        throw "Parse Error: invalid host"
    }

    return {
        protocol: 'http',
        host,
        path: ['', ...urlParts.slice(1)].join('/')
    }

};