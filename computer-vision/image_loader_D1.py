from utils import *
from preprocess_D1 import preprocess_img

# --- Label Definitions for Dataset D1 ---
BEE_LABEL = 0
# The model will output a probability for NON_BEE_LABEL (class 1).
NON_BEE_LABEL = 1


def load_image(img_path):
    """
    Loads a single image from the given path, resizes it, and preprocesses it.

    Args:
        img_path (Path): The path to the image file.

    Returns:
        Optional[tf.Tensor]: A preprocessed image as a TensorFlow tensor if loading and
                             preprocessing are successful, otherwise None.
    """
    try:
        img = tf.keras.preprocessing.image.load_img(img_path, target_size=IMAGE_SIZE)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = preprocess_img(img_array)

        return img_array
    except Exception as err:
        print(f"Error loading: {img_path}: {err}")
        return None


def load_data_batch(img_paths, label_value):
    """
    Loads a batch of images from the provided paths in parallel and assigns a common label.

    Uses a ThreadPoolExecutor for concurrent image loading to speed up the process.

    Args:
        img_paths (List[Path]): A list of Path objects, each pointing to an image file.
        label_value (int): The integer label to assign to all images in this batch.

    Returns:
        Tuple[List[tf.Tensor], List[int]]: A tuple containing:
            - A list of preprocessed image tensors.
            - A list of corresponding integer labels.
    """
    data_batch = []
    labels_batch = []

    # Use a thread pool to load images concurrently
    with ThreadPoolExecutor() as executor:
        results = list(executor.map(load_image, img_paths))

    for result in results:
        if result is not None:
            data_batch.append(result)
            labels_batch.append(label_value)

    return data_batch, labels_batch


def load_dataset(img_dirs_and_labels):
    """
    Loads the entire dataset from specified directories.

    Iterates through directories, loads images in batches, and collects all data and labels.
    Prints statistics about the loaded dataset.

    Args:
        img_dirs_and_labels (List[Tuple[Path, int]]): A list of tuples, where each tuple
            contains a Path object to a directory of images and the integer label
            to assign to images from that directory.

    Returns:
        Tuple[np.ndarray, np.ndarray]: A tuple containing:
            - A NumPy array of all loaded and preprocessed image data.
            - A NumPy array of corresponding integer labels.
    """
    data = []
    labels = []
    bee_count = 0
    non_bee_count = 0

    section_print("Loading Dataset D1")

    for dir_path, label in img_dirs_and_labels:
        img_paths = list(dir_path.glob("*.*"))

        if label == BEE_LABEL:
            bee_count += len(img_paths)
        else:
            non_bee_count += len(img_paths)
        print(f"Loading {len(img_paths)} images with label {label}")

        num_batches = math.ceil(len(img_paths) / BATCH_SIZE)

        for i in tqdm(range(num_batches)):
            start_idx = i * BATCH_SIZE
            end_idx = min((i + 1) * BATCH_SIZE, len(img_paths))
            batch_paths = img_paths[start_idx:end_idx]

            batch_data, batch_labels = load_data_batch(batch_paths, label)
            data.extend(batch_data)
            labels.extend(batch_labels)

    section_print("Dataset Statistics")
    print(f"Total Images : {len( data )}")
    print(f"Bee Images: {bee_count}")
    print(f"Non-Bee Images: {non_bee_count}")

    return np.array(data), np.array(labels)


def loading_handler_D1():
    """
    Handler function specifically for loading Dataset D1.

    Defines the directories and their corresponding labels for Dataset D1
    and calls load_dataset to get the data.

    Returns:
        Tuple[np.ndarray, np.ndarray]: A tuple containing the loaded image data (X)
                                       and labels (y) for Dataset D1.
    """
    # Define the directories and their associated integer labels
    # MIMICS_DIR is labeled as NON_BEE_LABEL
    img_dirs_and_labels = [
        (BEE_DIR, BEE_LABEL),
        (NON_BEE_DIR, NON_BEE_LABEL),
        (MIMICS_DIR, NON_BEE_LABEL),
    ]

    return load_dataset(img_dirs_and_labels)
