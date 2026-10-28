"""
@file: scripts/servir.py
@autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
@data_criacao: 2026-10-26
@versao: 0.3.0
@descricao: Servidor local do site (só biblioteca padrão do Python 3). Igual ao `python3 -m http.server`,
            mas com "Cache-Control: no-cache" — o navegador sempre pega a versão nova de CSS/JS
            enquanto você edita — e tipos corretos para .js/.json. Uso: python3 scripts/servir.py [porta]
"""
import functools
import http.server
import pathlib
import sys


class Manipulador(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, formato, *args):        # silencioso, exceto erros
        if args and str(args[1])[0] in "45":
            super().log_message(formato, *args)


if __name__ == "__main__":
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    raiz = pathlib.Path(__file__).resolve().parents[1]
    print(f"Atlas Bioceânico em http://localhost:{porta}/  (Ctrl+C para parar)")
    http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(Manipulador, directory=str(raiz))).serve_forever()
