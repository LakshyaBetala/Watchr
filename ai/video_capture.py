import cv2
import time
import logging
import sys

# Configure logging for clear debug outputs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def initialize_capture(source):
    """
    Attempts to initialize video capture from a given source.
    Returns the capture object if successful, else None.
    """
    cap = cv2.VideoCapture(source)
    if cap.isOpened():
        return cap
    return None

def main():
    primary_source = 0
    fallback_source = "fallback.mp4"
    using_fallback = False
    
    # 1. Capture video from webcam
    logger.info("Initializing video capture system...")
    cap = initialize_capture(primary_source)
    
    # 2. If webcam fails, automatically switch to a fallback video file
    if cap is None:
        logger.warning(f"Webcam initialization failed. Switching to fallback: {fallback_source}")
        cap = initialize_capture(fallback_source)
        using_fallback = True
        
        if cap is None:
            logger.error("Fallback video also failed to open. Exiting system.")
            return
        logger.info("Fallback video started successfully.")
    else:
        logger.info("Webcam started successfully.")

    prev_time = time.time()
    consecutive_failures = 0
    max_failures = 10  # Threshold to detect camera disconnect instead of a single dropped frame

    # 3. Continuously read frames in a loop
    while True:
        ret, frame = cap.read()
        
        # 4. Validate each frame (skip if None or ret is False)
        # 7. Add clear debug logs when frame fails
        if not ret or frame is None:
            logger.debug("Frame failed to read. Skipping...")
            consecutive_failures += 1
            
            # 9. Ensure no crashes even if camera disconnects during runtime
            if consecutive_failures > max_failures:
                if not using_fallback:
                    logger.warning("Camera disconnected during runtime! Switching to fallback...")
                    cap.release()
                    cap = initialize_capture(fallback_source)
                    using_fallback = True
                    consecutive_failures = 0
                    
                    if cap is None:
                        logger.error("Failed to load fallback upon camera disconnect. Exiting.")
                        break
                    logger.info("Fallback used successfully after disconnect.")
                else:
                    # If fallback video reaches the end, we can loop it back to the first frame
                    logger.info("Fallback video reached the end. Looping...")
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    consecutive_failures = 0
                    
            continue  # Skip rendering and wait for the next frame

        # Reset failures on successful frame read
        consecutive_failures = 0
        
        # 6. Add FPS calculation and display it on the frame
        current_time = time.time()
        time_diff = current_time - prev_time
        fps = 1.0 / time_diff if time_diff > 0 else 0.0
        prev_time = current_time
        
        # Overlay FPS on the top-left corner
        cv2.putText(frame, f"FPS: {int(fps)}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2, cv2.LINE_AA)
        
        # Overlay current source status to easily verify fallback
        status_text = "Source: Fallback" if using_fallback else "Source: Webcam"
        cv2.putText(frame, status_text, (20, 80), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)
        
        # 5. Display the video feed using cv2.imshow()
        cv2.imshow("Robust Video Input", frame)
        
        # 8. Add exit condition on pressing ESC key (ASCII code 27)
        if cv2.waitKey(1) & 0xFF == 27:
            logger.info("ESC key pressed. Exiting cleanly.")
            break

    # Clean up resources
    if cap:
        cap.release()
    cv2.destroyAllWindows()
    logger.info("Video capture system shut down.")

if __name__ == "__main__":
    main()
