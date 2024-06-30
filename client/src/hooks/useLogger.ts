import { createContext, useContext } from "react";
import { IClientLogger } from "@shared/types";

export const loggerContext = createContext<IClientLogger | null>(null);

export const useLogger = (): IClientLogger => {
  const context = useContext(loggerContext);
  if (!context) throw new Error("useLogger must be wrapper in a provider");
  return context;
};
