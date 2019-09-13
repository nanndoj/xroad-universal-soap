"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
const fast_xml_parser_2 = require("fast-xml-parser");
const GENERIC_XROAD_ERROR = "Invalid X-Road Message";
const parserOptions = {
  parseNodeValue: false,
  ignoreAttributes: false,
  trimValues: false
};
exports.parseXRoadMessageBody = messageBody => {
  const parsed = exports.parseMessageBody(messageBody);
  exports.verifyXRoadMessage(parsed);
  return parsed;
};
exports.parseMessageBody = messageBody => {
  if (!exports.isValidXML(messageBody)) {
    throw "The message is not a valid XML";
  }
  const parsed = fast_xml_parser_1.default.parse(messageBody, parserOptions);
  verifySOAP(parsed);
  return parsed;
};
exports.isValidXML = message => {
  return fast_xml_parser_1.default.validate(message) === true;
};
const verifySOAP = parsed => {
  const keys = Object.keys(parsed);
  const GENERIC_SOAP_ERROR = "Invalid SOAP Message";
  if (keys.length !== 1) {
    throw GENERIC_SOAP_ERROR;
  }
  if (!keys[0].endsWith(":Envelope")) {
    throw `${GENERIC_SOAP_ERROR}: Not a valid SOAP Envelope`;
  }
  const envelopeContent = parsed[keys[0]];
  const bodyKey = exports.getSOAPKey("Body", envelopeContent);
  if (!bodyKey) {
    throw `${GENERIC_SOAP_ERROR}: The message doesn't contain a Body element`;
  }
};
exports.verifyXRoadMessage = parsed => {
  const envelopeKey = Object.keys(parsed)[0];
  const envelope = parsed[envelopeKey];
  const DOC_URL =
    "https://github.com/nordic-institute/X-Road/blob/develop/doc/Protocols/pr-mess_x-road_message_protocol.md#annex-e-example-messages";
  const headerKey = exports.getSOAPKey("Header", envelope);
  if (!headerKey) {
    throw `${GENERIC_XROAD_ERROR}: A Header element is required for X-Road messages. Please check ${DOC_URL}`;
  }
  const header = envelope[headerKey];
  const requiredFields = ["client", "service", "protocolVersion", "id"];
  requiredFields.forEach(field => {
    if (!exports.getSOAPKey(field, header)) {
      throw `${GENERIC_XROAD_ERROR}: Make sure the envelope header contains the field '${field}' as especified in ${DOC_URL}`;
    }
  });
};
exports.formatXRoadResponse = (parsedRequest, responseBodyString) => {
  const parsedResponse = exports.parseMessageBody(responseBodyString);
  const responseEnvelopeKey = exports.getSOAPKey("Envelope", parsedResponse);
  const responseEnvelope = parsedResponse[responseEnvelopeKey];
  const responseBodyKey = exports.getSOAPKey("Body", responseEnvelope);
  const responseBody = responseEnvelope[responseBodyKey];
  const requestEnvelopeKey = exports.getSOAPKey("Envelope", parsedRequest);
  const requestEnvelope = parsedRequest[requestEnvelopeKey];
  console.log(requestEnvelope);
  const requestBodyKey = exports.getSOAPKey("Body", requestEnvelope);
  requestEnvelope[requestBodyKey] = responseBody;
  var parser = new fast_xml_parser_2.j2xParser(parserOptions);
  var xml = parser.parse(parsedRequest);
  return xml;
};
exports.getSOAPKey = (suffix, part) => {
  return Object.keys(part).find(k => k.endsWith(`:${suffix}`)) || "";
};
//# sourceMappingURL=parse-message.js.map
