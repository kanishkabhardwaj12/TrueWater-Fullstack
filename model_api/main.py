from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image
import io
from collections import Counter

app = FastAPI()

# Load your custom model
# YOLOv8 handles loading the .pt file automatically
model = YOLO("best.pt")

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # 1. Read the uploaded image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # 2. Run inference
        # conf=0.25 is a standard confidence threshold
        results = model(image, conf=0.25) 

        # 3. Process results to get counts
        # YOLO results are a list (one per image). We only sent one.
        result = results[0]
        
        # Get the class names dictionary (e.g., {0: 'blue-green', 1: 'diatom'})
        names = result.names
        
        # Count occurrences of each class index
        class_indices = result.boxes.cls.tolist()
        counts = Counter(class_indices)

        # Format the output for your Next.js app
        detected_algae = []
        total_count = 0

        for class_idx, count in counts.items():
            name = names[int(class_idx)]
            detected_algae.append({
                "algaeName": name,
                "count": count
            })
            total_count += count

        return {
            "status": "success",
            "total_count": total_count,
            "detailed_counts": detected_algae
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

# Run with: uvicorn main:app --reload --port 8000