from utils import *
from image_loader_D1 import loading_handler_D1
from model_D1 import model_D1

# This is the main script to set up the environment, load data, and train the D1 model.

def setup_env():
    """
    Sets up the TensorFlow environment.

    Prints version information, GPU availability, and configures memory growth for GPUs.
    Also configures TensorFlow parallelism threads based on CPU cores.
    """
    section_print("Enviroment Setup")
    print(f"Tensorflow Version: {tf.__version__}")
    print(f"Numpy Version: {np.__version__}")
    print(f"# of GPUs Available:{len(GPU_S)}")
    if GPU_S:
        for gpu in GPU_S:
            # Set memory growth to True to allocate GPU memory on an as-needed basis.
            # This helps prevent TensorFlow from allocating all GPU memory at once.
            tf.config.experimental.set_memory_growth(gpu, True)
            print(f"Memory growth enabled for GPU: {gpu}")
    # Configure TensorFlow's parallelism settings
    num_threads = os.cpu_count()
    tf.config.threading.set_inter_op_parallelism_threads(num_threads)
    tf.config.threading.set_intra_op_parallelism_threads(num_threads)
    print(f"CPU Threads: {num_threads}")


def main():
    """
    Main function to execute the model training pipeline.
    """
    section_print("Starting Program")
    print(
        'Running the best "Bee V Non-Bee" '
        "classification model made by the one and only Mahmoud Zaki"
    )

    setup_env()
    # Load Dataset D1
    # X_D1 will contain the image data (NumPy array)
    # y_D1 will contain the corresponding labels (NumPy array)
    X_D1, y_D1 = loading_handler_D1()
    # Create, train, and save the D1 model
    # test_size=0.2 means 20% of the data will be used for testing
    # random_state=42 ensures reproducibility of the train/test split
    model_D1(X_D1, y_D1, test_size=0.2, random_state=42)

    section_print("Program Finished Succesfully")


if __name__ == "__main__":
    main()
