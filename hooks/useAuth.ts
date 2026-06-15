import { useContext } from "react";
import { AuthContext } from "../app/context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};