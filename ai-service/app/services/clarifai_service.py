import requests
from deep_translator import GoogleTranslator

CLARIFAI_API_KEY = "ed77b77010ac4d9e9ca27c85ff29fe50"
CLARIFAI_USER_ID = "dj"
CLARIFAI_APP_ID = "product-classifier"
CLARIFAI_MODEL_ID = "general-image-recognition"
CLARIFAI_MODEL_VERSION = "aa7f35c01e0642fda5cf400f543e7c40"

def translate_text(text, langs=["fr", "ar"]):
    translations = {}
    for lang in langs:
        translations[lang] = GoogleTranslator(source='auto', target=lang).translate(text)
    return translations

def predict_image(base64_image: str):
    url = f"https://api.clarifai.com/v2/models/{CLARIFAI_MODEL_ID}/outputs"
    if CLARIFAI_MODEL_VERSION:
        url = f"https://api.clarifai.com/v2/models/{CLARIFAI_MODEL_ID}/versions/{CLARIFAI_MODEL_VERSION}/outputs"

    headers = {
        "Authorization": f"Key {CLARIFAI_API_KEY}",
        "Content-Type": "application/json",
    }

    data = {
        "user_app_id": {
            "user_id": CLARIFAI_USER_ID,
            "app_id": CLARIFAI_APP_ID
        },
        "inputs": [
            {"data": {"image": {"base64": base64_image}}}
        ]
    }

    r = requests.post(url, headers=headers, json=data)
    if r.status_code != 200:
        return {"error": r.json()}

    outputs = r.json().get("outputs", [])
    if not outputs:
        return {"error": "No outputs returned"}

    concepts = outputs[0]["data"].get("concepts", [])
    results = []
    for c in concepts:
        translations = translate_text(c["name"])
        results.append({
            "name": c["name"],
            "value": c["value"],
            "fr": translations["fr"],
            "ar": translations["ar"]
        })
    return results

# example usage
# with open("image.jpg", "rb") as f:
#     import base64
#     img_b64 = base64.b64encode(f.read()).decode("utf-8")
#     print(predict_image(img_b64))
