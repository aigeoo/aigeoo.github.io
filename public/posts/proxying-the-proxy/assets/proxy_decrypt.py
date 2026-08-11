import base64
import json

from mitmproxy import http
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

KEY = b"0123456789abcdef"
IV = b"fedcba9876543210"


def encrypt(text: str) -> str:
    data = text.encode()
    n = 16 - (len(data) % 16)
    data += bytes([n] * n)
    enc = Cipher(algorithms.AES(KEY), modes.CBC(IV)).encryptor()
    return base64.b64encode(enc.update(data) + enc.finalize()).decode()


def decrypt(b64: str) -> str:
    dec = Cipher(algorithms.AES(KEY), modes.CBC(IV)).decryptor()
    pt = dec.update(base64.b64decode(b64)) + dec.finalize()
    return pt[: -pt[-1]].decode()


def request(flow: http.HTTPFlow) -> None:
    if flow.request.headers.get("X-Encrypted") != "1":
        return
    try:
        payload = json.loads(flow.request.get_text())["payload"]
        flow.request.set_text(decrypt(payload))          # Burp now sees cleartext
        print("[app-side] request decrypted for Burp")
    except Exception as exc:
        print(f"[app-side] request error: {exc}")


def response(flow: http.HTTPFlow) -> None:
    # Only touch responses whose request we decrypted on the way in.
    if flow.request.headers.get("X-Encrypted") != "1":
        return
    try:
        envelope = json.dumps({"payload": encrypt(flow.response.get_text())})
        flow.response.set_text(envelope)                 # app gets ciphertext back
        flow.response.headers["X-Encrypted"] = "1"
        print("[app-side] response re-encrypted for app")
    except Exception as exc:
        print(f"[app-side] response error: {exc}")
