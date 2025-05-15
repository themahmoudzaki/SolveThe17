from utils import *


def preprocess_img(img_array):
    arr_scaled = tf.cast(img_array, tf.float32) / 255.0

    return arr_scaled
