import {
  formatXRoadResponse,
  getSOAPKey,
  parseXRoadMessageBody
} from "./parse-message";
import { ErrorMessages } from "../types/ErrorMessages";

const WELL_FORMED_XROAD_REQUEST = `
    <SOAP-ENV:Envelope
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:xrd="http://x-road.eu/xsd/xroad.xsd"
        xmlns:id="http://x-road.eu/xsd/identifiers"
    >
        <SOAP-ENV:Header>
            <xrd:client id:objectType="SUBSYSTEM">
                <id:xRoadInstance>central-server</id:xRoadInstance>
                <id:memberClass>INT</id:memberClass>
                <id:memberCode>MSERV</id:memberCode>
                <id:subsystemCode>MONITOR</id:subsystemCode>
            </xrd:client>
            <xrd:service id:objectType="SERVICE">
                <id:xRoadInstance>central-server</id:xRoadInstance>
                <id:memberClass>INT</id:memberClass>
                <id:memberCode>MSERV</id:memberCode>
                <id:subsystemCode>SMARTPASSE</id:subsystemCode>
                <id:serviceCode>getSecurityServerOperationalData</id:serviceCode>
            </xrd:service>
            <xrd:securityServer id:objectType="SERVER">
              <id:xRoadInstance>central-server</id:xRoadInstance>
              <id:memberClass>INT</id:memberClass>
              <id:memberCode>MSERV</id:memberCode>
              <id:serverCode>SMARTPASS-01</id:serverCode>
            </xrd:securityServer>
            <xrd:protocolVersion>4.0</xrd:protocolVersion>
            <xrd:id>3854e35d-bf0f-44a6-867a-8e51f13daa7e</xrd:id>
        </SOAP-ENV:Header>
        <SOAP-ENV:Body />
    </SOAP-ENV:Envelope>
`;

describe("Parse the message", () => {
  describe("Request", () => {
    test("Should check for valid xml", () => {
      expect(() => parseXRoadMessageBody("<invalid><invalid>")).toThrow(
        ErrorMessages.INVALID_XML
      );
    });

    test("Should check for valid SOAP", () => {
      expect(() =>
        parseXRoadMessageBody("<invalid-soap></invalid-soap>")
      ).toThrow(
        `${ErrorMessages.GENERIC_SOAP_ERROR}: ${ErrorMessages.INVALID_SOAP}`
      );
    });

    test("Should check if the SOAP message contains a body", () => {
      expect(() =>
        parseXRoadMessageBody(`
                    <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:def="https://DefaultNamespace">
                    <x:Header/>
                </x:Envelope>
                `)
      ).toThrow(
        `${ErrorMessages.GENERIC_SOAP_ERROR}: ${ErrorMessages.SOAP_BODY_MISSING}`
      );
    });

    test("X-Road messages should have a header", () => {
      expect(() =>
        parseXRoadMessageBody(`
                    <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:def="https://DefaultNamespace">
                        <x:Body>
                        </x:Body>
                    </x:Envelope>
                `)
      ).toThrowError();
    });

    test("X-Road message header should contain all the required fields", () => {
      expect(() =>
        parseXRoadMessageBody(`
                    <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:def="https://DefaultNamespace">
                    <x:Header>
                        <!-- Client Header is Missing -->
                        <xrd:id>3854e35d-bf0f-44a6-867a-8e51f13daa7e</xrd:id>
                    </x:Header>
                    <x:Body>
                    </x:Body>
                </x:Envelope>
                `)
      ).toThrowError();
    });

    test("Should parse X-Road well formed messages", () => {
      const parsed = parseXRoadMessageBody(WELL_FORMED_XROAD_REQUEST);
      expect(parsed["SOAP-ENV:Envelope"]).toBeTruthy();
    });
  });

  describe("Response", () => {
    const parsedRequest = parseXRoadMessageBody(WELL_FORMED_XROAD_REQUEST);

    test("Should check for valid XML in the response", () => {
      expect(() => formatXRoadResponse(parsedRequest, `<invalid>`)).toThrow(
        ErrorMessages.INVALID_XML
      );
    });

    test("Should check for valid SOAP in the response body", () => {
      expect(() =>
        formatXRoadResponse(parsedRequest, `<invalid></invalid>`)
      ).toThrow(
        `${ErrorMessages.GENERIC_SOAP_ERROR}: ${ErrorMessages.INVALID_SOAP}`
      );
    });

    test("Should parse a valid soap envelope", () => {
      const response = formatXRoadResponse(
        parsedRequest,
        `
                 <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:def="https://DefaultNamespace">
                    <x:Body>
                        <name>name</name>
                    </x:Body>
                </x:Envelope>
            `
      );
      expect(response.indexOf("<name>name</name>")).toBeGreaterThan(0);
    });

    test("Should move extra namespaces in the envelope to the body", () => {
      const response = formatXRoadResponse(
        parsedRequest,
        `
                 <x:Envelope 
                    xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" 
                    xmlns:om="http://x-road.eu/xsd/op-monitoring.xsd"
                >
                    <x:Body>
                        <om:name>name</om:name>
                    </x:Body>
                </x:Envelope>
            `
      );

      const parsedResponse = parseXRoadMessageBody(response);
      const envelope = parsedResponse[getSOAPKey("Envelope", parsedResponse)];
      const body = envelope[getSOAPKey("Body", envelope)];

      expect(body["@_xmlns:om"]).toEqual(
        "http://x-road.eu/xsd/op-monitoring.xsd"
      );
    });

    test("Should not move the envelope namespace definition to the body", () => {
      const response = formatXRoadResponse(
        parsedRequest,
        `
                 <x:Envelope 
                    xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" 
                    xmlns:om="http://x-road.eu/xsd/op-monitoring.xsd"
                >
                    <x:Body>
                        <om:name>name</om:name>
                    </x:Body>
                </x:Envelope>
            `
      );

      const parsedResponse = parseXRoadMessageBody(response);
      const envelope = parsedResponse[getSOAPKey("Envelope", parsedResponse)];
      const body = envelope[getSOAPKey("Body", envelope)];

      expect(body["@_xmlns:x"]).toBeFalsy();
    });

    test("The body message should have only one element", () => {
      const response = formatXRoadResponse(
        parsedRequest,
        `
                <soapenv:Envelope xmlns:soapenv="https://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="https://www.w3.org/2001/XMLSchema" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">
                   <soapenv:Body>
                       <ScaWsConsutarGtaResponse soapenv:encodingStyle="https://schemas.xmlsoap.org/soap/encoding/">
                           <ScaWsConsutarGtaReturn href="#id0"/>
                       </ScaWsConsutarGtaResponse>
                       <multiRef id="id0" soapenc:root="0" soapenv:encodingStyle="https://schemas.xmlsoap.org/soap/encoding/" xsi:type="ns1:Map" xmlns:soapenc="https://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="https://xml.apache.org/xml-soap">
                           <item>
                               <key xsi:type="soapenc:string">Aglomera&#xE7;&#xE3;o/Explora&#xE7;&#xE3;o</key>
                               <value xsi:type="soapenc:string">5100045399</value>
                           </item>
                           <item>
                               <key xsi:type="soapenc:string">Data de Emiss&#xE3;o</key>
                               <value xsi:type="soapenc:string">14/12/2012</value>
                           </item>
                           <item>
                               <key xsi:type="soapenc:string">Estabelecimento</key>
                               <value xsi:type="soapenc:string">SITIO BOA VISTA</value>
                           </item>
                           <item>
                               <key xsi:type="soapenc:string">Grupo Esp&#xE9;cie</key>
                               <value xsi:type="soapenc:string">BOV</value>
                           </item>
                           <item>
                               <key xsi:type="soapenc:string">Produtor</key>
                               <value xsi:type="soapenc:string">VERGILIO MARTINEZ</value>
                           </item>
                           <item>
                               <key xsi:type="soapenc:string">Situa&#xE7;&#xE3;o</key>
                               <value xsi:type="soapenc:string">GTA RECEBIDO. DATA DE CHEGADA: 18/12/2012</value>
                           </item>
                       </multiRef>
                   </soapenv:Body>
                </soapenv:Envelope>
            `
      );

      const parsedResponse = parseXRoadMessageBody(response);
      const envelope = parsedResponse[getSOAPKey("Envelope", parsedResponse)];
      const body = envelope[getSOAPKey("Body", envelope)];

      const reqEnvelope =
        parsedResponse[getSOAPKey("Envelope", parsedResponse)];
      const reqHeader = reqEnvelope[getSOAPKey("Header", envelope)];
      const reqService = reqHeader[getSOAPKey("service", reqHeader)];
      const serviceCode = reqService[getSOAPKey("serviceCode", reqService)];

      // Filter the attributes
      const children = Object.keys(body).filter(
        (k: string) => !k.startsWith("@_") && k !== "#text"
      );

      expect(children.length).toEqual(1);
      expect(Object.keys(body)[0]).toContain(`${serviceCode}Response`);
    });
  });
});
