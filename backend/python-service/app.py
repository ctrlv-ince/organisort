import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
import numpy as np
import colorsys
import os
import torch
from transformers import pipeline

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app access

# --- MODEL LOADING ---
try:
    model = YOLO('bestv6.pt')
    print("✅ YOLOv8 model loaded successfully.")
    print(f"📋 Model classes: {model.names}")
except Exception as e:
    print(f"❌ Error loading YOLOv8 model: {e}")
    model = None

# Load HuggingFace Sentiment Model
try:
    print("⏳ Loading multilingual sentiment analysis model...")
    # Map model output labels to our specific sentiments
    sentiment_map = {
        "very negative": "very negative",
        "negative": "negative",
        "neutral": "neutral",
        "positive": "positive",
        "very positive": "very positive",
        "1 star": "very negative",
        "2 stars": "negative",
        "3 stars": "neutral",
        "4 stars": "positive",
        "5 stars": "very positive" 
    }
    # Use GPU if available
    device = 0 if torch.cuda.is_available() else -1
    sentiment_analyzer = pipeline(
        "sentiment-analysis", 
        model="tabularisai/multilingual-sentiment-analysis", 
        device=device
    )
    print("✅ Sentiment analysis model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading sentiment model: {e}")
    sentiment_analyzer = None

def generate_colors(n):
    """
    Generate n visually distinct colors using HSV color space.
    Returns a dictionary mapping class names to hex colors.
    """
    colors = {}
    for i in range(n):
        hue = i / n
        saturation = 0.7 + (i % 3) * 0.1  # Vary saturation slightly
        value = 0.9
        rgb = colorsys.hsv_to_rgb(hue, saturation, value)
        hex_color = '#{:02x}{:02x}{:02x}'.format(
            int(rgb[0] * 255),
            int(rgb[1] * 255),
            int(rgb[2] * 255)
        )
        colors[i] = hex_color
    return colors

# Generate color palette for all classes
CLASS_COLORS = None

def get_class_color(class_id, class_name):
    """Get color for a specific class."""
    global CLASS_COLORS
    
    if CLASS_COLORS is None and model is not None:
        num_classes = len(model.names)
        CLASS_COLORS = generate_colors(num_classes)
    
    if CLASS_COLORS and class_id in CLASS_COLORS:
        return CLASS_COLORS[class_id]
    
    # Fallback color
    return '#9ca3af'

def draw_detections(image, detections):
    """
    Draw bounding boxes and labels on the image.
    Returns the annotated image.
    """
    # Convert PIL image to draw on
    draw = ImageDraw.Draw(image)
    
    # Try to use a better font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        small_font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
        small_font = font
    
    for detection in detections:
        box = detection['box']
        class_name = detection['class']
        confidence = detection['confidence']
        class_id = detection.get('class_id', 0)
        
        # Get color for this class
        color = get_class_color(class_id, class_name)
        
        # Draw rectangle
        draw.rectangle(box, outline=color, width=3)
        
        # Prepare label text
        label = f"{class_name}: {confidence:.1%}"
        
        # Get text bounding box for background
        bbox = draw.textbbox((box[0], box[1] - 22), label, font=small_font)
        
        # Add padding to background
        bbox = (bbox[0] - 2, bbox[1] - 2, bbox[2] + 2, bbox[3] + 2)
        
        # Draw background for text
        draw.rectangle(bbox, fill=color)
        
        # Draw text
        draw.text((box[0], box[1] - 22), label, fill='white', font=small_font)
    
    return image

def image_to_base64(image):
    """Convert PIL Image to base64 string."""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=95)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/jpeg;base64,{img_str}"

@app.route('/detect', methods=['POST'])
def detect():
    """
    Perform object detection on an image.
    This endpoint expects a POST request with an image file.
    Returns detections and annotated image.
    """
    if model is None:
        return jsonify({'error': 'Model not loaded. Please check the server logs.'}), 500

    # Check if an image is present in the request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    
    # Get optional confidence threshold from request (default: 0.25)
    confidence_threshold = float(request.form.get('confidence', 0.25))

    # Read the image
    try:
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        print(f"📸 Image loaded: {image.size} - Mode: {image.mode}")
    except Exception as e:
        return jsonify({'error': f'Failed to read or open image: {e}'}), 400

    # --- OBJECT DETECTION ---
    try:
        # Perform detection with confidence threshold
        results = model(image, conf=confidence_threshold)
        print(f"🔍 Detection completed")
    except Exception as e:
        return jsonify({'error': f'An error occurred during detection: {e}'}), 500

    # --- PROCESS RESULTS ---
    detections = []
    class_counts = {}
    
    if results and len(results) > 0:
        result = results[0]
        
        # Get the names of the classes from the model
        class_names = result.names
        print(f"📋 Available classes: {class_names}")
        
        # Iterate over each detected box
        for box in result.boxes:
            # Get the class ID and confidence score
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            
            # Get the class name using the class ID
            class_name = class_names.get(class_id, "Unknown")
            
            # Get bounding box coordinates [x1, y1, x2, y2]
            bounding_box = [float(coord) for coord in box.xyxy[0].tolist()]
            
            print(f"✅ Detection: {class_name} ({confidence:.2%}) at {bounding_box}")
            
            # Add to detections
            detections.append({
                'class': class_name,
                'class_id': class_id,
                'confidence': confidence,
                'box': bounding_box,
            })
            
            # Count classes
            class_counts[class_name] = class_counts.get(class_name, 0) + 1

    # --- DRAW ANNOTATIONS ---
    annotated_image = image.copy()
    if detections:
        annotated_image = draw_detections(annotated_image, detections)
    
    # Convert annotated image to base64
    annotated_image_base64 = image_to_base64(annotated_image)

    # --- SUMMARY STATISTICS ---
    summary = {
        'total_detections': len(detections),
        'unique_classes': len(class_counts),
        'class_counts': class_counts,
        'highest_confidence': max([d['confidence'] for d in detections]) if detections else 0,
        'average_confidence': sum([d['confidence'] for d in detections]) / len(detections) if detections else 0,
    }

    print(f"📊 Summary: {summary}")

    # Return the detections as a JSON response
    return jsonify({
        'success': True,
        'detections': detections,
        'annotated_image': annotated_image_base64,
        'summary': summary,
        'image_dimensions': {
            'width': image.size[0],
            'height': image.size[1]
        }
    })

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all available classes from the model."""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'success': True,
        'classes': model.names,
        'num_classes': len(model.names)
    })

@app.route('/health', methods=['GET'])
@app.route('/detect/health', methods=['GET'])
def health():
    """Health check endpoint. Supports legacy /detect/health path."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'sentiment_model_loaded': sentiment_analyzer is not None,
        'num_classes': len(model.names) if model else 0
    })

@app.route('/analyze-sentiment', methods=['POST'])
@app.route('/detect/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Perform sentiment analysis on text (supports Taglish/Multilingual).
    Expects JSON: {"text": "review content"}
    """
    if sentiment_analyzer is None:
        return jsonify({'error': 'Sentiment model not loaded.'}), 500

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    text = data['text']
    if not isinstance(text, str) or not text.strip():
         return jsonify({'error': 'Invalid text provided'}), 400

    try:
        # Run inference
        result = sentiment_analyzer(text)[0] # pipeline returns a list of dicts
        label = result['label']
        confidence = result['score']
        
        print(f"📝 Sentiment Analysis - Input: '{text}'")
        print(f"   Raw Model Result: {result}")

        # Map labels to our categories
        sentiment = sentiment_map.get(str(label).lower(), "neutral")
        print(f"   Mapped Sentiment: '{sentiment}' (Confidence: {confidence:.2f})")

        return jsonify({
            'success': True,
            'sentiment': sentiment,
            'confidence': float(confidence),
            'raw_label': label
        })
    except Exception as e:
        print(f"❌ Sentiment analysis error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print("🚀 Starting Waste Detection API...")
    print(f"📍 Server will run on http://0.0.0.0:{port}")
    print("💡 Test the API:")
    print(f"   curl http://localhost:{port}/health")
    print(f"   curl http://localhost:{port}/detect/health  # legacy-compatible")
    print(f"   curl http://localhost:{port}/classes")
    print(f"   curl -X POST -F 'image=@test.jpg' http://localhost:{port}/detect")
    print(f"   curl -X POST -F 'image=@test.jpg' -F 'confidence=0.5' http://localhost:{port}/detect")
    app.run(host='0.0.0.0', port=port, debug=True)