from utils import *

def model_D1(X, y, test_size=0.2, random_state=42):
  model = cnn_model_D1()
  train_model(model, X, y, test_size, random_state)

def cnn_model_D1():
  section_print('Creating D1 CNN Model Architecture')
  if len(GPU_S) > 0:
    try:
        policy = tf.keras.mixed_precision.Policy('mixed_float16')
        tf.keras.mixed_precision.set_global_policy(policy)
        print("Using mixed precision training")
    except:
        print("Mixed precision training not available, using default precision")

  model = tf.keras.Sequential(
    [
      tf.keras.layers.InputLayer(input_shape=(*IMAGE_SIZE, 3)),
      tf.keras.layers.RandomFlip('horizontal'),
      tf.keras.layers.RandomRotation(0.2),
      tf.keras.layers.RandomZoom(0.2),

      tf.keras.layers.Conv2D(32, (3, 3), padding='same', activation=None),
      tf.keras.layers.BatchNormalization(),
      tf.keras.layers.Activation('relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(64, (3, 3), padding='same', activation=None),
      tf.keras.layers.BatchNormalization(),
      tf.keras.layers.Activation('relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(128, (3, 3), padding='same', activation=None),
      tf.keras.layers.BatchNormalization(),
      tf.keras.layers.Activation('relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Conv2D(256, (3, 3), padding='same', activation=None),
      tf.keras.layers.BatchNormalization(),
      tf.keras.layers.Activation('relu'),
      tf.keras.layers.MaxPooling2D((2, 2)),

      tf.keras.layers.Flatten(),
      tf.keras.layers.Dense(256, activation=None),
      tf.keras.layers.BatchNormalization(),
      tf.keras.layers.Activation('relu'),
      tf.keras.layers.Dropout(0.5),

      tf.keras.layers.Dense(1, activation='sigmoid')
    ],
    name="Bee_Classifier"
  )

  lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
        initial_learning_rate=1e-3,
        decay_steps=1000,
        decay_rate=0.9
    )

  model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr_schedule),
        loss='binary_crossentropy',
        metrics=['accuracy',
                tf.keras.metrics.Precision(name='precision'),
                tf.keras.metrics.Recall(name='recall'),
                tf.keras.metrics.AUC(name='auc')]
    )

  model.summary()

  return model


def train_model(model, X, y, test_size, random_state):
  section_print('Training D1 CNN Model')
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
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=[
      tf.keras.callbacks.EarlyStopping( patience=5, restore_best_weights = True )
    ]
  )
  evaluation_results = model.evaluate(X_test, y_test, verbose=0)

  section_print('Model Metrics')
  for metric_name, metric_value in zip(model.metrics_names, evaluation_results):
     print(f'{metric_name}: {metric_value:.4f}')

  MODEL_D1_DIR.mkdir(exist_ok=True)

  section_print('Saving Model')
  model.save(MODEL_D1_FILE)
  print('model saved succesfully')

