/* Eric Salado Zafra */

// Variables inicials

const ws = new WebSocket("ws://localhost:3000");
var currentPlayer = "";
var nomSala = "";
var lives;
var currentPlayerButton;
var wordCompleted;
var caixaParaula;

var infoPlayer = {
  playerName: "",
  lives: 5,
};

ws.onopen = () => {
  console.log("Player connected");
};

ws.onmessage = (message) => {
  var infoSala = JSON.parse(message.data);
  console.log(infoSala);


  // Si el tipus de missatge es "winner" es mostrara un missatge de guanyador o perdedor
  if (infoSala.typeMessage == "winner") {
    document.removeEventListener("keyup", keyUp);
    if (infoPlayer.playerName == infoSala.winner) {
      Swal.fire({
        icon: "success",
        title: "Partida acabada!",
        text: "Felicitats has guanyat!",
        allowOutsideClick: false, // Aquí se establece para evitar que se cierre al hacer clic fuera
      });

      // Botó per a començar un nou joc
      document.querySelector("#new_game").addEventListener("click", nouJoc);
    } else {
      Swal.fire({
        icon: "error",
        title: "Partida acabada!",
        text: "Quina pena has perdut, mes sort la próxima vegada!",
        allowOutsideClick: false, // Aquí se establece para evitar que se cierre al hacer clic fuera
      });
      
      // Botó per a començar un nou joc
      document.querySelector("#new_game").addEventListener("click", nouJoc);
    }
  }else if (infoSala.typeMessage == "updateTorn") {
    currentPlayerButton.innerHTML = "TORN: " + infoSala.otherPlayer;
  }else if (infoSala.typeMessage == "updateWord") {
    caixaParaula.innerHTML = infoSala.wordCompleted;
  }else {
    infoSala.player == "P1" ? (currentPlayer = "P1") : (currentPlayer = "P2");
    infoPlayer.playerName = currentPlayer;
  }
};

$(document).ready();
/**
 * Quan es carregui la pàgina es carregara el joc
 */
window.onload = function () {
  // Elements HTML necesaris
  caixaParaula = document.querySelector("#letters");
  lives = document.querySelector("#lives");
  currentPlayerButton =  document.querySelector("#currentPlayer");

  // Iniciarem el joc i li afegim un "then" per quan es finalitzi el joc mostri la informació de la partida
  iniciarJoc().then((response) => {
    mostrarNomSala(response.gameName);

    // Mostrem la informació de la partida
    verInfoPartida(response.gameName, caixaParaula);

    // Escoltarem les lletres que es polsin
    escoltarLletres(caixaParaula, response.gameName);
  });
};

/**
 * Funció per a començar un nou joc
 */
function nouJoc() {
  // Fem que recarregui la pàgina
  location.reload();
}

/**
 * Funció per a mostrar la informació de la partida
 * @param {*} nomSala 
 * @param {*} caixaParaula 
 */
function verInfoPartida(nomSala, caixaParaula) {

  // Mostrem la informació de la partida
  peticioAPI({
    action: "infoGame",
    gameName: nomSala,
  }).then((response) => {
    console.log(response.gameInfo.wordCompleted);

    // Mostrem la paraula incompleta
    ws.send(JSON.stringify({typeMessage : "updateWord", gameName: nomSala, wordCompleted: response.gameInfo.wordCompleted}));
    wordCompleted = response.gameInfo.wordCompleted;

    // Mostrem les vides
    if (!response.gameInfo.wordCompleted.includes("_")) {
      ws.send(
        JSON.stringify({
          typeMessage: "lostGame",
          winner: response.player == "P1" ? "P2" : "P1",
          gameName: nomSala,
        })
      );
    }
  });
}

/**
 * Funció per a iniciar el joc
 * @returns  {Promise} Retorna el nom de la sala i la contrasenya
 */
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

        // Si la contrasenya es incorrecta no es pot continuar
        if (response.status === "KO" || response == "<br>") {
          Swal.showValidationMessage("Contrasenya incorrecta");
          return false;
        }

        // Retornem el nom de la sala i la contrasenya
        ws.send(
          JSON.stringify({
            typeMessage: "createRoom",
            gameName: nomSala,
            gamePassword: contrasenyaSala,
          })
        );
        return { gameName: nomSala, gamePassword: contrasenyaSala };
      });
    },

    // Estils de la finestra
    customClass: {
      popup: "swal-inicio",
      title: "swal-title-inicio",
    },
  });
  return datosInicio;
}

/**
 * Funció per a fer peticions a l'API
 * @param {*} bodyData 
 * @returns  {Promise} Retorna la resposta de l'API
 */
function peticioAPI(bodyData) {
  if (infoPlayer.lives > 0) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: "https://penjat.codifi.cat/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(bodyData),
        success: function (response) {

          // Si la resposta es "Player incorrect" es mostra un missatge d'informació
          if (response.response.includes("Player incorrect")) {
            Swal.fire({
              icon: "info",
              title: "No es el teu torn!",
              text: "Espera a que l'altre usuari escolleixi una lletra",
              allowOutsideClick: false, // Aquí se establece para evitar que se cierre al hacer clic fuera
            });
          }else {

            // Si la resposta es "Word incorrect" es mostra un missatge d'informació
            otherPlayer = infoPlayer.playerName == "P1" ? "P2" : "P1";
            if (response.response.includes("Word incorrect")) {
              infoPlayer.lives--;
              console.log(infoPlayer.lives);
              $('#monster').attr('src', 'img/monster' + (5 - infoPlayer.lives) + '.png');
              Swal.fire({
                icon: "info",
                title: "No has encertat! Torn de " + otherPlayer,
                text: "Espera a que l'altre usuari escolleixi una lletra",
                allowOutsideClick: false, // Aquí se establece para evitar que se cierre al hacer clic fuera
              });
              lives.innerHTML = infoPlayer.lives + " LIVES LEFT";
            }

            // Si la resposta es "Word correct" es mostra un missatge d'informació
            ws.send(JSON.stringify({typeMessage : "updateTorn", otherPlayer:otherPlayer, gameName: nomSala}));
          }  
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(error);
        },
      });
    });
  } else {

    // Si les vides son 0 es mostra un missatge d'informació
    winner = infoPlayer.playerName == "P1" ? "P2" : "P1";
    ws.send(
      JSON.stringify({
        typeMessage: "lostGame",
        winner: winner,
        gameName: nomSala,
      })
    );
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
    console.log(currentPlayer);

    // Si la lletra polsada es correcta es jugara la lletra
    if (letras.indexOf(letra) != -1) {
      peticioAPI({
        action: "playGame",
        gameName: nomSala,
        word: letra,
        player: currentPlayer,
      }).then((response) => {

         // Una vez que se haya jugado la letra, actualiza la palabra en la pantalla
        verInfoPartida(nomSala, caixaParaula);
      });
    }
  };

  // Escoltara les tecles que es polsin
  document.addEventListener("keydown", keyUp);
}

/**
 * Funció per a mostrar el nom de la sala
 * @param {*} nomSala  Nom de la sala
 */
function mostrarNomSala(nomSala) {
  Toastify({
    text: "Ets a la sala: " + nomSala,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: {
      background: "#323232",
      width: 3000,
      paddingLeft: "100px",
      paddingRight: "100px",
    },
  }).showToast();
}
