import { parseURL } from "./parse-url";
import { encode } from "base-64";

const TEST_HOST = "wbs2.homol.detr.gov";
const TEST_URL = `${TEST_HOST}/wsServico/wsServicos.asmx?wsdl`;

describe("Parse the request url", () => {
  test("Sould check if the url is not empty", () => {
    expect(() => parseURL("")).toThrow("invalid URL");
  });

  test("Should check if the url has a valid host", () => {
    expect(() => parseURL("123456#!@/invalid/host")).toThrow("invalid host");
  });

  test("The first path segment must be the host", () => {
    expect(parseURL(`/${TEST_URL}`).host).toEqual(TEST_HOST);
  });

  test("Sould allow IP address as host", () => {
    const ipHost = "192.168.1.5";
    expect(parseURL(`/${ipHost}/test/ip/host`).host).toEqual(ipHost);
  });

  test("Sould verify ip hosts", () => {
    const ipHost = "192.162";
    expect(() => parseURL(`/${ipHost}/test/ip/host`)).toThrow("invalid host");
  });

  test("Should allow hosts with port specification", () => {
    const port = 8080;
    expect(parseURL(`/${TEST_HOST}:${port}/test/ip/host`)).toMatchObject({
      host: TEST_HOST,
      port
    });
  });

  test("Should allow optional path segments", () => {
    expect(parseURL(`/${TEST_HOST}`)).toMatchObject({
      host: TEST_HOST,
      path: ""
    });
  });

  test("Should validate urls containing basic authentication", () => {
    const host = "192.168.1.5";
    const completeHost = `fernando:test@${host}`;
    expect(parseURL(`/${completeHost}/test/ip/host`).host).toEqual(host);
  });

  test("Should load the basic authentication as header", () => {
    const host = "192.168.1.5";
    const auth = "fernando:test";
    const completeHost = `${auth}@${host}`;
    const urlObject = parseURL(`/${completeHost}/test/ip/host`);
    expect(urlObject.authorizationHeader).toEqual(`Basic ${encode(auth)}`);
  });
});
