import isFQDN from 'validator/lib/isFQDN';
import isIP from 'validator/lib/isIP';
import {IURLObject} from "../types/IUrl";

export const parseURL = (url: string): IURLObject => {
    if(!url || !url.length) {
        throw "invalid URL";
    }

    const separator = '/';
    const urlParts = url.split(separator);

    if(url.startsWith(separator)) {
        // Remove the firs element
        urlParts.shift();
    }

    // The first part of the URL must be the HOST
    let host: string = urlParts[0];
    let port: number | undefined;

    // check if the host contains the port
    if(/:\d+$/.test(host)) {
        const hostParts = host.split(":");
        host = hostParts[0];
        port = parseInt(hostParts[1]);
    }

    if(!isFQDN(host) && !isIP(host)) {
        throw "invalid host"
    }

    return {
        protocol: 'http',
        host,
        port,
        path: ['', ...urlParts.slice(1)].join('/')
    }
};