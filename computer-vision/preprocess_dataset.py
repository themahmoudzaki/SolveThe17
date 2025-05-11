import  os
import  pandas      as pd
from    pathlib     import Path


BASE_DIR    = Path('Data')
INPUT_FILE  = BASE_DIR      / 'bee_data.csv'
OUTPUT_DIR  = BASE_DIR      / 'processed_data'
OUTPUT_FILE = OUTPUT_DIR    / 'bee_data.csv'
IMG_DIR     = BASE_DIR      / 'bee_imgs'
OUTPUT_DIR.mkdir(exist_ok=True)

def preprocess_dataset():
    print('Readin unprocessed CSV file')
    df = pd.read_csv(INPUT_FILE)
    df = (
        df
            .drop(['zip code', 'date', 'time', 'location'], axis=1)
            .query('subspecies != "-1"')
    )
    df['file_path'] = df['file'].apply(lambda x: IMG_DIR / x)
    df = df.drop('file', axis=1)

    df.to_csv(OUTPUT_FILE, index=False)
    print('CSV file saved and processed')
