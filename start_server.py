#!/usr/bin/env python3
import sys
import os

def start_static_server():
    from http.server import HTTPServer, SimpleHTTPRequestHandler
    import socketserver
    
    os.chdir('dist')
    PORT = 5173
    
    Handler = SimpleHTTPRequestHandler
    Handler.extensions_map.update({
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
    })
    
    with HTTPServer(('', PORT), Handler) as httpd:
        print(f"Static server running on http://localhost:{PORT}")
        print("Note: This is only the frontend. Backend API is not available.")
        print("Please run 'python app.py' in another terminal for full functionality.")
        httpd.serve_forever()

if __name__ == '__main__':
    start_static_server()
