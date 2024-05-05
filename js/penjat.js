/* Eric Salado Zafra */

// Variables inicials

const ws = new WebSocket("ws://localhost:3000");
var currentPlayer = "";
var nomSala = "";

var infoPlayer = {
  playerName: "",
  lives: 5,
};

ws.onopen = () => {
  console.log("Player connected");
};

ws.onmessage = (message) => {
  var infoSala = JSON.parse(message.data);
  console.log(infoSala)

  if (infoSala.typeMessage == "winner") {
    document.removeEventListener("keyup",keyUp);
    if (infoPlayer.playerName == infoSala.winner) {
      Swal.fire({
        icon: "success",
        title: "Partida acabada!",
        text: "Felicitats has guanyat!"
      });
    }else {
      Swal.fire({
        icon: "error",
        title: "Partida acabada!",
        text: "Quina pena has perdut, mes sort la próxima vegada!"
      });
    }
  }else {
    infoSala.player == "P1" ? currentPlayer = "P1" : currentPlayer = "P2";
    infoPlayer.playerName = currentPlayer;
  }
};

$(document).ready();
/**
 * Quan es carregui la pàgina es carregara el joc
 */
window.onload = function () {
  // Elements HTML necesaris
  var caixaParaula = document.querySelector("#letters");
  var lives = document.querySelector("#lives");

  // Iniciarem el joc i li afegim un "then" per quan es finalitzi el joc mostri la informació de la partida
  iniciarJoc().then((response) => {
    console.log(response);
    // Mostrem la informació de la partida
    verInfoPartida(response.gameName, caixaParaula);

    // Escoltarem les lletres que es polsin
    escoltarLletres(caixaParaula, response.gameName);

  });

  // Mostrem la paraula random per consola
  // console.log(paraulaRandom);

  // Mostrarem la pista
  // pista(caixaPista, paraulaRandom, caixaParaula, ventanaInfo, missatgesDelJoc, botoContinuar);

  // // Quan es polsi el boto de nou joc es reiniciara el joc
  // reiniciarJoc(botoNouJoc);
};

function nouJoc() {
  // Fem que recarregui la pàgina
  location.reload();
}

function verInfoPartida(nomSala, caixaParaula) {
  // Mostrem la informació de la partida
  peticioAPI({
    action: "infoGame",
    gameName: nomSala,
  }).then((response) => {
    console.log(response.gameInfo.wordCompleted);

    caixaParaula.innerHTML = response.gameInfo.wordCompleted;
  });
}
// Funcions
async function iniciarJoc() {
  const { value: datosInicio } = await Swal.fire({
    html: `
            <span class='swal-title-inicio'>Penjat online</span>
              <br>
              <label class="swal-label-inicio">Nom sala:</label>
              <input type="text" id="nom_sala" class="swal2-input swal-input-inicio swal-input-inicio" placeholder="Escriu el nom de la sala">
              <label class="swal-label-inicio">Contrasenya sala:</label>
              <input type="text" id="contrasenya_sala" class="swal2-input swal-input-inicio swal-input-inicio" placeholder="Escriu la contrasenya de la sala">
            `,
    focusConfirm: false,
    allowOutsideClick: false, // Aquí se establece para evitar que se cierre al hacer clic fuera
    confirmButtonText: "Jugar",
    preConfirm: () => {
      // Obtenim el nom de la sala i la contrasenya
      nomSala = document.getElementById("nom_sala").value;
      const contrasenyaSala = document.getElementById("contrasenya_sala").value;

      // Si no s'ha omplert el nom de la sala o la contrasenya no es pot continuar
      if (!nomSala || !contrasenyaSala) {
        Swal.showValidationMessage(
          `La contrasenya o el nom de la sala no esta omplert`
        );
        return false;
      }

      // Retornem el nom de la sala i la contrasenya
      return peticioAPI({
        action: "createGame",
        gameName: nomSala,
        gamePassword: contrasenyaSala,
      }).then(function (response) {
        if (response.status === "KO" || response == "<br>") {
          Swal.showValidationMessage("Contrasenya incorrecta");
          return false;
        }

        // Retornem el nom de la sala i la contrasenya
        ws.send(JSON.stringify({ typeMessage:"createRoom", gameName: nomSala, gamePassword: contrasenyaSala}));
        return {gameName: nomSala, gamePassword: contrasenyaSala };
      });
    },
    customClass: {
      popup: "swal-inicio",
      title: "swal-title-inicio",
    },
  });
  return datosInicio;
}

// Al clickar la tecla "i" es mostrara la informació de la partida per consola
document.addEventListener("keyup", function (event) {
  if (event.key == "i") {
    console.log(peticioAPI(mostrarInfoPartida));
  }
});

// Petició a la API
function peticioAPI(bodyData) {
    if( infoPlayer.lives > 0 ) {
        return new Promise(function (resolve, reject) {
            $.ajax({
              url: "https://penjat.codifi.cat/",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify(bodyData),
              success: function (response) {
                console.log(response);
                if(response.response.includes("Word incorrect")) {
                  infoPlayer.lives--;
                  otherPlayer = infoPlayer.playerName == "P1" ? "P2": "P1";
                  Swal.fire({
                    icon: "info",
                    title: "No has encertat! Torn de " + otherPlayer,
                    text: "Espera a que l'altre usuari escolleixi una lletra",
                  });
                  lives.innerHTML = infoPlayer.lives + " LIVES LEFT"
                }else if(response.response.includes("Player incorrect")) {
                    Swal.fire({
                      icon: "info",
                      title: "No es el teu torn!",
                      text: "Espera a que l'altre usuari escolleixi una lletra",
                    });
                }
          

              console.log(infoPlayer)
              resolve(response);
            },
            error: function (xhr, status, error) {
              reject(error);
            },
          });
        });
  }else {
    winner = infoPlayer.playerName == "P1" ? "P2" : "P1";
    ws.send(JSON.stringify({ typeMessage: "lostGame", winner: winner, gameName: nomSala  }))
  }
}

/**
 *  Escoltara les lletres que es polsin
 * @param {*} paraulaRandom
 * @param {*} caixaParaula
 * @param {*} ventanaInfo
 * @param {*} missatgesDelJoc
 * @param {*} botoContinuar
 */
function escoltarLletres(caixaParaula, nomSala) {
   keyUp = (event) => {
    var letra = event.key;
    var letras = "abcçdefghijklmnopqrstuvwxyz";
    console.log(currentPlayer)
    if (letras.indexOf(letra) != -1) {
      peticioAPI({
        action: "playGame",
        gameName: nomSala,
        word: letra,
        player: currentPlayer,
      }).then(response => {
        verInfoPartida(nomSala, caixaParaula);
      })
    }
  };
      document.addEventListener("keyup",keyUp);
}


