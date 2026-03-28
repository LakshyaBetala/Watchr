"""
Phase 1: ONNX Export Script.
Exports yolov8n.pt → yolov8n.onnx with dynamic batch axis.
Run once: .\.venv\Scripts\python.exe export_onnx.py
"""
from ultralytics import YOLO
import os

def main():
    model_path = "yolov8n.pt"
    if not os.path.exists(model_path):
        print(f"ERROR: {model_path} not found in current directory.")
        return
    
    print(f"Loading {model_path}...")
    model = YOLO(model_path)
    
    print("Exporting to ONNX with dynamic batch support...")
    # Ultralytics handles the full export pipeline:
    # - Traces the model graph
    # - Sets input shape (default 640x640)  
    # - Writes yolov8n.onnx
    model.export(
        format="onnx",
        imgsz=640,
        dynamic=True,     # Enable dynamic batch/height/width axes
        simplify=True,    # Run onnx-simplifier to optimize the graph
        opset=17,         # ONNX opset 17 for maximum TensorRT compatibility
    )
    
    output_path = model_path.replace(".pt", ".onnx")
    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"\n✅ Export complete: {output_path} ({size_mb:.1f} MB)")
        print("You can now run main.py — it will auto-detect and use this ONNX model.")
    else:
        print("❌ Export failed. Check ultralytics logs above.")

if __name__ == "__main__":
    main()
