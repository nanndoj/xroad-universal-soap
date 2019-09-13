
## xroad-universal-soap

Nodejs proxy enabling regular SOAP messages with X-Road Security server. It intercepts the response and adds the required X-Road headers

## How it works

This project is ment to be installed together with a security server

The regular webservice:

```
http://wbs2.homol.detr.gov/wsServico/wsServicos.asmx?wsdl
```

Going through the proxy:

```
http://127.0.0.1:5991/wbs2.homol.detr.gov/wsServico/wsServicos.asmx?wsdl
```

## Installation

1. Clone this repository
2. run `npm install`
3. run `npm start`

The listening port can be configured in `index.ts`

## Limitations

- Only works with HTTP
- The soap must be self documented

**MIT Licensed**