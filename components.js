(function (window, document) {
    let home = function () {
        let element = null,
            nameElement = null,
            library = {

                // función para obtener ID.
                get: function (object) {
                    if (object[0] == '#') {
                        nameElement = object.substr(1);
                        element = document.getElementById(object.substr(1));
                    } else if (object[0] == '.') {
                        nameElement = object.substr(1);
                        element = document.getElementsByClassName(object.substr(1));
                    } else {
                        nameElement = object;
                        element = document.getElementsByTagName(object);
                    }
                    return this; // Lo usaremos como cadena
                },

                extend: function (byDefault, valExtend) {
                    valExtend = Object.assign(byDefault, valExtend);
                    return valExtend;
                },

                /* Función pensada para funcionar después de que estén listos los contenedores con los atributos requeridos
                En la etiqueda HTML puede recibir parametros como:
                
                color = "grey"
                position = "left" o puede ser right
                value = "3" puede ser del 1 al 5
                disabled    -   Este atributo evita que se modifiquen las estrellas

                En caso de no recibir el atributo value, este activará automaticamente el evento puesto en la funcion,
                la cual correspondería en enviar el numero de estrellas al servidor.
                */
                starRating: function (object) {
                    object = this.extend({
                        size: "2rem",
                        class: 'componentStar',
                        success: (e) => {
                            console.log(e);
                        }
                    }, object);

                    // Variables;
                    let style;
                    let elems;
                    let color;
                    let value;
                    let position;
                    let content;
                    let estrellas;
                    let data;
                    let estrella;
                    let size = object.size;

                    // Preparamos estilos
                    style = document.createElement('style');
                    style.innerHTML = `
                        .${object.class}{
                            direction: rtl;
                            width: 100%;
                        }
                        .${object.class} a{
                            cursor: pointer;
                            margin-right: -7px !important;
                            margin-left: -3px !important;
                        }
                        .${object.class} a:hover{
                            color: #f1c40f !important;
                        }
                        .${object.class} a:hover ~ a{
                            color: #f1c40f !important;
                        }
                        .${object.class} .active{
                            color: #f1c40f !important;
                        }
                        .${object.class} .active ~ a{
                            color: #f1c40f !important;
                        }
                    `;
                    document.head.append(style);

                    // Preparamos objetos por medio de clases
                    elems = document.getElementsByClassName(object.class);

                    // recorremos objetos con un for
                    for (let i = 0; i < elems.length; i++) {

                        // obtenemos color
                        color = elems[i].getAttribute('color');
                        // preparamos css
                        if (color == 'grey') {
                            color = '158, 158, 158, .7';
                        } else {
                            color = '255, 255, 255, .3';
                        }

                        // obtenemos valor de las estrellas
                        value = elems[i].getAttribute('value');

                        // obtenemos posicion
                        position = elems[i].getAttribute('position');
                        if (position != null) {
                            elems[i].style.textAlign = position;
                        } else {
                            elems[i].style.textAlign = 'left';
                        }

                        // Hacemos el content
                        content = `
                            <a data-num = "5" class="objStarg791${i}" style="color: rgba(${color}); transition: .1s ease all !important;"><i class="material-icons" style="font-size: ${size}">star</i></a>
                            <a data-num = "4" class="objStarg791${i}" style="color: rgba(${color}); transition: .1s ease all !important;"><i class="material-icons" style="font-size: ${size}">star</i></a>
                            <a data-num = "3" class="objStarg791${i}" style="color: rgba(${color}); transition: .1s ease all !important;"><i class="material-icons" style="font-size: ${size}">star</i></a>
                            <a data-num = "2" class="objStarg791${i}" style="color: rgba(${color}); transition: .1s ease all !important;"><i class="material-icons" style="font-size: ${size}">star</i></a>
                            <a data-num = "1" class="objStarg791${i}" style="color: rgba(${color}); transition: .1s ease all !important;"><i class="material-icons" style="font-size: ${size}">star</i></a>
                        `;

                        // Inseción de estrellas en las clases
                        elems[i].innerHTML = content;

                        //Aplicamos eventos
                        estrellas = document.getElementsByClassName(`objStarg791${i}`);

                        // En caso de haber un atributo value, aplicamos estrellas
                        if (value != null) {
                            // convertimos el valor a decimal
                            value = Math.round(value);

                            value = 5 - value;
                            for (let i = estrellas.length; value < i; i--) {
                                estrellas[i - 1].classList.add('active');
                            }
                        }
                        // En caso de no tener el atributo value aplicamos un evento
                        else {
                            elems[i].setAttribute('value', 0);

                            for (let j = 0; j < estrellas.length; j++) {
                                estrellas[j].addEventListener('click', function (e) {
                                    e.preventDefault();

                                    estrella = elems[i].getElementsByTagName('a');

                                    data = this.getAttribute('data-num');

                                    // Limpiamos clases active
                                    for (let k = 0; k < estrella.length; k++) {
                                        estrella[k].className = `objStarg791${i}`;
                                    }


                                    if (elems[i].getAttribute("disabled") == null) {
                                        // Aplicamos clase a la actual
                                        this.classList.add('active');
                                        elems[i].setAttribute('value', data);
                                        if (typeof (object.success) == 'function') {
                                            object.success(data);
                                        }
                                    }

                                });
                            }
                        }

                    }



                }

            };
        return library;
    }

    if (typeof window.__component === 'undefined') {
        window.__component = home();
    }
})(window, document);