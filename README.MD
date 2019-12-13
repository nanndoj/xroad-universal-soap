
## xroad-universal-soap

Nodejs proxy enabling regular SOAP messages with X-Road Security server. It intercepts the response and adds the required X-Road headers

## How it works

This project is meant to be installed together with a security server

The regular webservice:

```
http://wbs2.homol.detr.gov/wsServico/wsServicos.asmx?wsdl
```

Going through the proxy:

```
http://127.0.0.1:5991/wbs2.homol.detr.gov/wsServico/wsServicos.asmx?wsdl
```

## Installation

1. Generate the [SSL Certificates](#ssl)
2. run `npm install`
3. run `npm start`

The default listening ports can be configured by set the environment variables: 
```
HTTP_PORT=5080    
HTTPS_PORT=5443
```

## SSL

Before run the soap proxy server, the SSL certificates must be generated and trusted in order to work with HTTPS

**MIT Licensed**