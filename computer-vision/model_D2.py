from utils import *

def model_D2(X, y, test_size=0.2, random_state=42):
  model = cnn_model_D2()
  train_model(model, X, y, test_size, random_state)

def cnn_model_D2():
  section_print('Creating D2 CNN Model Architecture')
  model = tf.keras.Sequential(
    [
      tf.keras.layers.Rescaling(1./255, input_shape=(*IMAGE_SIZE, 3)),
      tf.keras.layers.RandomFlip('horizontal'),
      tf.keras.layers.RandomRotation(0.1),
      tf.keras.layers.RandomZoom(0.1),
      tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Flatten(),
      tf.keras.layers.Dense(128, activation='relu'),
      tf.keras.layers.Dropout(0.4),

      tf.keras.layers.Dense(1, activation='sigmoid')
    ],
    name="Bee_Classifier"
  )
  model.compile(
    optimizer   = tf.keras.optimizers.Adam(learning_rate = 1e-4),
    loss        = 'binary_crossentropy',
    metrics     = ['accuracy']
  )

  model.summary()

  return model


def train_model(model, X, y, test_size, random_state):
  section_print('Training D2 CNN Model')
  X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=test_size,
    random_state=random_state,
    stratify=y
  )

  history = model.fit(
    X_train,
    y_train,
    validation_data = (X_test, y_test),
    epochs = 30,
    batch_size = 32,
    callbacks = [
      tf.keras.callbacks.EarlyStopping( patience=5, restore_best_weights = True )
    ]
  )
  loss, acc = model.evaluate(X_test, y_test)
  print(f'\nValidation accuracy: {acc:.4f}')

  MODEL_D2_DIR.mkdir(exist_ok=True)

  section_print('Saving Model')
  model.save(MODEL_D2_FILE)
  print('model saved succesfully')

