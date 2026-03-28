import cv2
import numpy as np
import logging
import time
import os
import onnxruntime as ort
from collections import deque

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PersonDetector:
    """
    Phase 1: Enterprise ONNX/TensorRT Inference Engine.
    
    Execution Provider Priority:
    1. TensorrtExecutionProvider (fastest, compiles ONNX layers into TRT kernels)
    2. CUDAExecutionProvider (fast, generic GPU compute)
    3. CPUExecutionProvider (fallback)
    
    Supports both single-frame and BATCHED multi-camera inference.
    Falls back to Ultralytics .pt if no .onnx file exists.
    """
    
    def __init__(self, model_name="yolov8n.pt", conf_thresh=0.5, 
                 input_size=640, buffer_size=5, min_stable=3):
        self.conf_thresh = conf_thresh
        self.input_size = input_size
        self.person_class = 0  # COCO class 0 = person
        
        # Stability buffer
        self.buffer_size = buffer_size
        self.min_stable = min_stable
        self.history = deque(maxlen=self.buffer_size)
        
        # Try ONNX first, fall back to Ultralytics .pt
        onnx_path = model_name.replace(".pt", ".onnx")
        
        if os.path.exists(onnx_path):
            self._init_onnx(onnx_path)
        else:
            self._init_ultralytics(model_name)
    
    def _init_onnx(self, onnx_path):
        """Initialize ONNX Runtime with GPU acceleration."""
        self.backend = "onnx"
        logger.info(f"Loading ONNX model: {onnx_path}")
        
        providers = []
        available = ort.get_available_providers()
        
        if "TensorrtExecutionProvider" in available:
            providers.append(("TensorrtExecutionProvider", {
                "trt_max_workspace_size": 2 * 1024 * 1024 * 1024,  # 2GB
                "trt_fp16_enable": True,  # FP16 for massive throughput on RTX 4050
                "trt_engine_cache_enable": True,
                "trt_engine_cache_path": "./trt_cache",
            }))
            logger.info("✅ TensorRT EP enabled (FP16 + Engine Caching)")
            
        if "CUDAExecutionProvider" in available:
            providers.append(("CUDAExecutionProvider", {
                "device_id": 0,
                "arena_extend_strategy": "kNextPowerOfTwo",
                "cudnn_conv_algo_search": "EXHAUSTIVE",
            }))
            logger.info("✅ CUDA EP enabled (cuDNN Exhaustive Search)")
            
        providers.append("CPUExecutionProvider")
        
        # Create TRT cache directory
        os.makedirs("./trt_cache", exist_ok=True)
        
        sess_opts = ort.SessionOptions()
        sess_opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        sess_opts.enable_mem_pattern = True
        sess_opts.enable_cpu_mem_arena = True
        
        self.session = ort.InferenceSession(onnx_path, sess_opts, providers=providers)
        
        # Log which provider was actually selected
        active_provider = self.session.get_providers()[0]
        logger.info(f"Active execution provider: {active_provider}")
        
        # Get input details
        input_meta = self.session.get_inputs()[0]
        self.input_name = input_meta.name
        logger.info(f"ONNX input: {self.input_name}, shape: {input_meta.shape}")
        
    def _init_ultralytics(self, model_name):
        """Fallback to Ultralytics PyTorch model."""
        self.backend = "ultralytics"
        logger.warning(f"ONNX not found. Falling back to Ultralytics: {model_name}")
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_name)
        except Exception as e:
            logger.error(f"Failed to load YOLO: {e}")
            self.model = None
    
    def _preprocess(self, frame):
        """
        Preprocess a single frame for ONNX inference.
        Resize → Pad (letterbox) → Normalize → CHW → float32
        """
        h, w = frame.shape[:2]
        scale = min(self.input_size / h, self.input_size / w)
        new_w, new_h = int(w * scale), int(h * scale)
        
        resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        
        # Letterbox pad to input_size x input_size
        canvas = np.full((self.input_size, self.input_size, 3), 114, dtype=np.uint8)
        pad_x, pad_y = (self.input_size - new_w) // 2, (self.input_size - new_h) // 2
        canvas[pad_y:pad_y + new_h, pad_x:pad_x + new_w] = resized
        
        # BGR→RGB, HWC→CHW, normalize to [0,1], float32
        blob = canvas[:, :, ::-1].transpose(2, 0, 1).astype(np.float32) / 255.0
        
        return blob, scale, pad_x, pad_y, h, w
    
    def _postprocess(self, output, scale, pad_x, pad_y, orig_h, orig_w):
        """
        Parse raw ONNX output → list of [x1, y1, x2, y2, confidence].
        YOLOv8 ONNX output shape: [1, 84, 8400] (transposed to [8400, 84])
        """
        # output shape: [batch, 84, num_detections]
        predictions = output[0]  # First batch item
        
        if predictions.shape[0] == 84:
            predictions = predictions.T  # [8400, 84]
        
        detections = []
        
        for pred in predictions:
            # pred: [cx, cy, w, h, cls0_conf, cls1_conf, ..., cls79_conf]
            cx, cy, bw, bh = pred[0], pred[1], pred[2], pred[3]
            class_scores = pred[4:]
            
            cls_id = int(np.argmax(class_scores))
            conf = float(class_scores[cls_id])
            
            if cls_id != self.person_class or conf < self.conf_thresh:
                continue
            
            # Convert from center to corner format
            x1 = cx - bw / 2
            y1 = cy - bh / 2
            x2 = cx + bw / 2
            y2 = cy + bh / 2
            
            # Remove letterbox padding and rescale to original image coords
            x1 = (x1 - pad_x) / scale
            y1 = (y1 - pad_y) / scale
            x2 = (x2 - pad_x) / scale
            y2 = (y2 - pad_y) / scale
            
            # Clip to image bounds
            x1 = max(0, min(x1, orig_w))
            y1 = max(0, min(y1, orig_h))
            x2 = max(0, min(x2, orig_w))
            y2 = max(0, min(y2, orig_h))
            
            if x2 - x1 > 5 and y2 - y1 > 5:
                detections.append([int(x1), int(y1), int(x2), int(y2), conf])
        
        # NMS to remove overlapping boxes
        if len(detections) > 0:
            detections = self._nms(detections, iou_thresh=0.45)
        
        return detections
    
    def _nms(self, detections, iou_thresh=0.45):
        """Non-Maximum Suppression."""
        boxes = np.array([[d[0], d[1], d[2], d[3]] for d in detections])
        scores = np.array([d[4] for d in detections])
        
        indices = cv2.dnn.NMSBoxes(
            boxes.tolist(), scores.tolist(), self.conf_thresh, iou_thresh
        )
        
        if len(indices) == 0:
            return []
        
        indices = indices.flatten()
        return [detections[i] for i in indices]
    
    def detect(self, frame):
        """Single-frame detection (backward compatible API)."""
        if self.backend == "onnx":
            return self._detect_onnx_single(frame)
        else:
            return self._detect_ultralytics(frame)
    
    def detect_batch(self, frames):
        """
        BATCHED inference: processes multiple frames in ONE GPU call.
        Returns a list of detection-lists, one per input frame.
        """
        if self.backend == "onnx":
            return self._detect_onnx_batch(frames)
        else:
            # Ultralytics fallback: sequential
            return [self._detect_ultralytics(f) for f in frames]
    
    def _detect_onnx_single(self, frame):
        """Single frame ONNX inference."""
        blob, scale, px, py, oh, ow = self._preprocess(frame)
        batch = np.expand_dims(blob, axis=0)  # [1, 3, 640, 640]
        
        outputs = self.session.run(None, {self.input_name: batch})
        detections = self._postprocess(outputs[0], scale, px, py, oh, ow)
        
        has_people = len(detections) > 0
        self.history.append(has_people)
        stable = sum(self.history) >= self.min_stable
        
        return {
            "people_count": len(detections),
            "detections": detections,
            "stable": stable
        }
    
    def _detect_onnx_batch(self, frames):
        """Batched multi-frame ONNX inference — ONE GPU call for all cameras."""
        if not frames:
            return []
        
        preprocessed = []
        metadata = []
        
        for frame in frames:
            blob, scale, px, py, oh, ow = self._preprocess(frame)
            preprocessed.append(blob)
            metadata.append((scale, px, py, oh, ow))
        
        # Stack into batch tensor: [N, 3, 640, 640]
        batch = np.stack(preprocessed, axis=0).astype(np.float32)
        
        # ONE GPU inference call for all cameras
        outputs = self.session.run(None, {self.input_name: batch})
        raw_output = outputs[0]  # [N, 84, 8400]
        
        results = []
        for i in range(len(frames)):
            scale, px, py, oh, ow = metadata[i]
            frame_output = raw_output[i:i+1]  # Keep batch dim for postprocess
            detections = self._postprocess(frame_output, scale, px, py, oh, ow)
            
            has_people = len(detections) > 0
            self.history.append(has_people)
            stable = sum(self.history) >= self.min_stable
            
            results.append({
                "people_count": len(detections),
                "detections": detections,
                "stable": stable
            })
        
        return results
    
    def _detect_ultralytics(self, frame):
        """Fallback Ultralytics detection."""
        if self.model is None:
            return {"people_count": 0, "detections": [], "stable": False}
        
        results = self.model(frame, verbose=False)
        detections = []
        
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                if cls_id == 0 and conf >= self.conf_thresh:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    detections.append([x1, y1, x2, y2, conf])
        
        has_people = len(detections) > 0
        self.history.append(has_people)
        stable = sum(self.history) >= self.min_stable
        
        return {
            "people_count": len(detections),
            "detections": detections,
            "stable": stable
        }

if __name__ == "__main__":
    import time as t
    
    print("=== ONNX Inference Benchmark ===")
    detector = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)
    print(f"Backend: {detector.backend}")
    
    cap = cv2.VideoCapture(0)
    fps_history = deque(maxlen=60)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        start = t.perf_counter()
        result = detector.detect(frame)
        elapsed = t.perf_counter() - start
        fps = 1.0 / elapsed if elapsed > 0 else 0
        fps_history.append(fps)
        avg_fps = sum(fps_history) / len(fps_history)
        
        # Draw detections
        for det in result["detections"]:
            x1, y1, x2, y2, conf = det
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"{conf:.2f}", (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        cv2.putText(frame, f"FPS: {avg_fps:.0f} ({detector.backend})", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("ONNX Benchmark", frame)
        
        if cv2.waitKey(1) & 0xFF == 27:
            break
    
    cap.release()
    cv2.destroyAllWindows()
