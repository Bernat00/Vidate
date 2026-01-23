import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter, Body, Response
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError

from backend.routes import get_and_auth_current_user


router = APIRouter(prefix='/test')


@router.get('/')
async def test(current_user: get_and_auth_current_user):
    return 'success'

@router.get('/ws', response_class=HTMLResponse)
async def ws():
    html = """<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WebSocket Test</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 50px auto;
                }
                input {
                    width: 80%;
                    padding: 10px;
                    font-size: 16px;
                }
                #jwtInput {
                    width: 80%;
                    margin-bottom: 20px;
                }
                button {
                    padding: 10px 20px;
                    font-size: 16px;
                }
                h2 {
                    color: #333;
                    word-wrap: break-word;
                }
                .status {
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <h1>WebSocket Echo Test</h1>
            <input type="text" id="jwtInput" placeholder="Enter JWT token...">
            <p class="status" id="status">Not connected</p>
            <input type="text" id="messageInput" placeholder="Enter message..." disabled>
            <button id="sendBtn" disabled>Send</button>
            <h2 id="response">Waiting for messages...</h2>
        
            <script>
                const jwtInput = document.getElementById('jwtInput');
                const input = document.getElementById('messageInput');
                const button = document.getElementById('sendBtn');
                const response = document.getElementById('response');
                const status = document.getElementById('status');
                let ws = null;
                let authenticated = false;
        
                jwtInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && jwtInput.value.trim()) {
                        connectWebSocket();
                    }
                });
        
                function connectWebSocket() {
                    const jwt = jwtInput.value.trim();
                    if (!jwt) {
                        status.textContent = 'Please enter a JWT token';
                        return;
                    }
        
                    ws = new WebSocket('ws://localhost:8000/ws/test');
                    status.textContent = 'Connecting...';
        
                    ws.onopen = () => {
                        status.textContent = 'Authenticating...';
                        ws.send(jwt);
                        authenticated = true;
                        status.textContent = 'Connected and authenticated';
                        input.disabled = false;
                        button.disabled = false;
                        jwtInput.disabled = true;
                        response.textContent = 'Ready to send messages';
                    };
        
                    ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        response.textContent = data.message || JSON.stringify(data);
                    };
        
                    ws.onerror = () => {
                        status.textContent = 'Connection error';
                        response.textContent = 'Connection error';
                    };
        
                    ws.onclose = () => {
                        status.textContent = 'Disconnected';
                        input.disabled = true;
                        button.disabled = true;
                        jwtInput.disabled = false;
                        authenticated = false;
                    };
                }
        
                button.addEventListener('click', sendMessage);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') sendMessage();
                });
        
                function sendMessage() {
                    if (input.value.trim() && ws && ws.readyState === WebSocket.OPEN) {
                        const message = {
                            message: input.value
                        };
                        ws.send(JSON.stringify(message));
                        input.value = '';
                    }
                }
            </script>
        </body>
        </html>
        """

    return html




