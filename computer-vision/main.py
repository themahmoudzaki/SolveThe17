import os
import tensorflow           as tf
import numpy                as np
import pandas               as pd
import matplotlib.pyplot    as plt

from pathlib                    import Path
from preprocess_dataset         import preprocess_dataset
from sklearn.model_selection    import train_test_split
from sklearn.metrics            import confusion_matrix, classification_report


BASE_DIR = Path('Data')
IMG_DIR  = BASE_DIR   / 'bee_imgs'
CSV_PATH = BASE_DIR   / 'processed_data' / 'bee_data.csv'


print(tf.__version__)
GPU_S = tf.config.list_physical_devices('GPU')
print("# of GPUs Available:", len(GPU_S))

if GPU_S:
    for gpu in GPU_S:
        tf.config.experimental.set_memory_growth(gpu, True)

def main():
    section_print('Starting')
    preprocess_dataset()

    df = pd.read_csv(CSV_PATH)

    section_print('DataFrame Information')
    df.info()
    print(df.head())

    train, temp = train_test_split(
            df,
            train_size=0.7,
            stratify=df['caste'],
            shuffle=True,
            random_state=42
    )

    test, val = train_test_split(
        temp,
        test_size=0.5,
        stratify=temp['caste'],
        shuffle=True,
        random_state=42
    )


def section_print(str_s):
    print('\n\n')
    print(f'------------------- {str_s} -------------------')
    print('\n\n')


if __name__ == '__main__':
    main()
