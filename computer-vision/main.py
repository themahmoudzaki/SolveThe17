from utils          import *
from preprocess_D1  import preprocess_D1
from preprocess_D2  import preprocess_D2
from model_D2       import model_D2

def main():
  section_print('Starting Program')

  print(f'Tensorflow Version: {tf.__version__}')
  print(f'Numpy Version: {np.__version__}')
  print(f'# of GPUs Available:{len(GPU_S)}')
  if GPU_S:
    for gpu in GPU_S:
        tf.config.experimental.set_memory_growth(gpu, True)


  X_D2, y_D2 = preprocess_D2()
  model_D2(X_D2, y_D2, test_size=0.2, random_state=42)




if __name__ == '__main__':
    main()
