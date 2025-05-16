from utils import *
from preprocess_D1 import preprocess_img

import httpx
from typing import List, Dict, Optional
import google.generativeai as genAI

app = FastAPI(
    title="Bee Classification API",
    description="Upload a video and get frame by frame analysis",
    version="1.0.0",
)

BEE_LABEL_STR = "Bee"
NON_BEE_LABEL_STR = "Non-Bee"

model = None

fetched_info_items: List[Dict[str, str]] = []
GEMINI_API_KEY_NAME = "AIzaSyDjWKPn2OqOS3cAMP49rv1mqMOEHjQPkE4"


def get_global_model():
    section_print("Loading Model")
    print(f"Model-path: {MODEL_D1_FILE}")

    try:
        loaded_model = load_model(MODEL_D1_FILE)
        print("Model loaded successfully")
        return loaded_model

    except Exception as err:
        print(f"Error loading model: {err}")
        return None


def preprocess_frame_for_api(frame_bgr: np.ndarray) -> np.ndarray | None:
    try:
        frame_resized = cv2.resize(frame_bgr, (IMAGE_SIZE[1], IMAGE_SIZE[0]))
        frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)

        processed_tensor = preprocess_img(frame_rgb)
        return processed_tensor.numpy()

    except Exception as err:
        print(f"Error processing frame: {err}")
        return None


async def fetch_info_from_gemini(
    api_key: str, topic_query: str, topic_display_name: str, model_name: str = ""
) -> Optional[Dict[str, str]]:
    try:
        genAI.configure(api_key=api_key)
        gemini_model = genAI.GenerativeModel(model_name)
        prompt = f"Provide a concise, up-to-date piece of information consisting of a head, body, and 3 bullet points of key info \
                regarding {topic_query}. Imagining that this is for a quick news brief"

        response = await model.generate_content_async(prompt)
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
    if not fetched_info_items:
        return {
            "info_items": [],
            "message": "Information is not available or could not be fetched.",
        }
    return {"info_items": fetched_info_items}


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
