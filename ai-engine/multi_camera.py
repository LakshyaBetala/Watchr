import cv2
import numpy as np
import logging
import threading
import time

logger = logging.getLogger(__name__)


class CameraThread:
    """Independent daemon thread for zero-latency frame ingestion with 5s auto-reconnect."""
    def __init__(self, src, cam_index, target_width=640, target_height=480):
        self.src = 0 if src == "0" or src == "" else src
        self.cam_index = cam_index
        self.target_width = target_width
        self.target_height = target_height
        
        self.cap = None
        self.ret = False
        self.frame = None
        self.running = True
        self.lock = threading.Lock()
        
        self.status = "initializing"
        self.consecutive_failures = 0
        self.MAX_FAILURES_BEFORE_RECONNECT = 10
        self.RECONNECT_INTERVAL = 5
        self.last_reconnect_attempt = 0
        self.total_reconnects = 0
        self.frames_delivered = 0
        
        self._connect()
        self.thread = threading.Thread(target=self._update_loop, daemon=True)
        self.thread.start()
    
    def _connect(self):
        try:
            if self.cap is not None: self.cap.release()
            
            self.cap = cv2.VideoCapture(self.src)
            if isinstance(self.src, int) or self.src == 0:
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.target_width)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.target_height)
            
            if self.cap.isOpened():
                self.status = "online"
                self.consecutive_failures = 0
                logger.info(f"[CAM {self.cam_index}] ✅ Connected successfully")
                return True
            else:
                self.status = "offline"
                logger.warning(f"[CAM {self.cam_index}] ❌ Failed to open source")
                return False
        except Exception as e:
            self.status = "offline"
            return False

    def _update_loop(self):
        while self.running:
            try:
                if self.cap is not None and self.cap.isOpened():
                    ret, frame = self.cap.read()
                    with self.lock:
                        self.ret = ret
                        if ret and frame is not None:
                            self.frame = frame.copy()
                            self.consecutive_failures = 0
                            self.frames_delivered += 1
                            if self.status != "online": self.status = "online"
                        else: self.consecutive_failures += 1
                else:
                    self.consecutive_failures += 1
                
                if self.consecutive_failures >= self.MAX_FAILURES_BEFORE_RECONNECT:
                    now = time.time()
                    if now - self.last_reconnect_attempt >= self.RECONNECT_INTERVAL:
                        self.status = "reconnecting"
                        self.last_reconnect_attempt = now
                        self.total_reconnects += 1
                        if self._connect(): self.consecutive_failures = 0
                        
            except Exception as e:
                self.consecutive_failures += 1
            time.sleep(0.01)

    def read(self):
        with self.lock: return self.ret, self.frame
    
    def get_health(self):
        return {"cam_id": self.cam_index, "status": self.status, 
                "frames_delivered": self.frames_delivered, "reconnects": self.total_reconnects}

    def release(self):
        self.running = False
        if self.cap is not None: self.cap.release()


class MultiCameraManager:
    """Manages multi-threaded cameras, decouples inference from display, auto-reconnects."""
    def __init__(self, sources):
        self.threads = [CameraThread(src, i + 1) for i, src in enumerate(sources)]
        self.num_cams = len(sources)
        time.sleep(1.5)
        
    def get_individual_frames(self):
        results = []
        for t in self.threads:
            ret, frame = t.read()
            if ret and frame is not None: frame = cv2.resize(frame, (640, 480))
            results.append((ret, frame))
        return results
    
    def get_mosaic(self, frame_list=None):
        if frame_list is None:
            raw = self.get_individual_frames()
            frame_list = [f for (_, f) in raw]
        
        frames = []
        for i in range(max(len(frame_list), self.num_cams)):
            if i < len(frame_list) and frame_list[i] is not None:
                frame = frame_list[i].copy()
                status = self.threads[i].status if i < len(self.threads) else "unknown"
                color = (0, 255, 0) if status == "online" else (0, 0, 255)
                cv2.putText(frame, f"CAM {i+1} [{status.upper()}]", (20, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            else:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                status = self.threads[i].status if i < len(self.threads) else "offline"
                cv2.putText(frame, f"CAM {i+1} {status.upper()}", (150, 240),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            frames.append(frame)
        
        while len(frames) < 4: frames.append(np.zeros((480, 640, 3), dtype=np.uint8))
        
        top_row = cv2.hconcat([frames[0], frames[1]])
        bot_row = cv2.hconcat([frames[2], frames[3]])
        return True, cv2.vconcat([top_row, bot_row])
    
    def get_panorama(self): return self.get_mosaic()
    def get_health_report(self): return [t.get_health() for t in self.threads]
    def get_online_count(self): return sum(1 for t in self.threads if t.status == "online")
    def release(self):
        for t in self.threads: t.release()
