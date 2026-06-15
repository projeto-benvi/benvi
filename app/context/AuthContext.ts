'use client';

import { createContext } from "react";

export const AuthContext = createContext<any>({
  user: {
    nome: "João Henrique",
    avatar: ""
  }
});