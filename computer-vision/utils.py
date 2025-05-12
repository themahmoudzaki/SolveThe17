import os
import pandas             as pd
import numpy              as np
import matplotlib.pyplot  as plt
import tensorflow         as tf

from pathlib                  import Path
from sklearn.model_selection  import train_test_split
from sklearn.metrics          import confusion_matrix, classification_report




BASE_DIR      = Path('Data')

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
IMAGE_SIZE = (224, 224)


GPU_S = tf.config.list_physical_devices('GPU')

def section_print(str_s):
    print('\n\n')
    print(f'------------------- {str_s} -------------------')
    print('\n')
