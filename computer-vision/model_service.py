import numpy as np
import cv2
from utils import section_print, load_model, MODEL_D1_FILE, IMAGE_SIZE
from preprocess_D1 import preprocess_img

class ModelService:
    """
    Service responsible for managing bee classification model operations.
    
    This class handles loading the model, preprocessing frames for prediction,
    and executing predictions on batches of frames. It encapsulates all model
    interactions to maintain separation of concerns from API/presentation layers.
    """
    
    BEE_LABEL_STR = "Bee"
    NON_BEE_LABEL_STR = "Non-Bee"

    def __init__(self):
        """
        Initialize a new ModelService instance with an unloaded model.
        """
        self.model = None
        
    def load_model(self):
        """
        Load and initialize the bee classification model.
        
        Attempts to load the model from the predefined path in MODEL_D1_FILE.
        
        Returns:
            bool: True if model loaded successfully, False otherwise.
        """
        section_print("Loading Model")
        model_path = MODEL_D1_FILE
        print(f"Model-path: {model_path}")

        try:
            self.model = load_model(model_path)
            print("Model loaded successfully")
            return True
        except Exception as err:
            print(f"Error loading model: {err}")
            return False

    def is_model_loaded(self):
        """
        Check if the model has been successfully loaded.
        
        Returns:
            bool: True if the model is loaded, False otherwise.
        """
        return self.model is not None

    def preprocess_frame(self, frame_bgr: np.ndarray) -> np.ndarray | None:
        """
        Preprocess a single frame for model prediction.
        
        This method handles resizing, color space conversion, and applies
        the preprocessing required by the model.
        
        Args:
            frame_bgr (np.ndarray): The input frame in BGR format.
            
        Returns:
            np.ndarray | None: Preprocessed frame as numpy array ready for model
                              prediction, or None if preprocessing failed.
        """
        try:
            frame_resized = cv2.resize(frame_bgr, (IMAGE_SIZE[1], IMAGE_SIZE[0]))
            frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)

            processed_tensor = preprocess_img(frame_rgb)
            return processed_tensor.numpy()

        except Exception as err:
            print(f"Error processing frame: {err}")
            return None

    def predict_batch(self, batch):
        """
        Run model prediction on a batch of preprocessed frames.
        
        Args:
            batch (np.ndarray): A batch of preprocessed frames as a numpy array.
            
        Returns:
            list[dict]: A list of prediction results, one per frame, with each
                       result containing:
                       - "label": predicted class (Bee or Non-Bee)
                       - "confidence": confidence percentage as string
                       - "raw_score_non_bee": raw probability score for non-bee class
                       
        Raises:
            ValueError: If the model has not been loaded yet.
        """
        if not self.is_model_loaded():
            raise ValueError("Model not loaded. Cannot perform prediction.")
            
        prediction_scores = self.model.predict(batch)
        results_for_batch = []

        for score_value in prediction_scores:
            prob_non_bee = score_value[0]
            prob_bee = 1.0 - prob_non_bee
            confidence_percent = 0.0
            predicted_label_str = ""

            if prob_non_bee > 0.5:
                predicted_label_str = self.NON_BEE_LABEL_STR
                confidence_percent = float(prob_non_bee) * 100
            else:
                predicted_label_str = self.BEE_LABEL_STR
                confidence_percent = float(prob_bee) * 100

            results_for_batch.append(
                {
                    "label": predicted_label_str,
                    "confidence": f"{confidence_percent:.2f}%",
                    "raw_score_non_bee": f"{prob_non_bee:.4f}",
                }
            )
            
        return results_for_batch
