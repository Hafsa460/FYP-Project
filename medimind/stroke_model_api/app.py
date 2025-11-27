from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import uuid

app = Flask(__name__)

CORS(app, resources={r"/predict-stroke": {"origins": "http://localhost:3000"}})

MODEL_PATH = "resnet_stroke_classifier_finetuned_20251121_172312.h5"
print("\n🔄 Loading Stroke Classification Model...")
model = load_model(MODEL_PATH)
print("✅ Model loaded successfully!\n")

def prepare_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

@app.route("/predict-stroke", methods=["POST"])
def predict_stroke():
    # No file received
    if "image" not in request.files:
        return jsonify({"success": False, "message": "No image uploaded"}), 400

    file = request.files["image"]

    # Generate unique filename
    temp_name = f"temp_{uuid.uuid4().hex}.jpg"
    file_path = os.path.join(temp_name)
    file.save(file_path)

    try:
        img_ready = prepare_image(file_path)
        prediction = model.predict(img_ready)[0][0]

        if os.path.exists(file_path):
            os.remove(file_path)

        result = "Stroke" if prediction >= 0.5 else "Non-Stroke"

        return jsonify({
            "success": True,
            "prediction": result,
            "confidence": round(float(prediction), 4)
        }), 200

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Stroke Prediction API Running"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
