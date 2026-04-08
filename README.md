## Rice Plant Stress Detector (React Native / Expo)

**Purpose**: Simple React Native app for a Machine Learning subject, demonstrating image-based classification of rice plant stress.

### Features (ML-focused)

- **Plant Image Upload / Camera Scan**: Capture a new photo or choose one from the gallery using `expo-image-picker`.
- **Stress Detection**: Classifies the plant as **Healthy**, **Drought Stress**, or **Pest Damage**.
- **Confidence Score**: Shows a percentage confidence for the predicted label.
- **Stress Information**: Displays a short explanation for the detected stress type.
- **Scan History**: Keeps a list of scans (for the current app session) with label, confidence, timestamp, and thumbnail.

> The "model" is a simple deterministic JavaScript function that maps the image URI to one of the three classes with a confidence score. This keeps the focus on the ML pipeline idea (input → model → prediction → explanation → history) without needing a heavy on-device model.

### How to run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Install Expo CLI (if you don't have it)**

   ```bash
   npm install -g expo-cli
   ```

3. **Start the app**

   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Open on device**

- Use the Expo Go app on your Android/iOS device and scan the QR code from the terminal or browser.

### Notes for your presentation

- **Input**: Rice plant image from camera or gallery.
- **Preprocessing**: (Conceptually) resized/compressed image; here handled implicitly by `expo-image-picker`.
- **Model**: `mockAnalyzeImage(uri)` in `App.js` — you can easily replace this with a real TensorFlow.js / ONNX / API model later.
- **Output**:
  - Predicted stress label.
  - Confidence score.
  - Explanation text.
  - Stored in an in-memory history list.

If you want persistent history across app restarts, you can extend the app using `@react-native-async-storage/async-storage` to save and load the history array.

