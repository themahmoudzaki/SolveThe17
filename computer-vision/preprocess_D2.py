from utils import *

BEE_LABEL     = 0
NON_BEE_LABEL = 1

def load_data(data_arr, data_label_arr, img_path_list, label_value):
  img_count = len(img_path_list)
  print(f'Loading {img_count} images with label {label_value}...')
  for img_path in img_path_list:
    img = tf.keras.preprocessing.image.load_img(
      img_path,
      target_size = IMAGE_SIZE
    )
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    data_arr.append(img_array)
    data_label_arr.append(label_value)

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

  section_print('Loading Dataset D2 (Bee vs Non-Bee)')
  load_data(data, data_labels, bee_img_list,      BEE_LABEL)
  print('section 1 Finished')

  load_data(data, data_labels, non_bee_img_list,  NON_BEE_LABEL)
  print('section 2 Finished')

  load_data(data, data_labels, mimics_img_list,   NON_BEE_LABEL)
  print('section 3 Finished')

  section_print('Dataset D2 Statistics')
  print(f'Total Images: {len(data)}')
  print(f'Bee Images: {len(bee_img_list)}')
  print(f'Non Bee Images: {len(non_bee_img_list + mimics_img_list)}')

  return np.array(data), np.array(data_labels)



