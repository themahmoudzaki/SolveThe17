import os
import pandas             as pd
import numpy              as np
import matplotlib.pyplot  as plt
import tensorflow         as tf
import math

from pathlib                  import Path
from sklearn.model_selection  import train_test_split
from sklearn.metrics          import confusion_matrix, classification_report
from concurrent.futures       import ThreadPoolExecutor
from tqdm                     import tqdm


BASE_DIR      = Path('Data')

# Tensorflow
GPU_S = tf.config.list_physical_devices('GPU')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
EPOCHS      = 100
BATCH_SIZE  = 32


# D1
# Used in Main
DATASET_1     = BASE_DIR      / 'dataset_1'
IMG_DIR_D1    = DATASET_1     / 'bee_imgs'
CSV_PATH_D1   = DATASET_1     / 'processed_data' / 'bee_data.csv'
# Used in preprocess_D1
DATASET_1       = BASE_DIR          / 'dataset_1'
INPUT_FILE_D1   = DATASET_1         / 'bee_data.csv'
OUTPUT_DIR_D1   = DATASET_1         / 'processed_data'
OUTPUT_FILE_D1  = OUTPUT_DIR_D1     / 'bee_data.csv'
IMG_DIR_D1      = DATASET_1         / 'bee_imgs'

# D2
DATASET_2     = BASE_DIR      / 'dataset_2'
BEE_DIR       = DATASET_2     / 'bee'
NON_BEE_DIR   = DATASET_2     / 'non_bee'
MIMICS_DIR    = DATASET_2     / 'mimics'
MODEL_D2_DIR  = Path('model')
MODEL_D2_FILE = MODEL_D2_DIR  / 'D2'
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

def section_print(str_s):
    print('\n\n')
    print(f'------------------- {str_s} -------------------')
    print('\n')
