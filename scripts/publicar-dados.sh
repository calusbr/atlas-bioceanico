#!/bin/sh
# @file: scripts/publicar-dados.sh
# @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
# @data_criacao: 2026-10-25
# @ultima_modificacao: 2026-10-26
# @versao: 0.3.0
# @descricao: Atualiza a pasta dados/ deste repositório com a exportação v3 da PARTE 1 (projeto_rota).
#             O site lê dados/ direto (GitHub Pages, sem build). Duas formas:
#               sh scripts/publicar-dados.sh                       # roda consolidar + exportar-v3 (servidor)
#               sh scripts/publicar-dados.sh --copiar <pasta_v3>   # só copia uma exportação já feita
#             Depois: git add dados && git commit -m "dados AAAA-MM-DD" && git push
#             Variável PROJETO_ROTA = pasta V2/CODE do projeto_rota (padrão: ../projeto_rota/V2/CODE).
set -eu
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
CODE="${PROJETO_ROTA:-$RAIZ/../projeto_rota/V2/CODE}"

if [ "${1:-}" = "--copiar" ]; then
  ORIGEM="${2:?informe a pasta da exportação v3}"
  [ -f "$ORIGEM/manifest.json" ] || { echo "manifest.json não encontrado em $ORIGEM"; exit 1; }
  rm -rf "$RAIZ/dados"
  mkdir -p "$RAIZ/dados"
  cp -R "$ORIGEM"/. "$RAIZ/dados"/
else
  [ -f "$CODE/rota.py" ] || { echo "rota.py não encontrado em $CODE (defina PROJETO_ROTA)"; exit 1; }
  ( cd "$CODE" && python3 rota.py consolidar && python3 rota.py exportar-v3 --destino "$RAIZ/dados" )
fi
echo "dados/ atualizado: $(du -sh "$RAIZ/dados" | cut -f1)"
python3 -c "import json;m=json.load(open('$RAIZ/dados/manifest.json'));print('contrato',m['contrato'],'·',m['gerado_em'],'·',m['contagens'])"
echo "Para publicar: cd $RAIZ && git add dados && git commit -m \"dados $(date +%F)\" && git push"
