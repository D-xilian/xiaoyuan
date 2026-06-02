import sys
import os

os.environ['FLASK_APP'] = 'app.py'
os.environ['FLASK_DEBUG'] = '1'

sys.path.insert(0, os.path.dirname(__file__))

from app import app

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
