"""Lyria 3.5 で BGM を生成する。API キーは環境変数 GEMINI_API_KEY から読む。"""
import base64, json, os, sys, urllib.request, urllib.error

URL = "https://generativelanguage.googleapis.com/v1beta/models/lyria-3.5:generateContent"

def main(prompt_path: str, out_path: str) -> int:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        print("GEMINI_API_KEY is empty", file=sys.stderr)
        return 2
    prompt = open(prompt_path, encoding="utf-8").read()
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO", "TEXT"],
        },
    }
    req = urllib.request.Request(
        URL, data=json.dumps(body).encode(), method="POST",
        headers={"x-goog-api-key": key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as res:
            data = json.load(res)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode(errors='replace')[:1500]}", file=sys.stderr)
        return 1
    except urllib.error.URLError as e:
        print(f"Network error: {e.reason}", file=sys.stderr)
        return 1
    parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
    audio = [p["inlineData"] for p in parts if "inlineData" in p]
    for p in parts:
        if "text" in p:
            print("TEXT:", p["text"][:800])
    if not audio:
        print("No audio in response:", json.dumps(data)[:1500], file=sys.stderr)
        return 1
    with open(out_path, "wb") as f:
        f.write(base64.b64decode(audio[0]["data"]))
    print("saved", out_path, audio[0].get("mimeType"))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
