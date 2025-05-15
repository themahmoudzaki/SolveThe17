from utils import *


def model_D1(X, y, test_size=0.2, random_state=42):
    """
    Orchestrates the creation, training, and saving of the D1 CNN model.

    Args:
        X (np.ndarray): The input image data (features).
        y (np.ndarray): The corresponding labels.
        test_size (float, optional): The proportion of the dataset to include in the test split. Defaults to 0.2.
        random_state (int, optional): Controls the shuffling applied to the data before applying the split.
                                      Pass an int for reproducible output across multiple function calls. Defaults to 42.
    """
    model = cnn_model_D1()
    train_model(model, X, y, test_size, random_state)


def cnn_model_D1():
    """
    Defines and compiles the Convolutional Neural Network (CNN) model architecture
    for bee classification on Dataset D1.

    The model includes data augmentation layers, convolutional layers, batch normalization,
    max pooling, dropout, and dense layers. It uses a sigmoid activation for binary classification.

    Returns:
        tf.keras.Model: The compiled Keras CNN model.
    """
    section_print("Creating D1 CNN Model Architecture")

    # Attempt to use mixed precision training if GPUs are available for potential speedup and memory saving
    if len(GPU_S) > 0:
        try:
            policy = tf.keras.mixed_precision.Policy("mixed_float16")
            tf.keras.mixed_precision.set_global_policy(policy)
            print("Using mixed precision training")
        except:
            print("Mixed precision training not available, using default precision")

    model = tf.keras.Sequential(
        [
            tf.keras.layers.InputLayer(input_shape=(*IMAGE_SIZE, 3)),
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.2),
            tf.keras.layers.RandomZoom(0.2),
            tf.keras.layers.Conv2D(32, (3, 3), padding="same", activation=None),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation("relu"),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), padding="same", activation=None),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation("relu"),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(128, (3, 3), padding="same", activation=None),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation("relu"),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(256, (3, 3), padding="same", activation=None),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation("relu"),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(256, activation=None),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Activation("relu"),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(1, activation="sigmoid"),
        ],
        name="Bee_Classifier",
    )

    lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
        initial_learning_rate=1e-3, decay_steps=1000, decay_rate=0.9
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr_schedule),
        loss="binary_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
            tf.keras.metrics.AUC(name="auc"),
            tfa.metrics.F1Score(
                num_classes=1, threshold=0.5, average="micro", name="f1_score"
            ),
        ],
    )

    model.summary()

    return model


def train_model(model, X, y, test_size, random_state):
    """
    Trains the provided Keras model on the given data.

    Splits the data into training and testing sets, fits the model,
    evaluates it on the test set, and saves the trained model.

    Args:
        model (tf.keras.Model): The Keras model to be trained.
        X (np.ndarray): The input image data (features).
        y (np.ndarray): The corresponding labels.
        test_size (float): The proportion of the dataset to include in the test split.
        random_state (int): Seed for random number generation for reproducible splits.
    """
    section_print("Training D1 CNN Model")
    # Split data into training and testing sets
    # stratify=y ensures that both training and test sets have proportional class distribution
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[
            # EarlyStopping callback to stop training if the validation loss doesn't improve
            # for a certain number of epochs (patience).
            # restore_best_weights=True ensures that the model weights from the epoch
            # with the best validation loss are restored at the end of training.
            tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
        ],
    )
    MODEL_D1_DIR.mkdir(exist_ok=True)

    section_print("Model Metrics")
    evaluation_results = model.evaluate(X_test, y_test, verbose=0)
    for metric_name, metric_value in zip(model.metrics_names, evaluation_results):
        print(f"{metric_name}: {metric_value:.4f}")

    section_print("Saving Model")
    model.save(MODEL_D1_FILE)
    print("model saved succesfully")
