from utils import *

OUTPUT_DIR_D1.mkdir(exist_ok=True)
def preprocess_D1():
    print('Reading unprocessed CSV file')
    df = pd.read_csv(INPUT_FILE_D1)
    df = (
        df
            .drop(['zip code', 'date', 'time', 'location'], axis=1)
            .query('subspecies != "-1"')
    )
    df['file_path'] = df['file'].apply(lambda x: IMG_DIR_D1 / x)
    df = df.drop('file', axis=1)

    df.to_csv(OUTPUT_FILE_D1, index=False)
    print('CSV file saved and processed')
