import requests, time, json, base64
from mitmproxy import ctx, http

TARGET_HOST = "redacted"            
REFRESH_PATH = "/auth/refresh"
REFRESH_URL = "http://redacted/auth/refresh"

# Paste a fresh pair here once.
STATE = {
    "accessToken": "PLACE_TOKEN",
    "refreshToken": "PLACE_REFRESH_TOKEN",
}


def _jwt_exp(token: str) -> int:
    try:
        body = token.split(".")[1]
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        return int(payload.get("exp", 0))
    except Exception:
        return 0


def _rotate() -> None:
    resp = requests.post(
        REFRESH_URL,
        json={"accessToken": STATE["accessToken"], "refreshToken": STATE["refreshToken"]},
        timeout=10,
    )
    body = resp.json()
    if resp.status_code == 200 and body.get("success"):
        STATE["accessToken"] = body["data"]["accessToken"]
        
        if body["data"].get("refreshToken"):
            STATE["refreshToken"] = body["data"]["refreshToken"]
        ctx.log.info("[token_rotator] rotated — new exp in %ds" %
                     (_jwt_exp(STATE["accessToken"]) - time.time()))
    else:
        ctx.log.error(f"[token_rotator] refresh rejected {resp.status_code}: {resp.text}")


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

    if "application/json" in flow.request.headers.get("Content-Type", ""):
        try:
            body = json.loads(flow.request.get_text())
            if isinstance(body, dict) and "accessToken" in body:
                body["accessToken"] = STATE["accessToken"]
                flow.request.set_text(json.dumps(body))
        except (json.JSONDecodeError, ValueError):
            pass
