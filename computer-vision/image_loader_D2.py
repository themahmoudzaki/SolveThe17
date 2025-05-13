from utils import *


BEE_LABEL     = 0
NON_BEE_LABEL = 1

def load_image(img_path):
  try:
    img = tf.keras.preprocessing.image.load_img(
      img_path,
      target_size=IMAGE_SIZE
    )
    img_array = tf.keras.preprocessing.image.img_to_array(img)

    return img_array
  except Exception as err:
    print(f'Error loading: {img_path}: {err}')
    return None

def load_data_batch(img_paths, label_value):
  data_batch    = []
  labels_batch  = []

  with ThreadPoolExecutor() as executor:
    results = list(
      executor.map(
        load_image,
        img_paths
      )
    )

  for result in results:
    if result is not None:
      data_batch.append(result)
      labels_batch.append(label_value)

  return data_batch, labels_batch


def load_dataset(img_dirs_and_labels):
  data          = []
  labels        = []
  bee_count     = 0
  non_bee_count = 0

  section_print('Loading Dataset D2')

  for dir_path, label in img_dirs_and_labels:
    img_paths = list(dir_path.glob('*.*'))

    if label == BEE_LABEL: bee_count      += len(img_paths)
    else:                  non_bee_count  += len(img_paths)
    print(f'Loading {len(img_paths)} images with label {label}')

    num_batches = math.ceil( len( img_paths ) / BATCH_SIZE )

    for i in tqdm( range( num_batches ) ):
      start_idx = i * BATCH_SIZE
      end_idx   = min( ( i + 1 ) * BATCH_SIZE, len( img_paths ) )
      batch_paths = img_paths[ start_idx:end_idx ]

      batch_data, batch_labels = load_data_batch(batch_paths, label)
      data.extend( batch_data )
      labels.extend( batch_labels )

  section_print('Dataset Statistics')
  print(f'Total Images : {len( data )}')
  print(f'Bee Images: {bee_count}')
  print(f'Non-Bee Images: {non_bee_count}')

  return np.array(data), np.array(labels)

def loading_handler_D2():
  img_dirs_and_labels = [
    (BEE_DIR, BEE_LABEL),
    (NON_BEE_DIR, NON_BEE_LABEL),
    (MIMICS_DIR, NON_BEE_LABEL)
  ]

  return load_dataset(img_dirs_and_labels)
