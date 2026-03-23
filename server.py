#!/usr/bin/env python3
"""Simple HTTP server for Egg Party Rush — binds 0.0.0.0 for LAN access."""
import http.server
import socket
import os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
})

with http.server.HTTPServer(('0.0.0.0', PORT), handler) as httpd:
    # Get local IP for easy phone access
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
    except Exception:
        local_ip = '127.0.0.1'
    finally:
        s.close()

    print(f'\n  🥚 蛋仔冲冲冲 服务器已启动!')
    print(f'  ────────────────────────────')
    print(f'  本机访问:  http://localhost:{PORT}')
    print(f'  手机/iPad: http://{local_ip}:{PORT}')
    print(f'  ────────────────────────────')
    print(f'  按 Ctrl+C 停止服务器\n')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n  服务器已停止 👋')
