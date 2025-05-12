from utils import *


def cnn_model_D2():
  model = tf.keras.Sequential(
    [
      tf.keras.layers.Rescaling(1./255, input_shape=(*IMAGE_SIZE, 3)),
      tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(63, (3, 3), activation='relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
      tf.keras.layers.MaxPooling2d((2, 2)),

      tf.keras.layers.Flatten(),
      tf.keras.layers.Dense(128, activation='relu'),
      tf.keras.layers.Dropout(0.5),

      tf.keras.layers.Dense(1, activation='sigmoid')
    ]
  )
  model.compile(
    optimizer   = tf.keras.optimizers.Adam(learning_rate = 1e4),
    loss        = 'binary_crossentropy',
    metrics     = ['accuracy']
  )
  pass
