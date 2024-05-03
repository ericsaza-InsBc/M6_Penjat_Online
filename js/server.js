const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Creamos un servidor HTTP utilizando Express
const server = http.createServer(app);

// Creamos una instancia de WebSocket que se adjunta al servidor HTTP
const wss = new WebSocket.Server({ server });
const rooms = [];
const room = {};
// Evento de conexión WebSocket
wss.on('connection', function connection(ws) {
  console.log('Cliente conectado.');
  // Manejar mensajes  recibidos
  ws.on('message', function incoming(message) {
    var messageString = message.toString('utf-8');
    const messageObject = JSON.parse(messageString);

    if (messageObject.typeMessage = "createRoom") {
        const nomSala = messageObject.nomSala;
        if (!rooms[nomSala]) {
            // Crear una nueva sala si no existe
            const room = {
              password: messageObject.passwordSala,
              people: 1
            };
            rooms[nomSala] = room;
            
          } else {
                var roomCreada = rooms[nomSala];
                if (roomCreada.people < 2) {
                    const room = {
                        password: messageObject.passwordSala,
                        people: 2
                      };
                    rooms[nomSala] = room;
                }else{
                    console.log(`Sala ${roomCreada} llena`)
                }          
            }
            console.log(rooms);          
          }
    message.rooms = rooms;
    ws.send(message)
  });

  // Manejar cierre de conexión
  ws.on('close', function close() {
    console.log('Cliente desconectado.');
  });
});

// Iniciar el servidor HTTP
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket iniciado en el puerto ${PORT}.`);
});