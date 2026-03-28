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
    Phase 1: Multi-threaded camera manager with decoupled inference and display.
    
    get_individual_frames() → Raw per-camera frames for batched YOLO inference.
    get_mosaic(frames) → Takes pre-fetched frames, stitches 2x2 grid for DISPLAY ONLY.
    get_panorama() → Legacy: fetches + stitches in one call (backward compatible).
    """
    def __init__(self, sources):
        self.threads = []
        self.num_cams = len(sources)
        for i, src in enumerate(sources):
            cam_thread = CameraThread(src, i+1)
            self.threads.append(cam_thread)
            
        # Warm-up delay for network sockets
        time.sleep(1.5)
    
    def get_individual_frames(self):
        """
        Returns a list of (ret, raw_frame) tuples — one per camera.
        NO stitching, NO text overlay. Pure unmodified frames for inference.
        """
        results = []
        for t in self.threads:
            ret, frame = t.read()
            if ret and frame is not None:
                frame = cv2.resize(frame, (640, 480))
            results.append((ret, frame))
        return results
    
    def get_mosaic(self, frame_list=None):
        """
        Takes a list of frames (from get_individual_frames) and stitches into
        a 2x2 grid for DISPLAY ONLY. If frame_list is None, fetches fresh frames.
        """
        if frame_list is None:
            raw = self.get_individual_frames()
            frame_list = [f if f is not None else None for (_, f) in raw]
        
        frames = []
        for i in range(max(len(frame_list), self.num_cams)):
            if i < len(frame_list) and frame_list[i] is not None:
                frame = frame_list[i].copy()
                cv2.putText(frame, f"CAM {i+1}", (20, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            else:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, f"CAM {i+1} OFFLINE", (150, 240),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            frames.append(frame)
        
        # Pad to 4 for 2x2 grid
        while len(frames) < 4:
            frames.append(np.zeros((480, 640, 3), dtype=np.uint8))
        
        top_row = cv2.hconcat([frames[0], frames[1]])
        bot_row = cv2.hconcat([frames[2], frames[3]])
        mosaic = cv2.vconcat([top_row, bot_row])
        
        return True, mosaic
    
    def get_panorama(self):
        """Legacy backward-compatible method. Fetches + stitches."""
        return self.get_mosaic()
        
    def release(self):
        for t in self.threads:
            t.release()
