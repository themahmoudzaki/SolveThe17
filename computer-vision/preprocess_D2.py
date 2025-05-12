from utils import *

BASE_DIR      = Path('Data')
DATASET_2     = BASE_DIR      / 'dataset_2'
BEE_DIR       = DATASET_2     / 'bee'
NON_BEE_DIR   = DATASET_2     / 'non_bee'
MIMICS_DIR    = DATASET_2     / 'mimics'

IMAGE_SIZE = (224, 224)

def load_data(data_arr, data_label_arr, dir_list, value):
  for img_path in dir_list:
    img = tf.keras.preprocessing.image.load_img(
      img_path,
      target_size = IMAGE_SIZE
    )
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    data_arr.append(img_array)
    data_label_arr.append(value)

def preprocess_D2():

  bee_img_list      = list(BEE_DIR.glob('*.*'))
  non_bee_img_list  = list(NON_BEE_DIR.glob('*.*'))
  mimics_img_list   = list(MIMICS_DIR.glob('*.*'))

  data_count = (  len(bee_img_list) +
                  len(non_bee_img_list) +
                  len(mimics_img_list)
  )
  data        = []
  data_labels = []

  section_print('Loading D2')
  load_data(data, data_labels, bee_img_list,      0)
  print('section 1 Finished')

  load_data(data, data_labels, non_bee_img_list,  1)
  print('section 2 Finished')

  load_data(data, data_labels, mimics_img_list,   1)
  print('section 3 Finished')

  section_print('D2 Statistics')
  print(f'Total Images: {len(data)}')
  print(f'Bee Images: {len(bee_img_list)}')
  print(f'Non Bee Images: {len(non_bee_img_list + mimics_img_list)}')

  return np.array(data), np.array(data_labels)



