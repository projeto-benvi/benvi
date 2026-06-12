import { useAuthContext } from "@/app/context/AuthContext";

export const useAuth = () => {
  return useAuthContext();
};