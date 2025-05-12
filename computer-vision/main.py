from utils          import *
from preprocess_D1  import preprocess_D1
from preprocess_D2  import preprocess_D2

def main():
  section_print('Starting Program')

  print(f'Tensorflow Version: {tf.__version__}')
  print(f'Numpy Version: {np.__version__}')
  print("# of GPUs Available:", len(GPU_S))
  if GPU_S:
    for gpu in GPU_S:
        tf.config.experimental.set_memory_growth(gpu, True)


  X_D2, y_D2 = preprocess_D2()
  from model_D2 import cnn_model_D2
  cnn_model_D2()




if __name__ == '__main__':
    main()
