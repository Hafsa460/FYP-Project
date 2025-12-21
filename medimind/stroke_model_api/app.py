from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models
import numpy as np
import uuid
import os
from PIL import Image

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------- MODELS ----------------
stage1_model = models.resnet50(pretrained=False)
stage1_model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
stage1_model.fc = nn.Linear(stage1_model.fc.in_features, 2)
stage1_model.load_state_dict(torch.load("best_stage1_model.pth", map_location=device))
stage1_model.to(device).eval()

stage2_model = models.resnet50(pretrained=False)
stage2_model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
stage2_model.fc = nn.Linear(stage2_model.fc.in_features, 2)
stage2_model.load_state_dict(torch.load("best_stage2_model.pth", map_location=device))
stage2_model.to(device).eval()

CLASS_MAP = {0: "Hemorrhagic", 1: "Ischemic", 2: "Normal"}

# ---------------- UTILS ----------------
def load_tensor(path):
    img = Image.open(path).convert("L").resize((224, 224))
    img = np.array(img) / 255.0
    tensor = torch.tensor(img).unsqueeze(0).unsqueeze(0).float().to(device)
    return tensor

# ---------------- API ----------------
@app.route("/predict-stroke", methods=["POST"])
def predict():
    img_path = None
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "message": "No image provided"}), 400

        file = request.files["image"]
        img_path = f"tmp_{uuid.uuid4().hex}.png"
        file.save(img_path)

        x = load_tensor(img_path)

        # -------- Stage 1 --------
        out1 = stage1_model(x)
        p1 = torch.argmax(out1, dim=1).item()

        if p1 == 1:  # Ischemic
            final = 1
            confidence = torch.softmax(out1, dim=1)[0, 1].item()
        else:
            # -------- Stage 2 --------
            out2 = stage2_model(x)
            p2 = torch.argmax(out2, dim=1).item()
            final = 0 if p2 == 0 else 2
            confidence = torch.softmax(out2, dim=1)[0, p2].item()

        return jsonify({
            "success": True,
            "prediction": CLASS_MAP[final],
            "confidence": confidence
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if img_path and os.path.exists(img_path):
            os.remove(img_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
