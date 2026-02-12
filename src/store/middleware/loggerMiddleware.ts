import type { Middleware } from "@reduxjs/toolkit";

// Middleware de logging personalizado
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  const prevState = store.getState();

  // Type assertion para acceder a action.type
  const typedAction = action as { type: string };

  console.group(`🔄 Action: ${typedAction.type}`);
  console.log("📤 Action:", action);
  console.log("📊 Estado anterior:", prevState);

  const result = next(action);

  const nextState = store.getState();
  console.log("📊 Estado nuevo:", nextState);
  console.groupEnd();

  return result;
};
