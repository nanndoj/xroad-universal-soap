import parser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

const GENERIC_XROAD_ERROR = "Invalid X-Road Message";

const parserOptions = {
    parseNodeValue: false,
    ignoreAttributes : false,
    trimValues: false
};

export const parseXRoadMessageBody = (messageBody: string): Record<string, any> => {
    const parsed = parseMessageBody(messageBody);

    // Check if it is a valid X-Road message
    verifyXRoadMessage(parsed);

    return parsed;

};

export const parseMessageBody = (messageBody: string): Record<string, any> => {
    if(!isValidXML(messageBody)) {
        throw "The message is not a valid XML"
    }

    const parsed: Record<string, any> = parser.parse(messageBody, parserOptions);

    // Check if it is a valid soap message
    verifySOAP(parsed);

    return parsed;

};

export const isValidXML = (message: string): boolean => {
    return parser.validate(message) === true
};

const verifySOAP = (parsed: Record<string, any>) => {
    // Check if the first level is a soap Envelope
    const keys = Object.keys(parsed);

    const GENERIC_SOAP_ERROR = "Invalid SOAP Message";

    if(keys.length !== 1) {
        throw GENERIC_SOAP_ERROR
    }

    if(!keys[0].endsWith(':Envelope')) {
        throw `${GENERIC_SOAP_ERROR}: Not a valid SOAP Envelope`;
    }

    // Check if the Envelope content has a Body
    const envelopeContent = parsed[keys[0]];
    const bodyKey = getSOAPKey('Body', envelopeContent);

    if(!bodyKey) {
        throw `${GENERIC_SOAP_ERROR}: The message doesn't contain a Body element`;
    }
};

export const verifyXRoadMessage = (parsed: Record<string, any>) => {
    const envelopeKey = Object.keys(parsed)[0];
    const envelope = parsed[envelopeKey];

    const DOC_URL = "https://github.com/nordic-institute/X-Road/blob/develop/doc/Protocols/pr-mess_x-road_message_protocol.md#annex-e-example-messages";

    // A header is required for X-Road Messages
    const headerKey = getSOAPKey('Header', envelope);

    if(!headerKey) {
        throw `${GENERIC_XROAD_ERROR}: A Header element is required for X-Road messages. Please check ${DOC_URL}`;
    }

    const header = envelope[headerKey];

    // Check for the required header fields
    const requiredFields = ['client', 'service', 'protocolVersion', 'id'];

    requiredFields.forEach(field => {
        if(!getSOAPKey(field, header)) {
                throw `${GENERIC_XROAD_ERROR}: Make sure the envelope header contains the field '${field}' as especified in ${DOC_URL}`;
        }
    })
};

export const formatXRoadResponse = (parsedRequest: Record<string, any>, responseBodyString: string): string => {

    const parsedResponse = parseMessageBody(responseBodyString);

    // Find the response body
    const responseEnvelopeKey = getSOAPKey('Envelope', parsedResponse);
    const responseEnvelope = parsedResponse[responseEnvelopeKey];

    const responseBodyKey = getSOAPKey('Body', responseEnvelope);
    const responseBody = responseEnvelope[responseBodyKey];

    // REPLACE THE REQUEST BODY WITH THE RESPONSE BODY




    const requestEnvelopeKey = getSOAPKey('Envelope', parsedRequest);
    const requestEnvelope = parsedRequest[requestEnvelopeKey];
    console.log(requestEnvelope);

    const requestBodyKey = getSOAPKey('Body', requestEnvelope);
    requestEnvelope[requestBodyKey] = responseBody;


    var parser = new j2xParser(parserOptions);
    var xml = parser.parse(parsedRequest);
    return xml;

};

export const getSOAPKey = (suffix: string, part: Record<string, any>): string => {
    return Object.keys(part).find(k => k.endsWith(`:${suffix}`)) || '';
};