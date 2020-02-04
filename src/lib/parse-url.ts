import isFQDN from "validator/lib/isFQDN";
import isIP from "validator/lib/isIP";
import { IURLObject } from "../types/IUrl";

export const parseURL = (url: string): IURLObject => {
  if (!url || !url.length) {
    throw "invalid URL";
  }

  const separator = "/";
  const urlParts = url.split(separator);

  if (url.startsWith(separator)) {
    // Remove the firs element
    urlParts.shift();
  }

  // The first part of the URL must be the HOST
  let host: string = urlParts[0];
  let port: number | undefined;

  const portRegex = /:(\d+)$/;

  // check if the host contains the port
  if (portRegex.test(host)) {
    const portMatch = portRegex.exec(host);
    host = host.substr(0, host.lastIndexOf(":"));
    port = portMatch ? parseInt(portMatch[1]) : undefined;
  }

  if (!isValidHost(host)) {
    throw "invalid host";
  }

  return {
    protocol: "http",
    host,
    port,
    path: ["", ...urlParts.slice(1)].join("/")
  };
};

export const isValidHost = (hostInput: string) => {
  const basicAuthRegex = /[^:]+:[^@]+@.+/;
  let host = hostInput;

  if (basicAuthRegex.test(hostInput)) {
    host = hostInput.split("@")[1];
  }

  return isFQDN(host) || isIP(host);
};
