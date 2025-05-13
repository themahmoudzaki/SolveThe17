from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import numpy as np
import cv2
from utils import *

app = FastAPI(
  title='Bee Classification API',
  description='Upload a video and get frame by frame analysis',
  version='1.0.0'
)

def get_model():
  model_path = Path('model') / 'D2'
  model = tf.load_model(model_path)

  return model

model = get_model()

@app.websocket('/ws/video')
async def video_classifier(ws: WebSocket):
  await ws.accept()
  try:
    while True:
      data = await ws.receive_bytes()
      nparr = np.frombuffer(data, np.uint8)

      frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
      if frame is None:
        await ws.send_json( {'error': 'invalid frame'} )
        continue

  except WebSocketDisconnect:
    print('Client disconnected from video classifier')

  @app.get('/health')
  def health_check():
    return { 'status': 'ok' }

if __name__ == '__main__':
  uvicorn.run(app, host='0.0.0.0', port=8000)
