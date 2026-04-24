import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
import * as Asset from "expo-asset";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const CLASS_NAMES = ["ClassA-Drought", "ClassB-PestInfestation", "ClassC-Healthy"];
const THRESHOLD   = 0.80;
const IMG_SIZE    = 224;
const MEAN        = [0.485, 0.456, 0.406];
const STD         = [0.229, 0.224, 0.225];

let model      = null;
let modelReady = false;

export const loadModel = async () => {
  if (modelReady && model) return model;

  await tf.ready();

  const [asset] = await Asset.Asset.loadAsync(
    Asset.Asset.fromMetadata({
      name  : "rice_model",
      type  : "tflite",
      hash  : null,
      uri   : "rice_model.tflite",   
      width : null,
      height: null,
    })
  );

  const modelUri  = asset.localUri ?? asset.uri;
  const cacheUri  = `${FileSystem.cacheDirectory}rice_model.tflite`;

  const existing = await FileSystem.getInfoAsync(cacheUri);
  if (!existing.exists) {
    await FileSystem.copyAsync({ from: modelUri, to: cacheUri });
  }

  model = await tf.loadGraphModel(
    tf.io.fromMemory   
      ? `file://${cacheUri}`
      : cacheUri,
    { fromTFHub: false }
  );

  modelReady = true;
  console.log("✅ Offline model loaded");
  return model;
};

const preprocessImage = async (imageUri) => {
  const { base64 } = await manipulateAsync(
    imageUri,
    [{ resize: { width: IMG_SIZE, height: IMG_SIZE } }],
    { format: SaveFormat.JPEG, base64: true }
  );

  const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  return tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(
      { data: raw, width: IMG_SIZE, height: IMG_SIZE },
      3
    );
    const normalized = tf.sub(
      tf.div(imgTensor.toFloat(), tf.scalar(255)),
      tf.tensor1d(MEAN)
    ).div(tf.tensor1d(STD));

    return normalized.transpose([2, 0, 1]).expandDims(0); // [1,3,224,224]
  });
};

export const predictImage = async (imageUri) => {
  try {
    const net    = await loadModel();
    const tensor = await preprocessImage(imageUri);
    const output = net.predict(tensor);
    const probs  = tf.softmax(output);
    const data   = await probs.data();

    tensor.dispose();
    output.dispose();
    probs.dispose();

    const maxIdx      = [...data].indexOf(Math.max(...data));
    const confidence  = data[maxIdx];
    const predicted   = CLASS_NAMES[maxIdx];
    const isUncertain = confidence < THRESHOLD;
    const displayName = predicted
      .replace("ClassA-", "")
      .replace("ClassB-", "")
      .replace("ClassC-", "");

    const allProbabilities = Object.fromEntries(
      CLASS_NAMES.map((name, i) => [name, parseFloat((data[i] * 100).toFixed(2))])
    );

    return {
      success: true,
      data: {
        predicted_class   : predicted,
        display_name      : displayName,
        confidence        : parseFloat((confidence * 100).toFixed(2)),
        is_uncertain      : isUncertain,
        all_probabilities : allProbabilities,
        recommendation    : getRecommendation(displayName, isUncertain),
        mode              : "offline",
      },
    };
  } catch (err) {
    console.error("❌ Offline prediction error:", err);
    return { success: false, error: err.message };
  }
};

const getRecommendation = (className, isUncertain) => {
  if (isUncertain)
    return "Low confidence — recommend manual inspection by agronomist";

  const map = {
    Drought:
      "Rice plant shows drought stress. Increase irrigation frequency, " +
      "check soil moisture levels, consider mulching.",
    PestInfestation:
      "Rice plant shows pest infestation signs. Inspect leaves for insects, " +
      "apply appropriate pesticide, monitor surrounding plants.",
    Healthy:
      "Rice plant appears healthy. Continue regular monitoring and maintenance.",
  };
  return map[className] ?? "No recommendation available";
};