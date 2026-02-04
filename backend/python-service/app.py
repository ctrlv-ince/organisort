import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app access

# --- MODEL LOADING ---
try:
    model = YOLO('bestv3.pt')
    print("✅ YOLOv8 model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading YOLOv8 model: {e}")
    model = None

def draw_detections(image, detections):
    """
    Draw bounding boxes and labels on the image.
    Returns the annotated image.
    """
    # Convert PIL image to draw on
    draw = ImageDraw.Draw(image)
    
    # Try to use a better font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # Define colors for different classes
    colors = {
        'Organic Waste': '#10b981',  # Green
        'Recyclable': '#3b82f6',      # Blue
        'Non-Recyclable': '#ef4444',  # Red
    }
    
    for detection in detections:
        box = detection['box']
        class_name = detection['class']
        confidence = detection['confidence']
        
        # Get color for this class
        color = colors.get(class_name, '#9ca3af')
        
        # Draw rectangle
        draw.rectangle(box, outline=color, width=3)
        
        # Prepare label text
        label = f"{class_name}: {confidence:.2%}"
        
        # Get text bounding box for background
        bbox = draw.textbbox((box[0], box[1] - 25), label, font=font)
        
        # Draw background for text
        draw.rectangle(bbox, fill=color)
        
        # Draw text
        draw.text((box[0], box[1] - 25), label, fill='white', font=font)
    
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
        # Perform detection
        results = model(image)
        print(f"🔍 Detection completed")
    except Exception as e:
        return jsonify({'error': f'An error occurred during detection: {e}'}), 500

    # --- PROCESS RESULTS ---
    detections = []
    
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
            # Convert tensor to list properly
            bounding_box = [float(coord) for coord in box.xyxy[0].tolist()]
            
            print(f"✅ Detection: {class_name} ({confidence:.2%}) at {bounding_box}")
            
            # Include all detections (not just "Organic Waste")
            detections.append({
                'class': class_name,
                'confidence': confidence,
                'box': bounding_box,
            })

    # --- DRAW ANNOTATIONS ---
    annotated_image = image.copy()
    if detections:
        annotated_image = draw_detections(annotated_image, detections)
    
    # Convert annotated image to base64
    annotated_image_base64 = image_to_base64(annotated_image)

    # --- SUMMARY STATISTICS ---
    summary = {
        'total_detections': len(detections),
        'classes_found': list(set([d['class'] for d in detections])),
        'highest_confidence': max([d['confidence'] for d in detections]) if detections else 0,
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

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    print("🚀 Starting Waste Detection API...")
    print("📍 Server will run on http://0.0.0.0:5001")
    print("💡 Test the API:")
    print("   curl http://localhost:5001/health")
    print("   curl -X POST -F 'image=@test.jpg' http://localhost:5001/detect")
    app.run(host='0.0.0.0', port=5001, debug=True)