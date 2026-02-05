import axios from "axios";

const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY || "test-key";
const DEEPL_API_URL = "https://api-free.deepl.com/v1/translate";

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
  timestamp: Date;
}

/**
 * Normaliza el texto para DeepL
 */
const normalizeTextForDeepL = (text: string): string => {
  const firstPart = text.split(",")[0].trim();
  return firstPart.replace(/[^a-zA-Z0-9\s]/g, "").trim();
};

/**
 * Traduce un texto usando la API de DeepL directamente
 */
export const translateText = async (
  text: string,
  targetLanguage: string = "ES",
): Promise<TranslationResult> => {
  try {
    console.log(`🌐 Iniciando traducción: "${text}" → ${targetLanguage}`);

    if (!DEEPL_API_KEY || DEEPL_API_KEY === "test-key") {
      console.warn(
        "⚠️ DeepL API Key no configurada. Usando traducción simulada.",
      );
      return simulateTranslation(text, targetLanguage);
    }

    console.log("⏳ Enviando solicitud a DeepL...");

    const normalizedText = normalizeTextForDeepL(text);
    console.log(`📝 Texto normalizado: "${normalizedText}"`);

    // ✅ CAMBIO: Llamada directa a DeepL API
    const params = new URLSearchParams();
    params.append("text", normalizedText);
    params.append("target_lang", targetLanguage);

    console.log(`📤 Parámetros enviados:`, {
      text: normalizedText,
      target_lang: targetLanguage,
    });

    const response = await axios.post(DEEPL_API_URL, params, {
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const translatedText = response.data.translations[0].text;
    const sourceLanguage =
      response.data.translations[0].detected_source_language;

    console.log(`✅ Traducción completada: "${translatedText}"`);

    return {
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Error de traducción:",
        error.response?.data || error.message,
      );
      console.log("⚠️ Usando traducción simulada...");
      return simulateTranslation(text, targetLanguage);
    }

    throw new Error("No se pudo traducir el texto");
  }
};

/**
 * Simula una traducción
 */
const simulateTranslation = async (
  text: string,
  targetLanguage: string,
): Promise<TranslationResult> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const translations: Record<string, Record<string, string>> = {
    ES: {
      "espresso maker": "cafetera express",
      coffeepot: "cafetera",
      "coffee mug": "taza de café",
      cup: "taza",
      plate: "plato",
      hamburger: "hamburguesa",
      cheeseburger: "hamburguesa con queso",
      "ice cream": "helado",
      "french fries": "papas fritas",
      pizza: "pizza",
      "pizza pie": "pizza",
      burrito: "burrito",
      taco: "taco",
      hotdog: "perro caliente",
      sandwich: "sándwich",
    },
    EN: {
      hamburger: "hamburger",
      cheeseburger: "cheeseburger",
      "ice cream": "ice cream",
      "french fries": "french fries",
      pizza: "pizza",
      burrito: "burrito",
      taco: "taco",
      hotdog: "hotdog",
      sandwich: "sandwich",
    },
    FR: {
      hamburger: "hamburger",
      cheeseburger: "hamburger au fromage",
      "ice cream": "glace",
      "french fries": "frites",
      pizza: "pizza",
      burrito: "burrito",
      taco: "taco",
      hotdog: "hot-dog",
      sandwich: "sandwich",
    },
    DE: {
      hamburger: "Hamburger",
      cheeseburger: "Cheeseburger",
      "ice cream": "Eis",
      "french fries": "Pommes frites",
      pizza: "Pizza",
      burrito: "Burrito",
      taco: "Taco",
      hotdog: "Hotdog",
      sandwich: "Sandwich",
    },
    IT: {
      hamburger: "hamburger",
      cheeseburger: "cheeseburger",
      "ice cream": "gelato",
      "french fries": "patatine fritte",
      pizza: "pizza",
      burrito: "burrito",
      taco: "taco",
      hotdog: "hotdog",
      sandwich: "sandwich",
    },
    PT: {
      hamburger: "hambúrguer",
      cheeseburger: "hambúrguer com queijo",
      "ice cream": "sorvete",
      "french fries": "batatas fritas",
      pizza: "pizza",
      burrito: "burrito",
      taco: "taco",
      hotdog: "cachorro-quente",
      sandwich: "sanduíche",
    },
    ZH: {
      hamburger: "汉堡包",
      cheeseburger: "芝士汉堡包",
      "ice cream": "冰淇淋",
      "french fries": "薯条",
      pizza: "披萨",
      burrito: "卷饼",
      taco: "塔可",
      hotdog: "热狗",
      sandwich: "三明治",
    },
    JA: {
      hamburger: "ハンバーガー",
      cheeseburger: "チーズバーガー",
      "ice cream": "アイスクリーム",
      "french fries": "フライドポテト",
      pizza: "ピザ",
      burrito: "ブリトー",
      taco: "タコス",
      hotdog: "ホットドッグ",
      sandwich: "サンドイッチ",
    },
  };

  const lowerText = text.toLowerCase();
  let translated = text;

  for (const [key, value] of Object.entries(
    translations[targetLanguage] || {},
  )) {
    if (lowerText.includes(key.toLowerCase())) {
      translated = value;
      break;
    }
  }

  if (translated === text) {
    translated = `[${text} en ${targetLanguage}]`;
  }

  console.log(`✅ Traducción simulada: "${text}" → "${translated}"`);

  return {
    originalText: text,
    translatedText: translated,
    sourceLanguage: "EN",
    targetLanguage,
    timestamp: new Date(),
  };
};
