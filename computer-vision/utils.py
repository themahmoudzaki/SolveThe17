import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
import tensorflow_addons as tfa  # For additional metrics like F1Score
import math
import uvicorn  # ASGI server for FastAPI
import cv2  # OpenCV for image processing
from pathlib import Path  # For object-oriented file path handling
from sklearn.model_selection import train_test_split  # For splitting dataset
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
)  # For model evaluation
from concurrent.futures import ThreadPoolExecutor  # For parallel image loading
from tqdm import tqdm  # For progress bars
from tensorflow.keras.models import load_model  # For loading trained models
from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
)  # For creating the API and WebSocket handling
import httpx  # Asynchronous HTTP client (though not explicitly used in current fetch_info_from_gemini)
from typing import List, Dict, Optional  # For type hinting
import google.generativeai as genAI  # Google Generative AI SDK


# --- Global Configurations ---
BASE_DIR = Path("Data")

# Tensorflow Specific Configs
GPU_S = tf.config.list_physical_devices("GPU")
IMAGE_SIZE = (224, 224)  # Target image size for model input
EPOCHS = 100
BATCH_SIZE = 32
os.environ["TF_CPP_MIN_LOG_LEVEL"] = (
    "3"  # Suppress TensorFlow C++ logging (0=all, 1=info, 2=warning, 3=error)
)


# D1# D1 - Dataset 1 Specific Configurations
DATASET_1 = BASE_DIR / "dataset_1"
BEE_DIR = DATASET_1 / "bee"
NON_BEE_DIR = DATASET_1 / "non_bee"
MIMICS_DIR = DATASET_1 / "mimics"
MODEL_D1_DIR = Path("model")
MODEL_D1_FILE = MODEL_D1_DIR / "D1.h5"


def section_print(str_s):
    """
    Prints a formatted section header to the console.

    Args:
        str_s (str): The string to be displayed in the section header.
    """
    print("\n\n")
    print(f"------------------- {str_s} -------------------")
    print("\n")
