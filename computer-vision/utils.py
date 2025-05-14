import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
import math
import uvicorn
import cv2

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
from tensorflow.keras.models import load_model
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

BASE_DIR = Path("Data")

# Tensorflow
GPU_S = tf.config.list_physical_devices("GPU")
IMAGE_SIZE = (224, 224)
EPOCHS = 100
BATCH_SIZE = 64
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"


# D1
DATASET_1 = BASE_DIR / "dataset_1"
BEE_DIR = DATASET_1 / "bee"
NON_BEE_DIR = DATASET_1 / "non_bee"
MIMICS_DIR = DATASET_1 / "mimics"
MODEL_D1_DIR = Path("model")
MODEL_D1_FILE = MODEL_D1_DIR / "D1.h5"


def section_print(str_s):
    print("\n\n")
    print(f"------------------- {str_s} -------------------")
    print("\n")
