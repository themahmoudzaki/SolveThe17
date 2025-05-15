from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.websockets import WebSocketDisconnect  # Fixed import
import uvicorn
import numpy as np
import cv2
from utils import section_print
from model_service import ModelService

app = FastAPI(
    title="Bee Classification API",
    description="Upload a video and get frame by frame analysis",
    version="1.0.0",
)

# Configuration constants
API_BATCH_SIZE = 8
model_service = None  # Global model service instance


@app.on_event("startup")
async def startup_event_handler():
    """
    Initialize the model service when the API server starts.
    
    This is automatically called by FastAPI on application startup.
    """
    global model_service
    model_service = ModelService()
    success = model_service.load_model()

    if success:
        print("Bee classification API started. Model is loaded.")
    else:
        print("WARNING: Bee classification API started, but Model DID NOT load.")


@app.websocket("/ws/video")
async def video_classifier(ws: WebSocket):
    """
    WebSocket endpoint for real-time video frame classification.
    
    Receives video frames as binary data, processes them in batches,
    and returns classification results.
    """
    await ws.accept()
    section_print("WebSocket Client Connected")
    
    # Verify model is available
    global model_service
    if not model_service or not model_service.is_model_loaded():
        await ws.send_json({
            "error": "Model not loaded on server. Cannot process video."
        })
        await ws.close()
        print("Closed WebSocket: Model not available.")
        return

    frame_batch = []
    try:
        while True:
            # Receive and decode frame
            data = await ws.receive_bytes()
            frame_bgr = decode_frame(data)
            if frame_bgr is None:
                await ws.send_json({
                    "error": "Invalid frame received, could not decode"
                })
                continue

            # Process the frame
            processed_frame = model_service.preprocess_frame(frame_bgr)
            if processed_frame is not None:
                frame_batch.append(processed_frame)
            else:
                print("A frame could not be processed, skipping.")

            # When batch is complete, run prediction
            if len(frame_batch) >= API_BATCH_SIZE:
                await process_batch(ws, frame_batch)
                frame_batch.clear()

    except WebSocketDisconnect:
        print(f"Client disconnected. {len(frame_batch)} frames pending in batch were discarded.")
    except Exception as err:
        print(f"An unexpected error occurred in WebSocket handler: {err}")
        try:
            await ws.send_json({
                "error": "An unexpected server error occurred.", 
                "details": str(err)
            })
        except Exception as send_err:
            print(f"Could not send error to client: {send_err}")
    finally:
        print("WebSocket connection processing finished.")


async def process_batch(ws: WebSocket, frame_batch):
    """
    Process a batch of frames and send back the results.
    
    Args:
        ws (WebSocket): The active WebSocket connection
        frame_batch (list): List of preprocessed frames
        
    Raises:
        Exception: If prediction fails, the exception is propagated up
    """
    batch_to_predict = np.array(frame_batch)
    print(f"Predicting on a batch of {batch_to_predict.shape[0]} frames. Shape: {batch_to_predict.shape}")
    
    try:
        results = model_service.predict_batch(batch_to_predict)
        
        await ws.send_json({
            "predictions": results,
            "batch_size": len(frame_batch),
        })
        
    except Exception as err:
        print(f"Error during model predictions: {err}")
        await ws.send_json({
            "error": "Failed to get predictions from model.",
            "details": str(err),
        })
        # We're not clearing the batch here since the calling function handles that


def decode_frame(binary_data):
    """
    Decode binary data into a CV2 frame.
    
    Args:
        binary_data (bytes): The binary frame data
        
    Returns:
        np.ndarray: Decoded frame, or None if decoding fails
    """
    try:
        nparr = np.frombuffer(binary_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as err:
        print(f"Frame decode error: {err}")
        return None


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify API and model status.
    
    Returns:
        dict: Status information about the service
    """
    return {
        "status": "ok", 
        "model_loaded": model_service.is_model_loaded() if model_service else False
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
