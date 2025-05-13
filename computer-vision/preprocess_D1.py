from utils import *

OUTPUT_DIR_D1.mkdir(exist_ok=True)
def preprocess_D1():
    section_print('Preprocessing Dataset D1')
    print(f'Reading unprocessed CSV file: {INPUT_FILE_D1}')
    df = pd.read_csv(INPUT_FILE_D1)

    print('Processing DataFrame...')
    columns_to_drop = ['zip code', 'date', 'time', 'location']
    df = (
        df
            .drop(columns_to_drop, axis=1)
            .query('subspecies != "-1"')
    )
    df['file_path'] = df['file'].apply(lambda x: IMG_DIR_D1 / x)
    df = df.drop('file', axis=1)

    print(f'Saving processed CSV file to: {OUTPUT_FILE_D1}')
    df.to_csv(OUTPUT_FILE_D1, index=False)
    print('CSV file saved and processed')
