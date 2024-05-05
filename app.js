const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Creamos un servidor HTTP utilizando Express
const server = http.createServer(app);

// Creamos una instancia de WebSocket que se adjunta al servidor HTTP
const wss = new WebSocket.Server({ server });

// Mapa que asocia cada sala con un array de clientes WebSocket
const salas = new Map();

// Función para crear una nueva sala
function crearSala(nomSala, ws) {
  if (!salas.has(nomSala)) {
    // Si la sala no existe, la creamos y añadimos al cliente a la misma
    salas.set(nomSala, [ws]);
    return true; // Indicamos que se ha creado la sala
  } else {
    // Si la sala ya existe, comprobamos si tiene menos de 2 clientes
    const clientesEnSala = salas.get(nomSala);
    if (clientesEnSala.length < 2) {
      // Si tiene menos de 2 clientes, añadimos al nuevo cliente a la sala
      clientesEnSala.push(ws);
      return true; // Indicamos que se ha añadido el cliente a la sala
    } else {
      // Si ya hay 2 clientes en la sala, no podemos añadir más
      return false; // Indicamos que no se pudo añadir al cliente a la sala
    }
  }
}

// Evento de conexión WebSocket
wss.on('connection', function connection(ws) {
  console.log('Cliente conectado.');

  // Manejar mensajes recibidos
  ws.on('message', function incoming(message) {
    const infoSala = JSON.parse(message);
    console.log(infoSala)
    if (infoSala.typeMessage === "createRoom") {
      const nomSala = infoSala.gameName;
      const creado = crearSala(nomSala, ws);
      if (creado) {
        // Si se creó o añadió correctamente a la sala, enviamos un mensaje de confirmación
        ws.send(JSON.stringify({ typeMessage: "createRoom", player: "P" + (salas.get(nomSala).length) }));
      }
    } else if (infoSala.typeMessage === "lostGame") {
      // Implementa la lógica para enviar un mensaje a todos los clientes en la sala cuando se pierde el juego
      const nomSala = infoSala.gameName;

      if (salas.has(nomSala)) {
        const clientesEnSala = salas.get(nomSala);
        clientesEnSala.forEach(cliente => {
          cliente.send(JSON.stringify({ typeMessage: "winner", winner: infoSala.winner }));
        });
      }
    }else if (infoSala.typeMessage === "updateTorn") {
      // Implementa la lógica para enviar un mensaje a todos los clientes en la sala cuando se pierde el juego
      const nomSala = infoSala.gameName;

      if (salas.has(nomSala)) {
        const clientesEnSala = salas.get(nomSala);
        clientesEnSala.forEach(cliente => {
          cliente.send(JSON.stringify({typeMessage:"updateTorn", otherPlayer:infoSala.otherPlayer}));
        });
      }
    }else if (infoSala.typeMessage === "updateWord") {
      // Implementa la lógica para enviar un mensaje a todos los clientes en la sala cuando se pierde el juego
      const nomSala = infoSala.gameName;

      if (salas.has(nomSala)) {
        const clientesEnSala = salas.get(nomSala);
        clientesEnSala.forEach(cliente => {
          cliente.send(JSON.stringify({typeMessage:"updateWord",  wordCompleted: infoSala.wordCompleted}));
        });
      }
    }
  });

  // Manejar cierre de conexión
  ws.on('close', function close() {
    // Implementa la lógica para eliminar al cliente de la sala cuando se cierra la conexión
    salas.forEach((clientesEnSala, nomSala) => {
      const index = clientesEnSala.indexOf(ws);
      if (index !== -1) {
        clientesEnSala.splice(index, 1);
        if (clientesEnSala.length === 0) {
          salas.delete(nomSala);
        }
      }
    });
  });
});

// Iniciar el servidor HTTP
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket iniciado en el puerto ${PORT}.`);
});
