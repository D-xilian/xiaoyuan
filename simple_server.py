#!/usr/bin/env python3
import sys
import os
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

def main():
    PORT = 8080
    os.chdir('dist')
    
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
    
    try:
        httpd = HTTPServer(('0.0.0.0', PORT), Handler)
        print(f"Server running on http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()
    except socket.error as e:
        print(f"Socket error: {e}")
        print(f"Try another port. Current port {PORT} may be in use.")

if __name__ == '__main__':
    main()
