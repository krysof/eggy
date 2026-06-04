#!/usr/bin/env python3
"""Simple HTTP server for Egg Party Rush — binds 0.0.0.0 for LAN access."""
import http.server
import socket
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

PORT = int(os.environ.get('PORT', '8080'))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
})

with http.server.ThreadingHTTPServer(('0.0.0.0', PORT), handler) as httpd:
    # Get local IP for easy phone access
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
    except Exception:
        local_ip = '127.0.0.1'
    finally:
        s.close()

    print('\n  🥚 DANBO World 服务器已启动!')
    print('  ────────────────────────────')
    print(f'  本机访问:  http://localhost:{PORT}')
    print(f'  手机/iPad: http://{local_ip}:{PORT}')
    print('  ────────────────────────────')
    print('  按 Ctrl+C 停止服务器\n')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n  服务器已停止 👋')
