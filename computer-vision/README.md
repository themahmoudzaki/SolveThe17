### If you downloaded this project from github just know this contains the code only as the model and training data where to large
* Download complete project from [googledrive](https://drive.google.com/file/d/1Id1IXnfMjbzzjMQnKqBWhGop8HlnL6pX/view?usp=sharing)

```markdown
# Bee Image Classification Project

This project focuses on classifying images as containing bees versus non-bees (including bee mimics) using a Convolutional Neural Network (CNN) built with TensorFlow/Keras. It includes scripts for loading and preprocessing image data, training a model (D1), and an API for real-time video frame classification using the trained D1 model.

## Project Structure

computer-vision/
├── Data/
│   ├── dataset_1/ # Data for the D1 model
│   │   ├── bee/              # Images of bees
│   │   ├── non_bee/          # Images of non-bees
│   │   └── mimics/           # Images of bee mimics
├── model/
│   ├── D1.h5                 # Saved TensorFlow model from model_D1.py
├── utils.py                # Utility functions, constants, and imports
├── preprocess_D1.py        # Image preprocessing (scaling) for D1 model
├── image_loader_D1.py      # Image loading and labeling for D1 model
├── model_D1.py             # CNN model definition, training, and saving for D1
├── main.py                 # Main script to run D1 preprocessing and model training
├── api.py                  # FastAPI with webSocket application
├── environment.yml         # Creates the enviroment for this project using yml
└── README.md               # This file
```

## Prerequisites
*   Python 3.10.x (as specified: 3.10.16)
*   CUDA (as specified: 11.2 )
*   CuDNN ( as specified: 8.1.* )
*   TensorFlow (as specified: 2.10 or compatible newer version with appropriate CUDA/cuDNN)
*   NumPy (as specified: 1.23.5 or compatible)
*   Pandas
*   Scikit-learn
*   Matplotlib
*   FastAPI
*   Uvicorn
*   OpenCV-Python (`cv2`) (for the API)
*   pyyaml
*   h5py
*   httpx
*   protobuf==3.20.3
*   google-generativeai
*   tensorflow-addons

## Installation

### Conda Environment Setup
1. Install Anaconda.
2. Create the environment using:
   ```bash
   conda env create -f environment.yml
   conda activate jager-ads
   ```

### Or PIP
You can typically install these using pip:
```bash
pip install tensorflow==2.10.0 numpy==1.23.5 pandas scikit-learn matplotlib fastapi uvicorn "opencv-python" pyyaml h5py tqdm httpx protobuf==3.20.3 "google-generativeai" tensorflow-addons
```

## File Descriptions

### `utils.py`
*   **Purpose**: Contains shared constants, configurations, and utility functions used across the project.
*   **Key Contents**:
    *   Imports common libraries: `os`, `pandas`, `numpy`, `matplotlib.pyplot`, `tensorflow`, `math`, `pathlib`, `sklearn.model_selection`, `sklearn.metrics`, `concurrent.futures.ThreadPoolExecutor`, `tqdm`, `fastapi`, `uvicorn`, `cv2`.
    *   Defines base directory paths (`BASE_DIR`).
    *   **Dataset 1 (D1) Paths & Constants**:
        *   `DATASET_1`: Root directory for D1 (`Data/dataset_1`).
        *   `BEE_DIR`: Directory for bee images in D1 (`Data/dataset_1/bee`).
        *   `NON_BEE_DIR`: Directory for non-bee images in D1 (`Data/dataset_1/non_bee`).
        *   `MIMICS_DIR`: Directory for bee mimic images in D1 (`Data/dataset_1/mimics`).
        *   `MODEL_D1_DIR`: Directory to save the D1 model (`model/`).
        *   `MODEL_D1_FILE`: Specific path for the saved D1 model (`model/D1.h5`).
        *   `IMAGE_SIZE = (224, 224)`: Target image dimensions for model input.
        *   `EPOCHS`: Default number of training epochs.
        *   `BATCH_SIZE`: Default batch size for training and loading.
    *   GPU availability check (`GPU_S`) and TensorFlow logging suppression (`os.environ['TF_CPP_MIN_LOG_LEVEL']`).
    *   `section_print()`: A helper function for formatted console output.

### `main.py`
*   **Purpose**: The main entry point of the application for training the D1 model.
*   **Workflow**:
    1.  `setup_env()`:
        *   Prints TensorFlow and NumPy versions.
        *   Checks for and prints the number of available GPUs.
        *   Sets memory growth for available GPUs to prevent TensorFlow from allocating all GPU memory at once.
        *   Configures TensorFlow inter-op and intra-op parallelism threads based on CPU count.
    2.  Calls `loading_handler_D1()` from `image_loader_D1.py` to load and preprocess image data for Dataset 1.
    3.  Calls `model_D1()` from `model_D1.py` to define, train, and save the D1 model using the loaded data.
    4.  Prints success messages.

### `preprocess_D1.py`
*   **Purpose**: Contains image preprocessing functions for the D1 model.
*   **`preprocess_img(img_array)`**:
    *   Takes a NumPy array representing an image.
    *   Casts the image array to `tf.float32`.
    *   Scales pixel values to the [0.0, 1.0] range by dividing by 255.0.
    *   Returns the scaled image array.

### `image_loader_D1.py`
*   **Purpose**: Loads and labels image data from Dataset 1 directories for the D1 model.
*   **Key Constants**:
    *   `BEE_LABEL = 0`
    *   `NON_BEE_LABEL = 1`
*   **`load_image(img_path)`**:
    *   Loads an image from `img_path` using `tf.keras.preprocessing.image.load_img()`, resizing it to `IMAGE_SIZE`.
    *   Converts the image to a NumPy array using `tf.keras.preprocessing.image.img_to_array()`.
    *   Calls `preprocess_img()` (from `preprocess_D1.py`) to scale the image array.
    *   Returns the preprocessed image array or `None` if an error occurs.
*   **`load_data_batch(img_paths, label_value)`**:
    *   Takes a list of image paths and a corresponding label.
    *   Uses `concurrent.futures.ThreadPoolExecutor` to load images in parallel by calling `load_image` for each path.
    *   Collects successfully loaded images and their labels.
    *   Returns a batch of image data and a batch of labels.
*   **`load_dataset(img_dirs_and_labels)`**:
    *   Takes a list of tuples, where each tuple contains a directory path and its corresponding label.
    *   Iterates through each directory:
        *   Globally finds all image files (`*.*`).
        *   Counts images for statistics.
        *   Processes images in batches of `BATCH_SIZE` using `load_data_batch` and `tqdm` for progress indication.
        *   Aggregates data and labels from all batches.
    *   Prints dataset statistics (total images, bee images, non-bee images).
    *   Returns the complete image data and labels as NumPy arrays.
*   **`loading_handler_D1()`**:
    *   Defines the specific directories and their associated labels for Dataset 1 (`BEE_DIR`, `NON_BEE_DIR`, `MIMICS_DIR`).
    *   Calls `load_dataset()` to load the data and returns the results.

### `model_D1.py`
*   **Purpose**: Defines, trains, evaluates, and saves the CNN model (D1) for bee classification.
*   **`model_D1(X, y, test_size, random_state)`**:
    1.  Calls `cnn_model_D1()` to get the compiled model architecture.
    2.  Calls `train_model()` to train and evaluate the model using the provided data `X` and `y`.
*   **`cnn_model_D1()`**:
    1.  Sets up mixed precision training (`mixed_float16`) if GPUs are available, to potentially speed up training and reduce memory usage.
    2.  Defines a `tf.keras.Sequential` model named "Bee\_Classifier" with layers:
        *   `tf.keras.layers.InputLayer`: Specifies the input shape `(*IMAGE_SIZE, 3)`.
        *   Data Augmentation: `RandomFlip('horizontal')`, `RandomRotation(0.2)`, `RandomZoom(0.2)`.
        *   **Convolutional Blocks (repeated 4 times with increasing filters)**:
            *   `Conv2D` (filters: 32, 64, 128, 256; kernel size: (3,3); padding: 'same'; `activation=None`).
            *   `BatchNormalization()`: To stabilize and speed up training.
            *   `Activation('relu')`.
            *   `MaxPooling2D((2,2))`: To downsample feature maps.
        *   `Flatten`: To convert 2D feature maps to a 1D vector.
        *   **Fully Connected Block**:
            *   `Dense(256, activation=None)`.
            *   `BatchNormalization()`.
            *   `Activation('relu')`.
            *   `Dropout(0.5)`: For regularization to prevent overfitting.
        *   `Dense(1, activation='sigmoid')`: Output layer for binary classification.
    3.  Defines an `ExponentialDecay` learning rate schedule.
    4.  Compiles the model with:
        *   Optimizer: `tf.keras.optimizers.Adam` using the learning rate schedule.
        *   Loss: `binary_crossentropy` (suitable for binary classification).
        *   Metrics: `accuracy`, `tf.keras.metrics.Precision(name='precision')`, `tf.keras.metrics.Recall(name='recall')`, `tf.keras.metrics.AUC(name='auc')`.
    5.  Prints the model summary.
    6.  Returns the compiled model.
*   **`train_model(model, X, y, test_size, random_state)`**:
    1.  Splits the data (`X`, `y`) into training and testing sets using `train_test_split` with stratification (`stratify=y`) to maintain class proportions.
    2.  Trains the model using `model.fit()`:
        *   Training data: `X_train`, `y_train`.
        *   Validation data: `X_test`, `y_test`.
        *   Epochs: `EPOCHS`.
        *   Batch size: `BATCH_SIZE`.
        *   Callbacks: `tf.keras.callbacks.EarlyStopping` (patience=5, `restore_best_weights=True`) to stop training if validation performance doesn't improve and keep the best model.
    3.  Evaluates the model on the test set (`model.evaluate()`) and prints the evaluation results for each metric.
    4.  Creates the model saving directory (`MODEL_D1_DIR`) if it doesn't exist.
    5.  Saves the trained model to `MODEL_D1_FILE` using `model.save()`.

### `api.py`
*   **Purpose**: Implements a FastAPI application to serve the bee classification model (D1) over a WebSocket for real-time video frame analysis.
*   **Key Components**:
    *   `FastAPI` app initialization with title, description, and version.
    *   Global `model` variable, initialized to `None`.
    *   **`get_global_model()`**:
        *   Loads the TensorFlow model specified by `MODEL_D1_FILE` (which is `model/D1.h5`).
        *   Prints success or error messages related to model loading.
        *   Returns the loaded model or `None`.
    *   **`preprocess_frame_for_api(frame_bgr)`**:
        *   Resizes the input frame to `IMAGE_SIZE`.
        *   Converts the frame from BGR to RGB.
        *   Calls `preprocess_img` (from `preprocess_D1.py`) for scaling.
        *   Returns the processed frame as a NumPy array or `None` on error.
    *   **`@app.on_event("startup")`**:
        *   Event handler that loads the global model using `get_global_model()` when the API starts.
    *   **`@app.websocket("/ws/video")`**:
        *   Defines a WebSocket endpoint.
        *   Accepts WebSocket connections.
        *   Checks if the model is loaded; sends an error and closes if not.
        *   Enters a loop to continuously receive byte data (video frames).
        *   Decodes the byte data into an image frame using `cv2.imdecode()`.
        *   Preprocesses the frame using `preprocess_frame_for_api`.
        *   Collects frames into a batch (`frame_batch`) of size `API_BATCH_SIZE` (defined as 8).
        *   Once a batch is ready:
            *   Converts the batch to a NumPy array.
            *   Uses `model.predict()` to get predictions for the batch.
            *   Processes prediction scores to determine "Bee" or "Non-Bee" labels and confidence.
            *   Sends a JSON response to the WebSocket client with predictions for the batch.
            *   Clears the frame batch.
        *   Handles `WebSocketDisconnect` and other exceptions gracefully.
    *   **`@app.get("/health")`**:
        *   A simple HTTP GET endpoint to check if the API is running and if the model is loaded. Returns `{"status": "ok", "model_loaded": model is not None}`.
    *   `if __name__ == "__main__": uvicorn.run(app, host="0.0.0.0", port=3000)`: Starts the FastAPI application using Uvicorn ASGI server, making it accessible on all network interfaces on port 3000.


## How to Run

### 1. Training the D1 Model:
  This step only needs to be done if the model is not already trained and saved (e.g., `model/D1.h5` does not exist or you want to retrain).
  Ensure your `Data/dataset_1` directory is populated with `bee`, `non_bee`, and `mimics` subdirectories containing images.
  ```bash
   python main.py
  ```   This will:
   *   Load and preprocess images from `Data/dataset_1`.
   *   Define and compile the D1 CNN model.
   *   Train the model, evaluate it, and print metrics.
   *   Save the trained model to `model/D1.h5`.

### 2. Running the API:
   Ensure the model `model/D1.h5` exists (either pre-trained or trained in step 1).
   ```bash
   python api.py
   ```
   The API will start, and you can connect to the WebSocket endpoint `/ws/video` to send video frames for classification. You can also check the health at `http://localhost:3000/health`.
```
