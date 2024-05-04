/* Eric Salado Zafra */

// Variables inicials

const infoPartida = {
  gameInfo: {
    livesP1: 0,
    livesP2: 0,
    wordCompleted: "",
  },
  player: "",
  response: "",
  status: "",
};

$(document).ready();
/**
 * Quan es carregui la pàgina es carregara el joc
 */
window.onload = function () {
  // Elements HTML necesaris
  var ventanaInfo = document.querySelector("#info");
  var missatgesDelJoc = document.querySelectorAll(".info_msg");
  var botoNouJoc = document.querySelector("#new_game");
  var caixaParaula = document.querySelector("#letters");
  var caixaPista = document.querySelector("#clue");
  // Iniciarem el joc i li afegim un "then" per quan es finalitzi el joc mostri la informació de la partida
  iniciarJoc().then((response) => {
    // Mostrem la informació de la partida
    verInfoPartida(response, caixaParaula);

    // Escoltarem les lletres que es polsin
    escoltarLletres(response, caixaParaula, response.gameName);
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

function verInfoPartida(response, caixaParaula) {
  // Mostrem la informació de la partida
  peticioAPI({
    action: "infoGame",
    gameName: response.gameName,
  }).then((response) => {
    console.log(response.gameInfo.wordCompleted);

    // Mostrem la paraula random
    for (
      let index = 0;
      index < response.gameInfo.wordCompleted.length;
      index++
    ) {
      caixaParaula.innerHTML += "_";
    }
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
      const nomSala = document.getElementById("nom_sala").value;
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
        return { gameName: nomSala, gamePassword: contrasenyaSala };
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
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "https://penjat.codifi.cat/",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(bodyData),
      success: function (response) {
        console.log(response);
        resolve(response);
      },
      error: function (xhr, status, error) {
        reject(error);
      },
    });
  });
}

/**
 *  Escoltara les lletres que es polsin
 * @param {*} paraulaRandom
 * @param {*} caixaParaula
 * @param {*} ventanaInfo
 * @param {*} missatgesDelJoc
 * @param {*} botoContinuar
 */
function escoltarLletres(responseInfoGame, nomSala, caixaParaula) {
  // Escoltarem les lletres que es polsin
  document.addEventListener("keyup", function (event) {
    var letra = event.key;
    var letras = "abcçdefghijklmnopqrstuvwxyz";
    if (letras.indexOf(letra) != -1) {
      peticioAPI({
        action: "playGame",
        gameName: nomSala,
        word: letra,
        player: "P1",
      }).then(response => {
        verInfoPartida(responseInfoGame, caixaParaula);
      })
    }
  });
}
