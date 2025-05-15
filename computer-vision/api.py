from utils import *
from preprocess_D1 import preprocess_img

# --- FastAPI Application Setup ---
app = FastAPI(
    title="Bee Classification API",
    description="Upload a video and get frame by frame analysis",
    version="1.0.0",
)

# --- Classification Labels ---
BEE_LABEL_STR = "Bee"
NON_BEE_LABEL_STR = "Non-Bee"

# --- Global Variables ---
model = None
fetched_info_items: List[
    Dict[str, str]
] = []  # Cache for information fetched from Gemini API
"""
We know that the API key should never be pushed to github
and should be kept in a separate file that is ignored by git
however to make the code runnable to the judges we added it
"""
GEMINI_API_KEY_NAME = "AIzaSyDjWKPn2OqOS3cAMP49rv1mqMOEHjQPkE4"


def get_global_model() -> Optional[tf.keras.Model]:
    """
    Loads the pre-trained Keras model from the specified file path.

    Prints success or error messages to the console.

    Returns:
        Optional[tf.keras.Model]: The loaded Keras model if successful, otherwise None.
    """
    section_print("Loading Model")
    print(f"Model-path: {MODEL_D1_FILE}")

    try:
        loaded_model = load_model(MODEL_D1_FILE)
        print("\nModel loaded successfully")
        return loaded_model

    except Exception as err:
        print(f"\nError loading model: {err}")
        return None


def preprocess_frame_for_api(frame_bgr: np.ndarray) -> np.ndarray | None:
    """
    Preprocesses a single video frame (BGR format) for model prediction.

    Resizes, converts color space (BGR to RGB), and applies model-specific preprocessing.

    Args:
        frame_bgr (np.ndarray): The input frame in BGR format.

    Returns:
        Optional[np.ndarray]: The processed frame as a NumPy array if successful, otherwise None.
                               The array is ready to be part of a batch for prediction.
    """
    try:
        # Resize frame to the model's expected input size
        frame_resized = cv2.resize(frame_bgr, (IMAGE_SIZE[1], IMAGE_SIZE[0]))
        # Convert frame from BGR (OpenCV default) to RGB
        frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)

        processed_tensor = preprocess_img(frame_rgb)
        return processed_tensor.numpy()

    except Exception as err:
        print(f"Error processing frame: {err}")
        return None


async def fetch_info_from_gemini(
    api_key: str, topic_query: str, topic_display_name: str, model_name: str = "gemini-2.0-flash"
) -> Optional[Dict[str, str]]:
    """
    Asynchronously fetches information from the Google Gemini API for a given topic.

    Args:
        api_key (str): The Google Generative AI API key.
        topic_query (str): The specific query string to send to the Gemini API.
        topic_display_name (str): The name of the topic to be used in the returned dictionary.
        model_name (str, optional): The name of the Gemini model to use. Defaults to "gemini-pro".

    Returns:
        Optional[Dict[str, str]]: A dictionary containing the topic and its fetched information summary
                                  if successful, otherwise None.
    """
    try:
        genAI.configure(api_key=api_key)
        gemini_model = genAI.GenerativeModel(model_name)
        prompt = f"Provide a concise, up-to-date piece of information consisting of a head, body, and 3 bullet points of key info \
                regarding {topic_query}. Imagining that this is for a quick news brief"

        response = await gemini_model.generate_content_async(prompt)
        if response.parts:
            generated_text = "".join(
                part.text for part in response.parts if hasattr(part, "text")
            )
        elif hasattr(response, "text"):  # Simpler access if no complex parts
            generated_text = response.text
        else:
            generated_text = "No information could be generated"

        return {
            "topic": topic_display_name,
            "info_summary": generated_text.strip(),
        }
    except Exception as err:
        print(f"An unexpected error occured: {err}")


@app.on_event("startup")
async def startup_event_handler():
    """
    Event handler executed when the FastAPI application starts.

    - Loads the global machine learning model.
    - Fetches initial information from the Gemini API for predefined topics.
    """
    global model
    if model is None:
        model = get_global_model()

    if model:
        print("Bee classification API started. Model is loaded.")
    else:
        print("WARNING: Bee classification API started, but Model DID NOT load.")

    section_print("Fetching news from GEMINI API")

    topics_to_fetch = {
        "Climate Change": "current significant impacts or solutions for climate change",
        "Bees & Pollinators": "latest news on bee population health or conservation efforts for pollinators",
        "UN SDGs": "recent progress or major challenges related to the UN Sustainable Development Goals",
    }

    fetched_info_items.clear()
    for display_topic, query_text in topics_to_fetch.items():
        print(f"Fetching info for topic: {display_topic} (Query: {query_text})")
        info_item = await fetch_info_from_gemini(
            GEMINI_API_KEY_NAME, query_text, display_topic
        )
        fetched_info_items.append(info_item)


@app.websocket("/ws/video")
async def video_classifier(ws: WebSocket):
    """
    WebSocket endpoint for real-time video frame classification.

    Receives video frames, preprocesses them, performs batch predictions using the loaded model,
    and sends classification results back to the client.
    Also sends initial information fetched from Gemini API upon connection.

    Args:
        ws (WebSocket): The WebSocket connection object.
    """
    await ws.accept()
    section_print("WebSocket Client Connected")
    if fetched_info_items:
        await ws.send_json(
            {
                "type": "info_update",  # Changed type from "news_update"
                "payload": fetched_info_items,
            }
        )

    else:
        await ws.send_json(
            {
                "type": "info_update",
                "payload": [],
                "message": "Information could not be fetched at this time.",
            }
        )

    if model is None:
        await ws.send_json(
            {"error": "Model not loaded on server. Cannot process video."}
        )
        await ws.close()
        print("Closed WebSocket: Model not available.")
        return

    frame_batch = []
    try:
        while True:
            data = await ws.receive_bytes()
            nparr = np.frombuffer(data, np.uint8)
            frame_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame_bgr is None:
                await ws.send_json(
                    {"error": "Invalid frame received, could not decode"}
                )
                continue

            processed_frame = preprocess_frame_for_api(frame_bgr)
            if processed_frame is not None:
                frame_batch.append(processed_frame)
            else:
                print("A frame could not be processed, skipping.")

            if len(frame_batch) >= BATCH_SIZE:
                batch_to_predict = np.array(frame_batch)
                print(
                    f"Predicting on a batch of {batch_to_predict.shape[0]} frames. Shape: {batch_to_predict.shape}"
                )

                try:
                    prediction_scores = model.predict(batch_to_predict)
                    results_for_batch = []

                    for score_value in prediction_scores:
                        prob_non_bee = score_value[0]
                        prob_bee = 1.0 - prob_non_bee
                        confidence_percent = 0.0
                        predicted_label_str = ""

                        if prob_non_bee > 0.5:
                            predicted_label_str = NON_BEE_LABEL_STR
                            confidence_percent = float(prob_non_bee) * 100
                        else:
                            predicted_label_str = BEE_LABEL_STR
                            confidence_percent = float(prob_bee) * 100

                        results_for_batch.append(
                            {
                                "label": predicted_label_str,
                                "confidence": f"{confidence_percent:.2f}%",
                                "raw_score_non_bee": f"{prob_non_bee:.4f}",
                            }
                        )

                    await ws.send_json(
                        {
                            "predictions": results_for_batch,
                            "batch_size": len(frame_batch),
                        }
                    )

                except Exception as err:
                    print(f"Error during model predictions: {err}")
                    await ws.send_json(
                        {
                            "error": "Failed to get predictions from model.",
                            "details": str(err),
                        }
                    )
                finally:
                    frame_batch.clear()

    except WebSocketDisconnect:
        print(
            f"Client disconnected. {len(frame_batch)} frames pending in batch were discarded."
        )
    except Exception as err:
        print(f"An unexpected error occurred in WebSocket handler: {err}")

        try:
            await ws.send_json(
                {"error": "An unexpected server error occurred.", "details": str(err)}
            )
        except Exception as send_err:
            print(f"Could not send error to client: {send_err}")
    finally:
        print("WebSocket connection processing finished.")


@app.get("/api/info")
async def get_information():
    """
    HTTP GET endpoint to retrieve the fetched information items (news/updates).

    Returns:
        dict: A dictionary containing the list of fetched information items or a message if unavailable.
    """
    if not fetched_info_items:
        return {
            "info_items": [],
            "message": "Information is not available or could not be fetched.",
        }
    return {"info_items": fetched_info_items}


@app.get("/health")
def health_check():
    """
    HTTP GET endpoint for health checking the API.

    Indicates if the API is running and if the model is loaded.

    Returns:
        dict: A dictionary with the status and model loaded status.
    """
    return {"status": "ok", "model_loaded": model is not None}

# --- Main Execution Block ---
if __name__ == "__main__":
    # Run the FastAPI application using Uvicorn ASGI server
    # Host "0.0.0.0" makes the server accessible on the network
    # Port 3000 is the port the server will listen on
    uvicorn.run(app, host="0.0.0.0", port=3000)
