import requests

try:
    response = requests.get('http://localhost:5000/api/activities')
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
except Exception as e:
    print(f"错误: {e}")