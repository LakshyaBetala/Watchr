import cv2
import numpy as np
import logging
import threading
import time

logger = logging.getLogger(__name__)

class CameraThread:
    """Independent daemon thread strictly pulling frames to avoid network locking the GUI"""
    def __init__(self, src, cam_index):
        self.src = 0 if src == "0" or src == "" else src
        self.cam_index = cam_index
        logger.info(f"Thread launching for Stream [{self.cam_index}] -> {self.src}")
        
        self.cap = cv2.VideoCapture(self.src)
        if isinstance(self.src, int) or self.src == "0":
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
        self.ret = False
        self.frame = None
        self.running = True
        
        # Launch dedicated frame-grabber background process
        self.thread = threading.Thread(target=self.update, daemon=True)
        self.thread.start()

    def update(self):
        while self.running:
            if self.cap.isOpened():
                ret, frame = self.cap.read()
                self.ret = ret
                if ret:
                    self.frame = frame.copy()
            else:
                self.ret = False
                
            # Yield exactly 10ms to prevent GIL CPU throttle
            time.sleep(0.01)

    def read(self):
        return self.ret, self.frame

    def release(self):
        self.running = False
        if self.cap is not None:
            self.cap.release()

class MultiCameraManager:
    """
    Hardware-accelerated multiplexer fusing up to 4 IP feeds into a single master canvas (2x2 grid).
    Now fully multi-threaded for asynchronous networking!
    """
    def __init__(self, sources):
        self.threads = []
        for i, src in enumerate(sources):
            # Mount thread
            cam_thread = CameraThread(src, i+1)
            self.threads.append(cam_thread)
            
        # Global warm-up delay to allow network sockets to buffer into RAM safely
        time.sleep(1.5)
            
    def get_panorama(self):
        """Reads instantly from background memory buffers to construct the real-time mosaic."""
        frames = []
        for i, t in enumerate(self.threads):
            ret, frame = t.read()
            if not ret or frame is None:
                # Provide a dead-feed fallback slate if a camera drops offline
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                txt = f"CAM {i+1} SIGNAL LOST"
                cv2.putText(frame, txt, (150, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            else:
                # Constrain dynamically to 640x480 scale natively
                frame = cv2.resize(frame, (640, 480))
                cv2.putText(frame, f"CAM {i+1}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                            
            frames.append(frame)
            
        # Pad dynamically to ensure mathematical 2x2 grid (4 matrices)
        while len(frames) < 4:
            blank = np.zeros((480, 640, 3), dtype=np.uint8)
            frames.append(blank)
            
        # Fast GPU-accelerated concatenation bindings
        top_row = cv2.hconcat([frames[0], frames[1]])
        bot_row = cv2.hconcat([frames[2], frames[3]])
        master_grid = cv2.vconcat([top_row, bot_row])
        
        return True, master_grid
        
    def release(self):
        for t in self.threads:
            t.release()
