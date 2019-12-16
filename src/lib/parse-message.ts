import parser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";
import { ErrorMessages } from "../types/ErrorMessages";
import {
  IgnoredEnvelopeAttributeValues,
  XRoadRequiredFields
} from "./constants";

const GENERIC_XROAD_ERROR = "Invalid X-Road Message";

const parserOptions = {
  parseNodeValue: false,
  ignoreAttributes: false,
  trimValues: false
};

export const parseXRoadMessageBody = (
  messageBody: string
): Record<string, any> => {
  const parsed = parseMessageBody(messageBody);

  // Check if it is a valid X-Road message
  verifyXRoadMessage(parsed);

  return parsed;
};

export const parseMessageBody = (messageBody: string): Record<string, any> => {
  if (!isValidXML(messageBody)) {
    throw ErrorMessages.INVALID_XML;
  }

  const parsed: Record<string, any> = parser.parse(messageBody, parserOptions);

  // Check if it is a valid soap message
  verifySOAP(parsed);

  return parsed;
};

export const isValidXML = (message: string): boolean => {
  return parser.validate(message) === true;
};

const verifySOAP = (parsed: Record<string, any>) => {
  // Check if the first level is a soap Envelope

  const GENERIC_SOAP_ERROR = ErrorMessages.GENERIC_SOAP_ERROR;

  const envelopeKey = getSOAPKey("Envelope", parsed);

  if (!envelopeKey) {
    throw `${GENERIC_SOAP_ERROR}: ${ErrorMessages.INVALID_SOAP}`;
  }

  // Check if the Envelope content has a Body
  const envelopeContent = parsed[envelopeKey];
  const bodyKey = getSOAPKey("Body", envelopeContent);

  if (!bodyKey) {
    throw `${GENERIC_SOAP_ERROR}: ${ErrorMessages.SOAP_BODY_MISSING}`;
  }
};

export const verifyXRoadMessage = (parsed: Record<string, any>) => {
  const envelopeKey = getSOAPKey("Envelope", parsed);
  const envelope = parsed[envelopeKey];

  const DOC_URL =
    "https://github.com/nordic-institute/X-Road/blob/develop/doc/Protocols/pr-mess_x-road_message_protocol.md#annex-e-example-messages";

  // A header is required for X-Road Messages
  const headerKey = getSOAPKey("Header", envelope);

  if (!headerKey) {
    throw `${GENERIC_XROAD_ERROR}: A Header element is required for X-Road messages. Please check ${DOC_URL}`;
  }

  const header = envelope[headerKey];

  // Check for the required header fields
  XRoadRequiredFields.forEach(field => {
    if (!getSOAPKey(field, header)) {
      throw `${GENERIC_XROAD_ERROR}: Make sure the envelope header contains the field '${field}' as especified in ${DOC_URL}`;
    }
  });
};

export const formatXRoadResponse = (
  parsedRequest: Record<string, any>,
  responseBodyString: string
): string => {
  const parsedResponse = parseMessageBody(responseBodyString);

  // Find the response body
  const responseEnvelopeKey = getSOAPKey("Envelope", parsedResponse);
  const responseEnvelope = parsedResponse[responseEnvelopeKey];

  const responseBodyKey = getSOAPKey("Body", responseEnvelope);
  let responseBody = copyHeaders(
    responseEnvelope,
    responseEnvelope[responseBodyKey]
  );

  // REPLACE THE REQUEST BODY WITH THE RESPONSE BODY
  const requestEnvelopeKey = getSOAPKey("Envelope", parsedRequest);
  const requestEnvelope = parsedRequest[requestEnvelopeKey];

  const requestBodyKey = getSOAPKey("Body", requestEnvelope);

  // FIX PROBLEMS WHEN THE RESPONSE BODY HAS MORE THAN ONE ELEMENT
  const children = Object.keys(responseBody).filter(
    (k: string) => !k.startsWith("@_") && k !== "#text"
  );

  if (children.length > 1) {
    const reqHeader = requestEnvelope[getSOAPKey("Header", requestEnvelope)];
    const reqService = reqHeader[getSOAPKey("service", reqHeader)];
    const serviceCode = reqService[getSOAPKey("serviceCode", reqService)];

    // Create a wrapper
    responseBody = { [`${serviceCode}Response`]: responseBody };
  }

  requestEnvelope[requestBodyKey] = responseBody;

  var parser = new j2xParser(parserOptions);
  var xml = parser.parse(parsedRequest);
  return xml;
};

export const copyHeaders = (
  envelope: Record<string, any>,
  body: Record<string, any>
): Record<string, any> => {
  const attributes = Object.keys(envelope).filter(
    k =>
      k.startsWith("@_") &&
      IgnoredEnvelopeAttributeValues.indexOf(envelope[k]) === -1
  );
  attributes.forEach(attr => (body[attr] = envelope[attr]));
  return body;
};

export const getSOAPKey = (
  suffix: string,
  part: Record<string, any>
): string => {
  return Object.keys(part).find(k => k.endsWith(`:${suffix}`)) || "";
};
