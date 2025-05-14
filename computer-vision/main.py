from utils import *
from image_loader_D1 import loading_handler_D1
from model_D1 import model_D1


def setup_env():
    section_print("Enviroment Setup")
    print(f"Tensorflow Version: {tf.__version__}")
    print(f"Numpy Version: {np.__version__}")
    print(f"# of GPUs Available:{len(GPU_S)}")
    if GPU_S:
        for gpu in GPU_S:
            tf.config.experimental.set_memory_growth(gpu, True)
            print(f"Memory growth enabled for GPU: {gpu}")

    num_threads = os.cpu_count()
    tf.config.threading.set_inter_op_parallelism_threads(num_threads)
    tf.config.threading.set_intra_op_parallelism_threads(num_threads)
    print(f"CPU Threads: {num_threads}")


def main():
    section_print("Starting Program")
    print(
        'Running the best "Bee V Non-Bee" '
        "classification model made by the one and only Mahmoud Zaki"
    )

    setup_env()

    X_D1, y_D1 = loading_handler_D1()
    model_D1(X_D1, y_D1, test_size=0.2, random_state=42)

    section_print("Program Finished Succesfully")


if __name__ == "__main__":
    main()
