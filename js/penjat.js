/* Eric Salado Zafra */
var diccionari = ["elefant", "criatura", "llapis", "dana", "maduixa", "eric", "anton", "javascript", "html", "css", "php", "mysql", "java", "python", "csharp"];
var potEscriure = false;

/**
 * Quan es carregui la pàgina es carregara el joc
 */
window.onload = function () {

    Swal.fire({
        // title: 'WORDLE IBC',
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
            const nomSala = document.getElementById("nom_sala").value;
            const contrasenyaSala = document.getElementById("contrasenya_sala").value;

            if (!nomSala) {
                Swal.showValidationMessage(`Siusplau, omple el camp del nom de la sala`);
                return false;
            }
            if (!contrasenyaSala) {
                Swal.showValidationMessage(`Siusplau, omple el camp de contrasenya de la sala`);
                return false;
            }

            $.ajax({
                url: 'https://penjat.codifi.cat/',
                type: 'POST',
                contentType: "application/json",
                data: JSON.stringify({
                    action: "createGame",
                    gameName: nomSala,
                    gamePassword: contrasenyaSala,
                }),
                success: function (response) {

                    // Mostramos la respuesta en consola
                    console.log(response);
                },
                error: function (xhr, status, error) {
                    // Maneja errores aquí
                    console.error(error);
                }
            })
            return { nomSala, contrasenyaSala };
        },
        customClass: {
            popup: "swal-inicio",
            title: "swal-title-inicio",
        },
    });
    // Elements HTML necesaris
    var ventanaInfo = document.querySelector("#info");
    var missatgesDelJoc = document.querySelectorAll(".info_msg");
    var botoContinuar = document.querySelector("#btn_ok");
    var botoNouJoc = document.querySelector("#new_game");
    var caixaParaula = document.querySelector("#letters");
    var caixaPista = document.querySelector("#clue");

    // Per cada partida es reiniciara la caixa de la paraula
    caixaParaula.innerHTML = "";

    // Escollim una paraula random del diccionari y mostrem els guions
    var paraulaRandom = diccionari[Math.floor(Math.random() * diccionari.length)];
    for (let index = 0; index < paraulaRandom.length; index++) {
        caixaParaula.innerHTML += "_";
    }
    console.log(paraulaRandom);

    // Mostrem la paraula random per consola
    // console.log(paraulaRandom);

    // Mostrarem la pista
    pista(caixaPista, paraulaRandom, caixaParaula, ventanaInfo, missatgesDelJoc, botoContinuar);

    // Escoltarem les lletres que es polsin
    escoltarLletres(paraulaRandom, caixaParaula, ventanaInfo, missatgesDelJoc, botoContinuar);

    // Quan es polsi el boto de nou joc es reiniciara el joc
    reiniciarJoc(botoNouJoc);
}

/**
 * Mostrara un missatge en una finestra modal
 * @param {*} ventanaInfo 
 * @param {*} missatge 
 * @param {*} botoContinuar 
 */
function mostrarMissatge(ventanaInfo, missatge, botoContinuar) {

    // Mostrarem el missatge de benvinguda
    ventanaInfo.style.display = "block";
    missatge.style.display = "block";
    potEscriure = false;

    // Si el missatge es el de benvinguda al clickar al botón ctancará el missatge de benvinguda
    if (missatge.innerHTML == "No permetis que la massa enfurismada pengi al monstre per no saber vocabulari. Ajuda'l a salvar-se!") {


        // Al clickar al botón ctancará el missatge de benvinguda
        botoContinuar.addEventListener("click", function () {
            ventanaInfo.style.display = "none";
            missatge.style.display = "none";
            potEscriure = true;
        });
    } else {
        botoContinuar.addEventListener("click", function () {
            location.reload();
        });
    }

}

/**
 *  Reiniciara el joc
 * @param {*} botonNuevoJuego 
 */
function reiniciarJoc(botonNuevoJuego) {
    botonNuevoJuego.addEventListener("click", function () {
        location.reload();
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
function escoltarLletres(paraulaRandom, caixaParaula, ventanaInfo, missatgesDelJoc, botoContinuar) {

    // Escoltarem les lletres que es polsin
    document.addEventListener("keyup", function (event) {
        if (potEscriure) {
            var letra = event.key;
            var letras = "abcçdefghijklmnopqrstuvwxyz";
            if (letras.indexOf(letra) != -1) {

                // Si la lletra existeix en la paraula random la mostrara
                if (paraulaRandom.indexOf(letra) != -1) {

                    // Si la lletra es correcta la mostrara en la seva posicio
                    for (let index = 0; index < paraulaRandom.length; index++) {
                        if (paraulaRandom[index] == letra) {

                            // Si la lletra es correcta la mostrara en la seva posicio

                            // 
                            caixaParaula.innerHTML = caixaParaula.innerHTML.substring(0, index) + letra.toUpperCase() + caixaParaula.innerHTML.substring(index + 1);
                        }
                    }
                } else {

                    // Si la lletra no existeix en la paraula random es restara una vida
                    perdsUnaVida(ventanaInfo, missatgesDelJoc, botoContinuar);
                }
            }

            // Si la paraula random te el mateix text que la caixa de la paraula es que s'ha guanyat
            if (paraulaRandom.toUpperCase() == caixaParaula.innerHTML) {
                mostrarMissatge(ventanaInfo, missatgesDelJoc[1], botoContinuar);
            }
        }

    });

}

/**
 *  Mostrara una pista
 * @param {*} caixaPista 
 * @param {*} paraulaRandom 
 * @param {*} caixaParaula 
 * @param {*} ventanaInfo 
 * @param {*} missatgesDelJoc 
 * @param {*} botoContinuar 
 */
function pista(caixaPista, paraulaRandom, caixaParaula, ventanaInfo, missatgesDelJoc, botoContinuar) {
    var letra = paraulaRandom[Math.floor(Math.random() * paraulaRandom.length)];
    console.log(letra);

    // Cada vegada que es passi el ratolí per sobre de la caixa de la pista es mostrara una lletra
    caixaPista.addEventListener("mouseover", function () {

        // Si la paraula random te el mateix text que la caixa de la paraula es que s'ha guanyat
        if (paraulaRandom.toUpperCase() == caixaParaula.innerHTML) {
            mostrarMissatge(ventanaInfo, missatgesDelJoc[1], botoContinuar);
        } else {
            // Per cada pista que es doni es restara una vida
            perdsUnaVida(ventanaInfo, missatgesDelJoc, botoContinuar);
            caixaPista.innerHTML = letra;


            // ? He volgut afegir una funcionalitat extra, que es que si la paraula random te la lletra que es mostra en la pista, la mostrara en la seva posicio
            // ! Es un copy/paste de la funcio escoltarLletres(), pero aqui solament es amb la lletra que es mostra en la pista
            // Si la lletra existeix en la paraula random la mostrara
            if (paraulaRandom.indexOf(letra) != -1) {

                // Si la lletra es correcta la mostrara en la seva posicio
                for (let index = 0; index < paraulaRandom.length; index++) {
                    if (paraulaRandom[index] == letra) {

                        // Si la lletra es correcta la mostrara en la seva posicio
                        caixaParaula.innerHTML = caixaParaula.innerHTML.substring(0, index) + letra.toUpperCase() + caixaParaula.innerHTML.substring(index + 1);
                    }
                }
            }
        }
    });

    // Y quan l'usuari tregui el ratolí de la seva àrea, torni a mostrar un interrogant
    caixaPista.addEventListener("mouseout", function () {
        caixaPista.innerHTML = "?";
    });
}

/**
 * Restara una vida i canviara la imatge del monstre per cada error o pista mostrada
 * @param {*} ventanaInfo 
 * @param {*} missatgesDelJoc 
 * @param {*} botoContinuar 
 */
function perdsUnaVida(ventanaInfo, missatgesDelJoc, botoContinuar) {
    var caixaVides = document.querySelector("#lives");
    var vides = parseInt(caixaVides.innerHTML.substring(0, 1));
    var contadorErrors = 5 - vides;

    var imatgeMonstre = document.getElementById("monster");

    // Restaremos una vida
    vides--;
    if (vides >= 0) {
        caixaVides.innerHTML = `${vides} LIVES LEFT`;

        // Cambiará la imagen del monstre
        imatgeMonstre.src = `img/monster${contadorErrors + 1}.png`;
    }

    // Si es perd la partida es mostrara un missatge
    if (vides == 0) {
        imatgeMonstre.src = `img/monster5.png`;
        mostrarMissatge(ventanaInfo, missatgesDelJoc[2], botoContinuar);
    }

}