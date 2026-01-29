import React from "react";
import "./Loading.css";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Cargando..." }) => {
  console.log("⏳ Mostrando loading:", message);

  return (
    <div className="loadingOverlay">
      <div className="loadingContent">
        <div className="spinner"></div>
        <p className="loadingMessage">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
