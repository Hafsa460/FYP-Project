from flask import Flask, request, jsonify
from flask_cors import CORS  # ⚡ For CORS support
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # ⚡ Allow requests from React frontend

MODEL_PATH = "resnet_stroke_classifier_finetuned_20251121_172312.h5"

print("\n🔄 Loading Stroke Classification Model...")
model = load_model(MODEL_PATH)
print("✅ Model loaded successfully!\n")

# ---------------------------------------------------------
# Helper Function to Process Image
# ---------------------------------------------------------
def prepare_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# ---------------------------------------------------------
# API Route
# ---------------------------------------------------------
@app.route("/predict-stroke", methods=["POST"])
def predict_stroke():
    if "image" not in request.files:
        return jsonify({"success": False, "message": "No image uploaded"}), 400

    file = request.files["image"]
    file_path = "temp_img.jpg"
    file.save(file_path)

    try:
        img_ready = prepare_image(file_path)
        prediction = model.predict(img_ready)[0][0]
        os.remove(file_path)

        result = "Stroke" if prediction >= 0.5 else "Non-Stroke"

        return jsonify({
            "success": True,
            "prediction": result,
            "confidence": float(prediction)
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ---------------------------------------------------------
# Run Server
# ---------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)  # ⚡ Use a safe port
