import React, { useState, useEffect, useRef } from "react";
import {
  classifyImage,
  getCensoredWordsList,
  isCensorshipError,
  type ClassificationResult,
} from "../../services/classificationService";
import {
  translateText,
  type TranslationResult,
} from "../../services/translationService";
import Loading from "../Loading";
import "./ImageClassifier.css";

const ImageClassifier: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [classification, setClassification] =
    useState<ClassificationResult | null>(null);
  const [translation, setTranslation] = useState<TranslationResult | null>(
    null,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ES");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // URLs de ejemplo
  const exampleImages = [
    {
      url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop",
      name: "Hamburguesa",
    },
    {
      url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
      name: "Papas Fritas",
    },
    {
      url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop",
      name: "Helado",
    },
    {
      url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
      name: "Pizza",
    },
  ];

  // Capturar logs de consola
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.join(" ");
      if (
        !message.includes("Mostrando loading") &&
        !message.includes("Obteniendo pedidos") &&
        !message.includes("Se obtuvieron")
      ) {
        addLog("📝", args);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      addLog("❌", args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog("⚠️", args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Auto-scroll de logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (icon: string, args: unknown[]) => {
    const message = args
      .map((arg) =>
        typeof arg === "string" ? arg : JSON.stringify(arg, null, 2),
      )
      .join(" ");
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${icon} ${message}`]);
  };

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      setError("Por favor ingresa una URL de imagen");
      return;
    }

    setLoading(true);
    setLoadingMessage("Cargando modelo de clasificación...");
    setError("");
    setClassification(null);
    setTranslation(null);
    setLogs([]);

    console.log("🚀 Iniciando proceso de clasificación...");

    try {
      // Paso 1: Clasificar imagen
      setLoadingMessage("Cargando modelo de clasificación...");
      const result = await classifyImage(imageUrl);
      setClassification(result);

      // Paso 2: Traducir resultado
      setLoadingMessage("Traduciendo resultado...");
      const translatedResult = await translateText(
        result.label,
        selectedLanguage,
      );
      setTranslation(translatedResult);

      console.log("🎉 Proceso completado exitosamente");
    } catch (err) {
      if (isCensorshipError(err)) {
        const errorMsg = `🚫 Contenido censurado: "${err.censoredWord}"`;
        console.error(errorMsg);
        setError(errorMsg);
        throw err;
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        console.error("Error:", errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleExampleClick = (url: string) => {
    setImageUrl(url);
    setError("");
  };

  const clearLogs = () => {
    setLogs([]);
    console.log("🧹 Logs limpiados");
  };

  const censoredWords = getCensoredWordsList();

  /**
   * 🌐 NUEVO: Traducir cuando cambia el selector de idioma
   */
  const handleLanguageChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);

    // Si hay clasificación previa, traducir inmediatamente
    if (classification) {
      console.log(`🔄 Cambiando idioma a: ${newLanguage}`);
      setLoading(true);
      setLoadingMessage(`Traduciendo a ${newLanguage}...`);

      try {
        const result = await translateText(classification.label, newLanguage);
        setTranslation(result);
        console.log(`✅ Traducción cambiada: ${result.translatedText}`);
        setError("");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error desconocido";
        console.error("❌ Error al traducir:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
        setLoadingMessage("");
      }
    }
  };

  return (
    <div className="image-classifier-container">
      <h2 className="classifierTitle">🖼️ Clasificador de Imágenes con IA</h2>

      {/* Palabras censuradas */}
      <div className="censoredWordsBox">
        <h4>🚫 Palabras Censuradas:</h4>
        <p className="censoredWordsList">{censoredWords.join(", ")}</p>
        <p className="censoredWordsNote">
          ℹ️ Si se detecta alguna de estas palabras, se lanzará un error
        </p>
      </div>

      {/* Imágenes de ejemplo */}
      <div className="examplesSection">
        <h4>📸 Imágenes de Ejemplo:</h4>
        <div className="exampleImages">
          {exampleImages.map((img, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(img.url)}
              className="exampleImageBtn"
              type="button"
            >
              <img src={img.url} alt={img.name} />
              <span>{img.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleClassify} className="classifierForm">
        <div className="formGroupClassifier">
          <label htmlFor="imageUrl">URL de Imagen:</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            disabled={loading}
            required
          />
        </div>

        <div className="formGroupClassifier">
          <label htmlFor="language">Idioma de Traducción:</label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={loading}
          >
            <option value="ES">🇪🇸 Español</option>
            <option value="EN">🇬🇧 Inglés</option>
            <option value="FR">🇫🇷 Francés</option>
            <option value="DE">🇩🇪 Alemán</option>
            <option value="IT">🇮🇹 Italiano</option>
            <option value="PT">🇵🇹 Portugués</option>
            <option value="ZH">🇨🇳 Chino</option>
            <option value="JA">🇯🇵 Japonés</option>
          </select>
        </div>

        <button type="submit" className="btnClassify" disabled={loading}>
          {loading ? "🔄 Clasificando..." : "🔍 Clasificar Imagen"}
        </button>
      </form>

      {/* Loading */}
      {loading && <Loading message={loadingMessage || "Procesando..."} />}

      {/* Error */}
      {error && (
        <div className="errorBox">
          <p className="errorMessage">{error}</p>
        </div>
      )}

      {/* Resultado */}
      {classification && !error && (
        <div className="resultBox">
          <h3>✅ Resultado de Clasificación</h3>
          <div className="resultContent">
            {classification.imageUrl && (
              <div className="imagePreview">
                <img
                  src={classification.imageUrl}
                  alt="Imagen clasificada"
                  className="classifiedImage"
                />
              </div>
            )}
            <div className="resultData">
              <div className="resultItem">
                <strong>🏷️ Etiqueta Original:</strong>
                <p>{classification.label}</p>
              </div>
              <div className="resultItem">
                <strong>📊 Confianza:</strong>
                <p>{(classification.confidence * 100).toFixed(2)}%</p>
              </div>
              {translation && (
                <>
                  <div className="resultItem">
                    <strong>🌐 Etiqueta Traducida ({selectedLanguage}):</strong>
                    <p>{translation.translatedText}</p>
                  </div>
                  <div className="resultItem">
                    <strong>🕐 Timestamp:</strong>
                    <p>{new Date(classification.timestamp).toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="logsContainer">
        <div className="logsHeader">
          <h4>📋 Logs de Ejecución:</h4>
          <button onClick={clearLogs} className="btnClearLogs" type="button">
            🧹 Limpiar
          </button>
        </div>
        <div className="logsList">
          {logs.length === 0 ? (
            <p className="noLogs">No hay logs todavía</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="logEntry">
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ImageClassifier;
