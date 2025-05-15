from utils import *


def preprocess_img(img_array):
    """
    Converts the image array to tf.float32 and scales pixel values
    from the range [0, 255] to [0.0, 1.0].

    Args:
        img_array (np.ndarray): A NumPy array representing an image.
                                Expected to have pixel values in the range [0, 255].

    Returns:
        tf.Tensor: A TensorFlow tensor with pixel values scaled to [0.0, 1.0].
    """
    arr_scaled = tf.cast(img_array, tf.float32) / 255.0

    return arr_scaled
