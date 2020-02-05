import isFQDN from "validator/lib/isFQDN";
import isIP from "validator/lib/isIP";
import { IURLObject } from "../types/IUrl";
import { encode } from "base-64";

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
  let authorizationHeader: string | undefined;

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

  if (isBasicAuth(host)) {
    authorizationHeader = `Basic ${encode(host.substr(0, host.indexOf("@")))}`;
    host = host.split("@")[1];
  }

  return {
    protocol: "http",
    host,
    authorizationHeader,
    port,
    path: ["", ...urlParts.slice(1)].join("/")
  };
};

export const isValidHost = (hostInput: string) => {
  let host = hostInput;

  if (isBasicAuth(hostInput)) {
    host = hostInput.split("@")[1];
  }

  return isFQDN(host) || isIP(host);
};

export const isBasicAuth = (hostInput: string) => {
  const basicAuthRegex = /[^:]+:[^@]+@.+/;
  return basicAuthRegex.test(hostInput);
};
