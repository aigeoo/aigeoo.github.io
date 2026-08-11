---
title: "Proxying the proxy: extending BurpSuite with mitmproxy"
description: "Some apps bury every request under machinery Burp was never built to unwind. The fix isn't a better Burp — it's a little mitmproxy on either side."
date: 2026-08-12
lang: en
tags:
  - security
  - web
  - burp
  - mitmproxy
---

Burp is where I think about a request: tamper it, replay it, fuzz it. But some apps wrap every request in machinery Burp was never built to unwind. You can bend it around a few of these cases with macros and extensions, but past a certain point it's surgery in oven mitts.

The move in every case here is the same. Put `mitmproxy` in front of or behind Burp and let it do the mechanical work so that inside Burp you're always staring at clean, tamperable traffic.

## Surviving a 30s access token

### The token that dies while you think

The app's JWT access token expires 30 seconds after it's issued. Fine for the app, which refreshes silently in the background but it will be miserable in Repeater. You craft a request, start reading the response, tweak a parameter, resend → `401 Unauthorized`. The token died mid-thought. Re-login, copy, paste, race the clock, repeat.

The obvious fix is a [Burp macro](https://portswigger.net/burp/documentation/desktop/settings/sessions/macros) that calls the refresh endpoint before each request. Except this app's refresh endpoint doesn't just take the refresh token. It wants the **current access token *and* the refresh token together**:

![The refresh request pairing the access and refresh tokens](/posts/proxying-the-proxy/images/1.png)

```js
//static/app.js
body: JSON.stringify({
    accessToken: tokens.accessToken,   
    refreshToken: tokens.refreshToken,
}),
```
Read out the current access token, pair it with the refresh token, POST both, then read the new token back and carry it into the next request. That's a small state machine, and the macro model hates state. So we hand the whole loop to `mitmproxy`.

![Repeater to rotator to target request flow](/posts/proxying-the-proxy/images/2.png)

Every request you fire from Burp passes through it, and it guarantees a live token before the request ever leaves your machine. The diagram above traces one request: Repeater → rotator → target.

`token_rotator.py` intercepts each outbound request, refreshes the token, and rewrites the `Authorization` header. Requests to the refresh endpoint itself are skipped so it doesn't chase its own tail:

```py
def request(flow: http.HTTPFlow) -> None:
    if flow.request.pretty_host != TARGET_HOST:
        return
    if REFRESH_PATH in flow.request.path:     
        return

    try:
        _rotate()
    except Exception as exc:
        ctx.log.error(f"[token_rotator] rotate error: {exc}")

    flow.request.headers["Authorization"] = "Bearer " + STATE["accessToken"]
```

The full script lives [here](/posts/proxying-the-proxy/assets/token_rotator.py).

### Notes:
- Add a new Upstream proxy server from Proxy settings > Network > Connections > Upstream proxy servers
    - Destination: *
    - Proxy host:  127.0.0.1
    - Proxy port:  8081

![Burp upstream proxy server configuration](/posts/proxying-the-proxy/images/3.png)

- Log in and paste the two tokens into `STATE` at the top of the script, and you're set.
- Start the script: `mitmdump -p 8081 -s token_rotator.py --ssl-insecure`

![mitmdump running the token rotator](/posts/proxying-the-proxy/images/4.png)

After firing the request:

![A successful authenticated request in Repeater](/posts/proxying-the-proxy/images/5.png)

You never touch a token again. Repeater stays usable indefinitely, and your attention stays on the request instead of the clock.

## Ciphertext all the way down

This app encrypts both request and response bodies. Request anything through Burp and it shows you this and nothing more:

![An encrypted request body in Burp](/posts/proxying-the-proxy/images/6.png)

You can't read it, can't tamper it. Repeater is dead weight, flip a single byte and the ciphertext falls apart before it ever reaches the server.

My first intuition was that this smelled like security by obscurity: if the client can encrypt and decrypt on its own, the key has to live somewhere in the frontend. So I cracked open the bundle. Sure enough, the "encryption" is AES-CBC with the key and IV sitting in plain sight in the JavaScript:

![The AES key and IV hardcoded in the frontend bundle](/posts/proxying-the-proxy/images/7.png)

```js
//static/crypto.js
const KEY = new TextEncoder().encode("0123456789abcdef"); // AES-128 key
const IV  = new TextEncoder().encode("fedcba9876543210"); // IV
```

Once you have the key, the encryption stops being a wall and becomes a formality.

### The Burp sandwich

One proxy won't cut it here. Burp needs to see plaintext in both directions while the browser and the server keep exchanging valid ciphertext. So instead of chaining one mitmproxy to Burp, we chain two! 

![The Burp sandwich](/posts/proxying-the-proxy/images/burp_sandwich.png)

The browser-side instance decrypts inbound and re-encrypts outbound; the server-side instance does the mirror. Burp sits in the middle and only ever touches cleartext, as the diagram above shows.

`proxy_decrypt.py` (8080) sits nearest the browser. It decrypts the request so Burp sees JSON, and re-encrypts the response on the way back so the app can still read it:

```python
def request(flow: http.HTTPFlow) -> None:
    if flow.request.headers.get("X-Encrypted") != "1":
        return
    payload = json.loads(flow.request.get_text())["payload"]
    flow.request.set_text(decrypt(payload))
```

`proxy_encrypt.py` (8081) sits nearest the server. It re-encrypts the request so the server accepts it, and decrypts the response so Burp gets JSON on the return trip.

Both scripts in full: [proxy_decrypt.py](/posts/proxying-the-proxy/assets/proxy_decrypt.py) and [proxy_encrypt.py](/posts/proxying-the-proxy/assets/proxy_encrypt.py).

### Wiring up Burp 

1. Move Burp's proxy listener from `8080` to `8000` (Settings → Tools → Proxy → Proxy listeners).
2. Add a new Upstream proxy server from Proxy settings > Network > Connections > Upstream proxy servers
    - Destination: *
    - Proxy host:  127.0.0.1
    - Proxy port:  8081

![Burp upstream proxy server configuration](/posts/proxying-the-proxy/images/3.png)

3. Set the browser's HTTP proxy to `127.0.0.1:8080`
4. (Terminal 1)
```shell
mitmdump -p 8080 --mode upstream:http://127.0.0.1:8000 -s proxy_decrypt.py --ssl-insecure
```
![mitmdump running the decrypt proxy](/posts/proxying-the-proxy/images/8.png)

5. (Terminal 2)
```shell
mitmdump -p 8081 -s proxy_encrypt.py --ssl-insecure
```

![mitmdump running the encrypt proxy](/posts/proxying-the-proxy/images/9.png)

With the chain up, both the request and the response land in Burp as plain JSON, fully readable and tamperable.

![Decrypted JSON request and response in Burp](/posts/proxying-the-proxy/images/10.png)

## Wrapping up
Burp is where you tamper. It was never meant to be where you untangle the machinery around a request. So when that machinery gets in the way,  tokens that die on a timer, crypto someone rolled themselves, signatures over the body, you don't fight Burp, you flank it. A dozen lines of mitmproxy on each side, and hostile traffic becomes something you can read, break, and put back.
