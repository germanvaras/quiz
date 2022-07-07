// array preguntas
let preguntas;
// nombre del jugador
let nombre;
// contenedor de tiempo de juego
let quizTiempo;
// array filtrado de preguntas
let categoriaElegida;
// contenedor del quiz
let quizContenedor = document.getElementById("cuestionario");
// contenedor de categorias
let categoria;
// section preguntas
let quizPreguntas;
// section opciones 
let quizOpciones;
// botones de las opciones
let botonOpcion;
// respuesta
let respuestas;
// indice de preguntas
let indice = 1;
// pregunta actual
let actual = 0;
// puntaje del juego
let puntaje = 0;
// tiempo del juego
let tiempo;
// main para cambiar los colores
let container = document.getElementById("main");
// contenedor para almacenar info del último jugador
let ultimoJugador = document.getElementById("ultimoJugador");
// formulario
let form = document.getElementById("form");
// audios
let correcta = new Audio;
correcta.src = "audio/correcta.mp3";
let incorrecta = new Audio;
incorrecta.src = "audio/incorrecta.mp3";
let reloj = new Audio;
reloj.src = "audio/reloj.mp3";
// funcion que llama a data.json 
async function init() {
    const respose = await fetch('js/data.json');
    preguntas = await respose.json();
    renderizado();
}
// funcion para filtrar por categoria
function renderizado() {
    // renderizado del formulario
    form.innerHTML = `<h2 id="opcionSeleccionada">¿A qué categoría deseas jugar?</h2>
                    <label class="label" for="nombre"> Nombre</label>
                    <input id="nombre" type="text" placeholder="Tú nombre">
                    <select name="" id="categorias">
                        <option selected disabled value="Categoria" class="opcion">Categoría</option>
                        <option value="Historia" id="Historia" class="opcion">Historia</option>
                        <option value="Deporte" id="Deporte" class="opcion"> Deporte</option>
                        <option value="Ciencia" id="Ciencia" class="opcion">Ciencia</option>
                        </select>
                    <input type="submit" id="categoriaSeleccionada" value="Jugar">`;
    // convertir string en objeto
    let ultimaJugada = JSON.parse(localStorage.getItem("ultimoParticipante"));
    if (ultimaJugada) {
        // destructurar objeto
        let { jugador, puntaje, categoria } = ultimaJugada;
        ultimoJugador.innerHTML = `${jugador} fué la ultima persona que jugó y obtuvo ${puntaje} punto/s en la categoria ${categoria}`;
    }
    // prevenir que la pagina recargue
    form.onsubmit = (e) => {
        e.preventDefault();
        let eleccion = document.getElementById("categorias").value;
        nombre = document.getElementById("nombre").value;
        // filtrado de las categorias
        categoriaElegida = preguntas.filter(
            (filter) => filter.categoria == eleccion);
        // condicional para cambiar el color del container
        if (eleccion == "Historia" && nombre != "") {
            container.classList.add("historia");
            iniciar();
        }
        else if (eleccion == "Deporte" && nombre != "") {
            container.classList.add("deporte");
            iniciar();
        }
        else if (eleccion == "Ciencia" && nombre != "") {
            container.classList.add("ciencia");
            iniciar();
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ingrese un nombre y una categoría para jugar!',
                background: '#3697cb',
                color: '#eeeeee',
                iconColor: '#c34242e6',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#1d506b',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bottonSweet'
                }
            })
        };
    }
}
// funcion para declarar y crear elementos HTML
function iniciar() {
    container.classList.remove("main");
    // tiempo
    quizTiempo = document.createElement("h4");
    quizTiempo.classList.add("tiempo");
    quizContenedor.appendChild(quizTiempo);
    // cracion de categoria
    categoria = document.createElement("h1");
    categoria.id = "categoria";
    // categoria.id = "categoria";
    quizContenedor.appendChild(categoria);
    // creacion de preguntas section
    quizPreguntas = document.createElement("section");
    // quizPreguntas.id = "quiz-preguntas";
    quizContenedor.appendChild(quizPreguntas);
    //  creacion de respuestas section
    quizOpciones = document.createElement("section");
    quizOpciones.id = "quiz-opciones";
    quizContenedor.appendChild(quizOpciones);
    // creacion del contador de preguntas
    quizActual = document.createElement("footer");
    // quizActual.id = "quiz-actual";
    quizContenedor.appendChild(quizActual);
    inicio();
}
function inicio() {
    // eliminar el form del HTML
    form.innerHTML = "";
    ultimoJugador.innerHTML = "";
  
 
    tiempo = 10;
    //  mientras el index actual sea menor a la longitud del array
    if (actual < categoriaElegida.length) {
        tiempoTerminado = setInterval(() => {
            // intervalo para restar de a un segundo el tiempo
            quizTiempo.innerHTML = tiempo--;
            // en caso de que sea menor a 5 cambiar el color y el sonido
            if (tiempo < 5) {
                reloj.play();
                quizTiempo.classList.add("pocoTiempo");
            }
            // en caso de llegar a -1 pausar el reloj y validar la correcta
            if (tiempo == -1) {
                reloj.pause();
                incorrecta.play();
                validacionCorrecta();
            };
        }, 1000);
        // se resta el tiempo una vez por fuera del intervalo para evitar delay
        quizTiempo.innerHTML = tiempo--;
        // respuesta actual 
        respuestas = categoriaElegida[actual].respuesta;
        // categoria actual
        categoria.innerHTML = categoriaElegida[actual].categoria;
        // pregunta actual
        quizPreguntas.innerHTML = `<h3>${categoriaElegida[actual].pregunta}</h3>`;
        // creacion de un boton por cada opcion posible actual
        for (let opcion in categoriaElegida[actual].opcion) {
            botonOpcion = document.createElement("button");
            botonOpcion.value = opcion;
            quizOpciones.appendChild(botonOpcion);
            botonOpcion.innerHTML = categoriaElegida[actual].opcion[opcion];
            botonOpcion.addEventListener("click", validacion);

        }
        quizActual.innerHTML = `<h4>Pregunta ${indice} de ${categoriaElegida.length}<h4>`;
    }
    else {
        // en caso de que el index sea igual al largo del arry finalizar juego
        findelJuego();
    }

}
function validacion(e) {
    
    let botones = quizOpciones.getElementsByTagName("button");
    // remover el evento click para evitar multiples clicks
    for (let boton of botones) {
        boton.removeEventListener("click", validacion);
    }
    let respuestaCorrecta = e.target.value == respuestas
    // validacion respuestaCorrecta
    if (respuestaCorrecta) {
        correcta.play();
        e.target.classList.add("respuestaCorrecta");
        puntaje++;
        siguientePregunta();
    }
    else {
        incorrecta.play();
        e.target.classList.add("respuestaIncorrecta");
        validacionCorrecta();
     
    }
}
// funcion para pintar la correcta cuando marcaron la incorrecta o se haya acabado el tiempo
function validacionCorrecta() {
    for (let i = 0; i < quizOpciones.children.length; i++) {
        quizOpciones.children[i].value == respuestas && quizOpciones.children[i].classList.add("respuestaCorrecta");
    }
    siguientePregunta();
}
// funcion que retoma la funcion inicio con el actual aumentado
function siguientePregunta() {
    actual++;
    indice++;
    // se le agrega un pequeño delay para poder observar el resultado
    setTimeout(() => {
        reloj.pause();
        quizTiempo.removeAttribute("class");
        quizTiempo.classList.add("tiempo");
        clearInterval(tiempoTerminado);
        quizOpciones.innerHTML = "";
        inicio();
    }, 800); 

}
function findelJuego() {
    puntaje >= 3 ? Swal.fire({
        imageUrl: "img/ganador.gif",
        title: 'GANASTE!',
        text: 'Respondiste al menos 3 preguntas correctamente',
        confirmButtonText: 'Ver resultado',
        background: '#3697cb',
        color: '#eeeeee',
        iconColor: '#c34242e6',
        confirmButtonColor: '#1d506b',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'bottonSweet'
        }
        // perdiste en caso de
    }) :
        Swal.fire({
            imageUrl: "img/perdedor.gif",
            title: 'PERDISTE!',
            text: 'Respondiste menos de 3 preguntas correctamente',
            confirmButtonText: 'Ver resultado',
            background: '#3697cb',
            color: '#eeeeee',
            iconColor: '#c34242e6',
            confirmButtonColor: '#1d506b',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bottonSweet'
            }
        });
    quizTiempo.removeAttribute("class");
    quizTiempo.innerHTML = "";
    quizPreguntas.innerHTML = `<h3>${nombre} tu puntaje final fué de ${puntaje} preguntas correctas de ${categoriaElegida.length} jugadas.<h3>`;
    quizOpciones.innerHTML = "<button type='button' value='Vuelve a Jugar' class='volverJugar' onclick='reseteo()'>Volver a Jugar</button";
    quizActual.innerHTML = "";
    // cargar un objeto en el local storage
    localStorage.setItem("ultimoParticipante", JSON.stringify({ jugador: nombre, puntaje: puntaje, categoria: categoriaElegida[0].categoria }));
}
function reseteo() {
    quizContenedor.innerHTML = "";
    preguntas = [];
    actual = 0;
    puntaje = 0;
    indice = 1;
    // se remueve la clase vigente para luego volver a retomar el color del menú
    container.removeAttribute("class")
    container.classList.add("main")
    init();
}
document.addEventListener("DOMContentLoaded", init())


