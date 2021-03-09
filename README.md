# HIKICK OpenAPI License

운전면허를 인증할 수 있습니다. 아래와 같이 요청하여 사용할 수 있습니다.

```bash
curl --location --request POST 'https://openapi.hikick.kr/v1/license' \
--header 'Content-Type: application/json' \
--header 'X-Hikick-Platform-Access-Key-Id: <HIKICK PLATFORM ACCESS KEY ID>'
--header 'X-Hikick-Platform-Secret-Access-key: <HIKICK PLATFORM SECRET ACCESS KEY>'
--data-raw '{
    "realname": "성함",
    "birthday": "1970-01-01",
    "identity": "000000",
    "license": ["서울", "00", "000000", "00"]
}'
```
