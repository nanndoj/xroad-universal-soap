import {parseURL} from "./parse-url";

const TEST_HOST = "wbs2.homol.detr.gov";
const TEST_URL = `${TEST_HOST}/wsServico/wsServicos.asmx?wsdl`;

describe('Parse the message', () => {
    test('Sould check if the url is not empty', () => {
        expect(
            () => parseURL("")
        ).toThrow("invalid URL");
    });
});