'use client';

import React from "react";
import SearchBar from "@/components/searchBar";
import { Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from "react";

interface PerfilUsuario {
    nome: string;
    dataNascimento: string;
    email: string;
    telefone: string;
    cidade: string;
    estado: string;
    sobre: string;
}
export default function TelaConfiguracoes() {
    const [isMounted, setIsMounted] = useState<;boolean>(false);

    const [profile, setProfile] = useState({
         const [profile, setProfile] = useState(false);
    nome: 'Carlos Silva Dos Santos'
    dataNascimento: '18/02/1995'
    email: 'carlossilva@gmail.com'
    telefone: '(87) 98761-7645'
    cidade: 'Garanhuns'
    estado: 'PE'
    sobre: 'Sou encanador profissional com mais de 8 anos de experiência em instalações hidráulicas, reparos e manutenção geral. Trabalho com qualidade, pontualidade e transparência, sempre buscando a melhor solução para meus clientes. '
    });
}