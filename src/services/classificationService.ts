import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

// Lista de palabras censuradas
export const CENSORED_WORDS = [
  "cafe",
  "coffee",
  "coffeepot",
  "espresso",
  "prohibido",
  "spam",
  "inapropiado",
  "ofensivo",
  "strainer",
];

export interface ClassificationResult {
  label: string;
  confidence: number;
  timestamp: Date;
  imageUrl?: string;
}

export interface CensorshipErrorData {
  message: string;
  censoredWord: string;
  name: string;
}

let model: mobilenet.MobileNet | null = null;

/**
 * Carga el modelo de TensorFlow
 */
export const loadModel = async (): Promise<void> => {
  if (!model) {
    console.log("⏳ Cargando modelo MobileNet...");
    model = await mobilenet.load();
    console.log("✅ Modelo cargado correctamente");
  }
};

/**
 * Clasifica una imagen usando MobileNet
 */
export const classifyImage = async (
  imageUrl: string,
): Promise<ClassificationResult> => {
  try {
    console.log(`🖼️ Iniciando clasificación de imagen: ${imageUrl}`);

    // Inicializar backend de TensorFlow
    await tf.setBackend("webgl");
    await tf.ready();
    console.log(`✅ TensorFlow backend inicializado: ${tf.getBackend()}`);

    // Cargar el modelo
    console.log("⏳ Cargando modelo MobileNet...");
    const model = await mobilenet.load();
    console.log("✅ Modelo MobileNet cargado");

    console.log("🔍 Procesando imagen...");

    // Crear elemento de imagen
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Esperar a que la imagen se cargue
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = imageUrl;
    });

    console.log("📊 Clasificando...");

    // Clasificar imagen
    const predictions = await model.classify(img);

    if (predictions.length === 0) {
      throw new Error("No se pudo clasificar la imagen");
    }

    const topPrediction = predictions[0];

    console.log("✅ Clasificación completada:", topPrediction);

    // Verificar palabras censuradas
    checkCensoredWords(topPrediction.className);

    return {
      label: topPrediction.className,
      confidence: topPrediction.probability,
      timestamp: new Date(),
      imageUrl,
    };
  } catch (error) {
    if (isCensorshipError(error)) {
      console.error("🚫 Palabra censurada detectada:", error.censoredWord);
      throw error;
    }
    console.error("❌ Error en clasificación:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudo clasificar la imagen",
    );
  }
};

/**
 * Verifica si la etiqueta contiene palabras censuradas
 */
export const checkCensoredWords = (label: string): void => {
  const lowerLabel = label.toLowerCase();

  for (const word of CENSORED_WORDS) {
    if (lowerLabel.includes(word.toLowerCase())) {
      const error = new Error(
        `⚠️ La palabra "${word}" no está permitida en clasificaciones`,
      ) as Error & CensorshipErrorData;
      error.name = "CensorshipError";
      error.censoredWord = word;
      throw error;
    }
  }
};

/**
 * Type guard para verificar si es un error de censura
 */
export const isCensorshipError = (
  error: unknown,
): error is Error & CensorshipErrorData => {
  return (
    error instanceof Error &&
    error.name === "CensorshipError" &&
    "censoredWord" in error
  );
};

/**
 * Obtiene la lista de palabras censuradas
 */
export const getCensoredWordsList = (): string[] => {
  return CENSORED_WORDS;
};
