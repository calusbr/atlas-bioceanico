#!/bin/sh
# @file: scripts/servir.sh
# @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
# @data_criacao: 2026-10-26
# @versao: 0.3.0
# @descricao: Abre o site localmente (só precisa do Python 3, que já vem no macOS/Linux). O site é
#             estático: o mesmo conteúdo roda aqui e no GitHub Pages.
#             Uso: sh scripts/servir.sh [porta]   →   http://localhost:8000/
exec python3 "$(dirname "$0")/servir.py" "${1:-8000}"
