import cv2
import sys

def test_webcam():
    print("Attempting to open webcam (ID 0)...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ ERROR: Could not open Webcam 0.")
        print("   -> 🛑 Likely cause on macOS: The Terminal you are using does not have Camera permissions.")
        print("   -> 🔧 Fix: Go to System Settings > Privacy & Security > Camera and enable it for your Terminal app.")
        sys.exit(1)
        
    ret, frame = cap.read()
    if ret:
        print(f"✅ SUCCESS! Successfully read a frame of shape {frame.shape}")
    else:
        print("❌ ERROR: Webcam opened, but failed to grab a frame.")
        print("   -> Is another app (like Zoom or QuickTime) currently holding the webcam hostage?")
        
    cap.release()

if __name__ == "__main__":
    test_webcam()
