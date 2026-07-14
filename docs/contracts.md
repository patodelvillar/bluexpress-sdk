# Contratos API BlueX (verificados contra BlueX for WooCommerce 3.2.2)

Fuente analizada:

- `class-bluex-api-client.php`
- `class-wc-correios-settings.php`
- `class-wc-correios-webservice.php`
- `class-wc-correios-blocks-integration.php`
- `class-wc-correios-pudos-map.php`

Los endpoints HTTP cubiertos por el SDK no cambiaron entre 3.1.6 y 3.2.2. La
serie 3.2.x agregó principalmente comportamiento PUDO dentro de WooCommerce.

## Base URL

- Producción: `https://eplin.api.blue.cl`
- QA: `https://eplin.api.qa.blue.cl`
- Dev: `https://eplin.api.dev.blue.cl`

## Headers observados

Comunes:

- `Content-Type: application/json`
- `x-api-key: <api-key>`

Pricing agrega:

- `price: <declaredValue>`

## 1) Pricing

Endpoint:

- `POST /eplin/pricing/v1`

Request observado:

```json
{
  "from": { "country": "CL", "district": "SCL" },
  "to": { "country": "CL", "state": "13", "district": "PRO" },
  "serviceType": "EX",
  "domain": "https://tu-tienda.com/",
  "datosProducto": {
    "producto": "P",
    "familiaProducto": "PAQU",
    "bultos": [
      {
        "largo": 10,
        "ancho": 10,
        "alto": 10,
        "sku": "TEST01",
        "pesoFisico": 1,
        "cantidad": 1
      }
    ]
  }
}
```

Response consumido por plugin:

```json
{
  "code": "00",
  "message": "OK",
  "data": {
    "total": 1990,
    "promiseDay": 1,
    "nameService": "Express",
    "isShipmentFree": false
  }
}
```

Códigos de éxito usados por plugin: `00` y `01`.

## 2) Geolocalización comuna

Endpoint:

- `POST /api/ecommerce/comunas/v1/bxgeo`
- `POST /api/ecommerce/comunas/v1/bxgeo/v2` (cuando PUDO activo)

Request observado:

```json
{
  "address": "Providencia",
  "type": "woocommerce",
  "shop": "https://tu-tienda.com/",
  "regionCode": "13",
  "agencyId": ""
}
```

Campos de response usados por plugin:

```json
{
  "porcentageDeExito": "95%",
  "regionCode": "13",
  "cidadeName": "PROVIDENCIA",
  "cidadeCode": "PRO",
  "districtCode": "PRO",
  "pickupInfo": {
    "agency_name": "BlueX Pickup Example"
  }
}
```

## 3) Estado de integración

Endpoint:

- `POST /api/ecommerce/token/v1/ecommerce/integration-status`

Request observado:

```json
{
  "ecommerce": "Woocommerce",
  "accountName": "https://tu-tienda.com/"
}
```

Response consumido por plugin:

```json
{
  "activeIntegration": true,
  "storeId": "store-123",
  "message": "Integration active"
}
```

## 4) Actualizar credenciales de integración

Endpoint:

- `POST /api/ecommerce/token/v1/ecommerce/update-tokens`

Request observado:

```json
{
  "storeId": "store-123",
  "ecommerce": "Woocommerce",
  "credentials": {
    "accessToken": "clientKey",
    "secretKey": "clientSecret",
    "accountName": "https://tu-tienda.com/"
  }
}
```

## 5) Webhook de orden

Endpoint:

- `POST /api/integr/woocommerce-wh/v1/order`

Request observado:

- payload JSON de orden mapeado por el plugin.

## 6) Webhook de logs

Endpoint:

- `POST /api/ecommerce/custom/logs/v1`

Request observado:

```json
{
  "error": "mensaje de error",
  "order": { "...": "payload orden" }
}
```

## 7) PUDO en 3.2.2

El selector entrega un `agencyId` y, cuando están disponibles, el nombre y la
dirección del punto. El plugin los persiste como `agencyId`, `agencyName`,
`agencyAddress` e `isPudoSelected: "pudoShipping"`.

Para cotizar ese despacho se usa:

- geolocalización `/bxgeo/v2` con `agencyId`
- `familiaProducto: "PUDO"` en pricing

El método `bluex-pudo`, su modal, la migración de zonas y la reescritura a
`bluex-ex` son adaptaciones de WooCommerce y no forman parte del contrato HTTP.

## Validación del SDK

El SDK valida con `zod`:

- request payloads
- response payloads

Si falla, lanza `BluexpressValidationError`.
