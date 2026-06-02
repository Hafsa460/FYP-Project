from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import timm
import torchvision.transforms as T
import cv2
import numpy as np
import uuid
import os

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Constants
IMG_SIZE = 224
CLASS_NAMES = ["Haemorrhagic", "Ischemic", "Normal"]
CLASS_MAP = {0: "Haemorrhagic", 1: "Ischemic", 2: "Normal"}
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

best_hp = {
    "lr": 0.0002998372247193154,
    "dropout_1": 0.546470458309974,
    "dropout_2": 0.34044600469728353,
    "weight_decay": 0.03540654816402432,
    "label_smoothing": 0.004116898859160489,
    "n_unfreeze": 5
}

MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_model (2).pth")

# ============ BUILD MODEL ARCHITECTURE (matches training) ============
def build_inference_model(num_classes=3):
    """
    Reconstructs the exact model architecture used in training:
    - GhostNet backbone
    - Classifier head with the same dropout hyperparameters
    """
    ghost = timm.create_model('ghostnet_100', pretrained=False, num_classes=0)
    
    ghost.eval()
    with torch.no_grad():
        dummy = torch.zeros(1, 3, IMG_SIZE, IMG_SIZE).to(device)
        out_f = ghost(dummy).shape[1]
    
    classifier = nn.Sequential(
        nn.Linear(out_f, 512),
        nn.BatchNorm1d(512),
        nn.SiLU(),
        nn.Dropout(p=best_hp["dropout_1"]),
        nn.Linear(512, 256),
        nn.BatchNorm1d(256),
        nn.SiLU(),
        nn.Dropout(p=best_hp["dropout_2"]),
        nn.Linear(256, num_classes)
    )
    
    class StrokeModel(nn.Module):
        def __init__(self, backbone, classifier):
            super().__init__()
            self.backbone = backbone
            self.classifier = classifier
        
        def forward(self, x):
            features = self.backbone(x)
            return self.classifier(features)
    
    return StrokeModel(ghost, classifier).to(device)

# Load the trained model
print("📦 Loading trained model...")
model = build_inference_model(num_classes=3)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device).eval()
print("✅ Model loaded successfully")

# ============ PREPROCESSING TRANSFORMS ============
val_transform = T.Compose([
    T.ToTensor(),
    T.Normalize(IMAGENET_MEAN, IMAGENET_STD)
])

# ============ UTILITY FUNCTIONS ============
def gaussian_bilateral(img):
    """
    Gaussian-Bilateral filter for noise reduction + edge preservation
    """
    blurred = cv2.GaussianBlur(img, (5, 5), sigmaX=1.0)
    filtered = cv2.bilateralFilter(blurred, d=9, sigmaColor=75, sigmaSpace=75)
    return filtered


def load_and_preprocess_image(image_path):
    """
    Load and preprocess image using the same pipeline from the test script.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = gaussian_bilateral(img)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = np.stack([clahe.apply(img[:, :, c]) for c in range(3)], axis=2)

    img_tensor = val_transform(img).unsqueeze(0).to(device)
    return img_tensor

# ============ API ENDPOINT ============
@app.route("/predict-stroke", methods=["POST"])
def predict():
    """
    Predict stroke type from MRI image
    
    Returns:
        JSON with prediction, confidence, and per-class probabilities
    """
    img_path = None
    try:
        # Validate request
        if "image" not in request.files:
            return jsonify({
                "success": False, 
                "message": "No image provided"
            }), 400
        
        file = request.files["image"]
        if file.filename == '':
            return jsonify({
                "success": False,
                "message": "No file selected"
            }), 400
        
        # Save temporary file
        img_path = f"tmp_{uuid.uuid4().hex}.png"
        file.save(img_path)
        
        # Preprocess image
        img_tensor = load_and_preprocess_image(img_path)
        
        # Get prediction
        with torch.no_grad():
            output = model(img_tensor)
            probabilities = torch.softmax(output, dim=1)[0].cpu().numpy()
        
        # Get predicted class and confidence
        pred_idx = np.argmax(probabilities)
        pred_class = CLASS_MAP[pred_idx]
        confidence = float(probabilities[pred_idx])
        
        # Prepare response with all class probabilities
        class_probs = {
            CLASS_MAP[i]: float(probabilities[i]) 
            for i in range(len(CLASS_MAP))
        }
        
        return jsonify({
            "success": True,
            "prediction": pred_class,
            "confidence": confidence,
            "confidence_percent": confidence * 100,
            "class_probabilities": class_probs
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": str(e)
        }), 500
    
    finally:
        # Clean up temporary file
        if img_path and os.path.exists(img_path):
            os.remove(img_path)

if __name__ == "__main__":
    print("🚀 Stroke Detection API")
    print(f"   Device: {device}")
    print(f"   Classes: {CLASS_NAMES}")
    print(f"   Model: {MODEL_PATH}")
    print("\n✅ Server starting on http://0.0.0.0:5000")
    print("   Endpoint: POST /predict-stroke")
    app.run(host="0.0.0.0", port=5000, debug=False)
