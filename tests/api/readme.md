
```bash
./run_tests.sh
```

```bash
curl -v -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "https://pil0cldk6a.execute-api.us-west-2.amazonaws.com/-dev-ff8acfd/worlds"
```

```bash
curl -v -w "\n%{http_code}" \
        -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"grubman2\", \"password\":\"iLoveworms123!\", \"email\":\"hookt@oregonstate.edu\"}" \
        "https://pil0cldk6a.execute-api.us-west-2.amazonaws.com/-dev-ff8acfd/signup"
```