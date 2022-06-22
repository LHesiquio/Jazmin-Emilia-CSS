/*
Creador: Luis Enrique Hernandez Hesiquio.
Nombre de la librería: JazminJS.
Creada el: 2019
Última modificación: 02/09/2021.
Versión actual: 2.0.1
Changelog:
- Se evita la ejecución por segunda vez
*/
(function(window, document) {
    let inicio = function() {
        let jazmin = {
            /* utilidad para bloquear otras instancias mientras se ejecuta, evita ejecutar funciones 2 veces al mismo tiempo */
            onExecute: false,
            /* variables */
            verify: -1,

            /* 
                Convertir de un string a un array
                Esta funcion recibe como parametro el string y el indicador en donde va a separar
                el string para convertirlo en arreglo
            */
            stringToArray: (string, separator) => string.split(separator),

            /* 
                Convertir de un array a un string
                Esta funcion recibe como parametro el array y el indicador en donde va a separar
                el array para convertirlo en string
            */
            arrayToString: (array, separator) => array.join(separator),

            /* 
                Quitar caracter o numero de un array y te lo retorna
                Esta funcion recibe como parametro el array y el caracter a eliminar
            */
            deleteCharacterInArray: (array, caracter) => {
                const index = array.indexOf(caracter);
                if (index > -1) {
                    array.splice(index, 1);
                }
                return array;
            },

            /* Funcion para crear claves en una cookie */
            setCookie: (cname, cvalue, exdays) => {
                let d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                let expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            },

            /* Funcion para obtener la clave una cookie */
            getCookie: (cname) => {
                let name = cname + "=";
                let ca = document.cookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },

            /* Función pensada para agregar una clase */
            addClass: (id, cssClass) => {
                document.getElementById(id).classList.add(cssClass);
            },

            /* Función pensada para remover una clase */
            removeClass: (id, cssClass) => {
                document.getElementById(id).classList.remove(cssClass);
            },

            /* Función pensada para activarse cuando un input pierde su focus */
            blur: (id, event) => {
                let object = document.getElementById(id);
                object.addEventListener('blur', (e) => {
                    event(object);
                });
            },

            /* Función pensada para activarse cada que ecribas un caracter en un input */
            input: (id, event) => {
                id = document.getElementById(id);
                id.addEventListener('input', (e) => {
                    e.preventDefault();
                    event(id);
                });
            },

            /* Función pensada para activarse cuando un input hace focus */
            focus: (id, event) => {
                let object = document.getElementById(id);
                object.addEventListener('focus', (e) => {
                    event(object);
                });
            },

            /* Función pensada para formularios */
            enablePostal: (object) => {
                object = jazmin.extend({
                    idTarget: '',
                    idColonia: '',
                    idCiudad: '',
                    idEstado: '',
                    phpController: '',
                    success: (e) => {},
                    execute: false
                }, object);

                let input = document.getElementById(object.idTarget);
                let ciudad = document.getElementById(object.idCiudad);
                let estado = document.getElementById(object.idEstado);

                // Colocamos los campos en modo de solo lectura
                ciudad.setAttribute("readonly", true);
                estado.setAttribute("readonly", true);

                // Se piden los 5 digitos del codigo postal
                input.addEventListener('input', () => {
                    if (input.value.length > 5) {
                        input.value = input.value.slice(0, 5);
                    }
                });

                function JcpInsert() {
                    if (jazmin.onExecute === false) {
                        jazmin.onExecute = true;
                    } else {
                        return 0;
                    }

                    var cpostal = input.value;

                    var Parameter = new FormData();
                    Parameter.append("zipCode", cpostal);

                    // iniciamos envio
                    jazmin.postAjax({
                        url: object.phpController, // ubicación del php u otro
                        data: Parameter, // Data a enviar por POST
                        success: (e) => {
                            e = JSON.parse(e);
                            if (e.result == false) {
                                // M.toast({ html: e.reason || "Sin resultados", classes: "white grey-text text-darken-3" });
                            } else {
                                //Rellenamos y deshabilitamos la edicion de input
                                ciudad.value = e.data.ciudad[0];
                                estado.value = e.data.estado[0];
                                ciudad.setAttribute("io", e.data.ciudadID[0]);
                                estado.setAttribute("io", e.data.estadoID[0]);
                                input.setAttribute("io", e.data.zipcodeID);

                                // Antes de rellenar, limpiamos
                                jazmin.html(object.idColonia, '<option value="" disabled selected>Selecciona una opción: </option>');

                                for (let i = 0; i < e.data.asentamientos.length; i++) {
                                    jazmin.htmlAppend(object.idColonia, '<option value="' + e.data.asentamientos[i] + '">' + e.data.asentamientos[i] + '</option>');
                                }

                            }


                            // actualizamos combobox y formulario
                            let elems = document.querySelectorAll('select');
                            M.FormSelect.init(elems, {});
                            M.updateTextFields();
                            object.success(e);

                            // terminamos la ejecución al finalizar la consulta
                            jazmin.onExecute = false;
                        }
                    });
                }
                // se añade el evento para que al perder el blur, se active automaticamente.
                input.addEventListener('input', (e) => {
                    e.preventDefault();
                    if (input.value.length == 5) {
                        JcpInsert();
                    }
                });

                // Si la ejecución está activa
                if (object.execute == true) {
                    JcpInsert();
                }
            },

            /*
            Esta funcion esta pensada para lograr el inicio de sesion con Facebook.
            */
            facebookLogin: (object) => {
                object = jazmin.extend({
                    idButton: ['loginFacebook'],
                    phpController: '',
                    client_id: '',
                    scopes: 'email',
                    status: true,
                    cookie: true,
                    xfbml: true,
                    version: 'v12.0',
                    success: (e) => { console.log(e); }
                }, object);

                // Cargamos el SDK.
                (function(d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "https://connect.facebook.net/es_LA/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));

                // // var btn_login = '<a href="#" id="login" class="btn btn-primary">Iniciar sesión</a>';
                // var div_session = "<div id='facebook-session'>" +
                //     "<strong></strong>" +
                //     "<img>" +
                //     "<a href='#' id='logout' class='btn btn-danger'>Cerrar sesión</a>" +
                //     "</div>";

                //Parametros para la ventana de FB
                window.fbAsyncInit = function() {
                    FB.init({
                        appId: object.client_id,
                        status: object.status,
                        cookie: object.cookie,
                        xfbml: object.xfbml,
                        version: object.version
                    });

                    FB.getLoginStatus(function(response) {
                        statusChangeCallback(response, function() {});
                    });

                };

                // Obtenemos el estado de facebook
                var statusChangeCallback = function(response, callback) {
                    // console.log(response);

                    if (response.status === 'connected') {
                        // getFacebookData();
                    } else {
                        callback(false);
                    }
                }

                var checkLoginState = function(callback) {
                    FB.getLoginStatus(function(response) {
                        callback(response);
                    });
                }

                // Obtenemos la información del usuario
                var getFacebookData = function() {
                    FB.api('/me?fields=id,email,first_name,last_name,middle_name,name,name_format,picture,short_name', function(response) {

                        // $('#login').after(div_session);
                        // $('#login').remove();
                        // $('#facebook-session strong').text("Bienvenido: " + response.name + " " + response.email);
                        // $('#facebook-session img').attr('src', 'http://graph.facebook.com/' + response.id + '/picture?type=large');
                        // console.log(response);

                        // Enviamos la información al controlador php
                        var datame = `social=true&Social_Network=Facebook&email=${response.email}&first_name=${response.first_name}&id=${response.id}&last_name=${response.last_name}&name=${response.name}&name_format=${response.name_format}&picture=${response.picture.data.url}`;
                        // console.log(datame);
                        jazmin.postAjax({
                            url: object.phpController, // ubicación del php u otro
                            data: datame, // Data a enviar por POST
                            dataType: "serialize",
                            success: (e) => {
                                object.success(e);
                                facebookLogout();
                            }
                        });

                    });
                }

                // Función que sirve para ejecutar la ventana del login de Faceboook
                var facebookLogin = function() {
                    checkLoginState(function(data) {
                        if (data.status == 'connected') {


                            FB.login(function(response) {
                                if (response.status === 'connected') {
                                    getFacebookData();
                                }
                            }, {
                                scope: object.scopes
                            });
                        } else {
                            FB.login(function(response) {
                                if (response.status === 'connected') {
                                    getFacebookData();
                                }
                            }, {
                                scope: object.scopes
                            });
                        }
                    });
                }

                //Función para cerrar sesión
                var facebookLogout = function() {
                    checkLoginState(function(data) {
                        if (data.status === 'connected') {
                            FB.logout(function(response) {
                                // $('#facebook-session').before(btn_login);    //Inserta antes
                                // $('#facebook-session').remove();     //Elimina despues
                            });
                        }
                    });
                }

                // Control de botones.
                for (let i = 0; i < object.idButton.length; i++) {
                    jazmin.clickById(object.idButton[i], () => {
                        facebookLogin();
                    });
                }

            },

            /*
            Esta funcion esta pensada para lograr el inicio de sesion con Google.
            */
            counterscriptJaz: 0,
            prepareGoogleLogin: () => {
                // Ejecutamos solo una unica vez
                if (jazmin.counterscriptJaz == 0) {
                    let script = document.createElement('script');
                    script.src = 'https://apis.google.com/js/api:client.js';
                    script.async = false;
                    document.body.prepend(script);

                    jazmin.counterscriptJaz++;
                }
            },

            googleLogin: (object) => {
                object = jazmin.extend({
                    idButton: ['loginGoogle'],
                    client_id: '',
                    cookiepolicy: 'single_host_origin',
                    scopes: '',
                    phpController: '',
                    success: (e) => { console.log(e); }
                }, object);


                // let googleUser = {};
                // var startApp = function () {
                setTimeout(() => {
                    gapi.load('auth2', function() {
                        auth2 = gapi.auth2.init({
                            client_id: object.client_id,
                            cookiepolicy: object.cookiepolicy,
                            // Request scopes in addition to 'profile' and 'email'
                            scope: object.scopes
                        });
                        for (let i = 0; i < object.idButton.length; i++) {
                            attachSignin(document.getElementById(object.idButton[i]));
                        }
                    });
                }, 700);
                // };

                function attachSignin(element) {
                    // console.log(element.id);
                    auth2.attachClickHandler(element, {},
                        function(googleUser) {
                            // document.getElementById('name').innerText = "Signed in: " +
                            // googleUser.getBasicProfile().getName();
                            let profile = googleUser.getBasicProfile();
                            let parameters = "Social_Network=Google&idGoogle=" + profile.getId() + "&completeName=" + profile.getName() + "&name=" + profile.getGivenName() + "&lastName=" + profile.getFamilyName() + "&picture=" + profile.getImageUrl() + "&email=" + profile.getEmail() + "&social=true";


                            let ajax = new XMLHttpRequest();
                            ajax.open("POST", object.phpController, true);
                            ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                            ajax.addEventListener("load", data => {
                                if (data.target.readyState == 4 && data.target.status == 200) {
                                    // CallBack
                                    object.success(data.target.responseText);
                                }
                            });
                            ajax.send(parameters);

                        },
                        /*function (error) {
                    M.toast({html: JSON.stringify(error, undefined, 2), classes: 'rounded white grey-text text-darken-2',inDuration: 300});
                }*/
                    );
                }
            },

            /*
            Funcion creada para limitar los caracteres de un formulario entero solo con una funcion, esta funcion no interfiere con el envio de formulario.
            el atributo "nolimit" sirve para omitir ese input.
            limitWithID = [
                ["id", limit]  //limit --> number
            ]
            */
            formsLimit: (object) => {
                object = jazmin.extend({
                    maxForText: 60,
                    maxForNumber: 10,
                    maxForEmail: 60,
                    maxForPassword: 16,
                    limitWithID: null
                }, object);

                let formularios = document.getElementsByTagName('form');

                for (let i = 0; i < formularios.length; i++) {
                    if (formularios[i].getAttribute(`disable`) == null) {

                        let form = formularios[i];

                        // Recorremos cada uno de los campos
                        for (let i = 0; i < form.elements.length; i++) {
                            let field = form.elements[i];
                            let lwID = 0;

                            // Excluimos todo menos estos
                            if (typeof(object.limitWithID) == 'object' && object.limitWithID != null) {
                                for (let i = 0; i < object.limitWithID.length; i++) {
                                    if (field.id == object.limitWithID[i][0]) {
                                        lwID = 1;
                                    }
                                }

                                if (lwID == 1) {
                                    lwID = 0
                                    continue;
                                }
                            }

                            if (!(field.type == 'text' || field.type == 'number' || field.type == 'email' || field.type == 'password') || field.getAttribute('nolimit') != null) {
                                continue;
                            }

                            if (field.type == 'text') {
                                field.addEventListener('input', () => {
                                    if (field.value.length > object.maxForText) {
                                        field.value = field.value.slice(0, object.maxForText);
                                    }
                                });
                            } else if (field.type == 'number') {
                                field.addEventListener('input', () => {
                                    for (let i = 0; i < field.value.length; i++) {
                                        if (isNaN(field.value[i]) == true) {
                                            field.value = field.value.slice(0, field.value.length - 1); //Esto no permitira escribir letras
                                        } else {
                                            field.value = field.value.slice(0, object.maxForNumber); // Se aplica limite normalmente
                                        }
                                    }
                                });
                            } else if (field.type == 'email') {
                                field.addEventListener('input', () => {
                                    if (field.value.length > object.maxForEmail) {
                                        field.value = field.value.slice(0, object.maxForEmail);
                                    }
                                });
                            } else if (field.type == 'password') {
                                field.addEventListener('input', () => {
                                    // Limitamos caracteres
                                    if (field.value.length > object.maxForPassword) {
                                        field.value = field.value.slice(0, object.maxForPassword);
                                    }

                                });
                            }

                        }

                    }
                }

                //limitamos por ID
                if (typeof(object.limitWithID) == 'object' && object.limitWithID != null) {
                    for (let i = 0; i < object.limitWithID.length; i++) {
                        let field = document.getElementById(object.limitWithID[i][0]);
                        field.addEventListener('input', () => {
                            // Limitamos caracteres
                            if (field.value.length > object.limitWithID[i][1]) {
                                field.value = field.value.slice(0, object.limitWithID[i][1]);
                            }
                        });
                    }
                }

            },

            /*
            Función pensada limitar contraseñas. (Esta funcion interfiere con el envio de formularios)
        	
            validation: 1				 (por defecto)		Sin verificacion.
            validation: 2				8-16 caracteres, Mayusculas, minusculas, numeros y simbolos obligatorios.
            */
            reservedStringPassMatch: "",
            restrictPass: (id, validation) => {
                if (validation == 2) {
                    jazmin.reservedStringPassMatch = "La contraseña requiere entre 8 y 16 caracteres, mayusculas y minusculas."
                } else if (validation == 3) {
                    jazmin.reservedStringPassMatch = "La contraseña requiere entre 8 y 16 caracteres, mayusculas, minusculas y números."
                } else if (validation == 4) {
                    jazmin.reservedStringPassMatch = "La contraseña requiere entre 8 y 16 caracteres, mayusculas, minusculas, números y simbolos."
                }

                // Obtenemos Id's
                id = document.getElementById(id);

                // Verificamos mayusculas, minusculas, numeros
                function restrictedpass1() {
                    if (validation == 1) {
                        jazmin.verify = -1;
                        id.style = 'border: solid 1px green !important';
                    } else if (validation == 2) {
                        if (/^(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(id.value) == false) {
                            jazmin.verify = 0;
                            id.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            id.style = 'border: solid 1px green !important';
                        }
                    } else if (validation == 3) {
                        if (/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(id.value) == false) {
                            jazmin.verify = 0;
                            id.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            id.style = 'border: solid 1px green !important';
                        }
                    } else if (validation == 4) {
                        if (/^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(id.value) == false) {
                            jazmin.verify = 0;
                            id.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            id.style = 'border: solid 1px green !important';
                        }
                    }
                }

                //Agregamos evento para comparar
                id.addEventListener('input', () => {
                    restrictedpass1();
                });
                id.addEventListener('blur', () => {
                    restrictedpass1();
                });

            },
            /*
            Función pensada para comparar contraseñas. (Esta funcion interfiere con el envio de formularios)
        	
            validation: 1				 (por defecto)		Sin verificacion.
            validation: 2				8-16 caracteres, Mayusculas, minusculas, numeros y simbolos obligatorios.
            */
            matchPass: (firstIdPass, secondIdPass, validation = 1) => {

                if (validation == 2) {
                    jazmin.reservedStringPassMatch = "La contraseña requiere entre 8 y 16 caracteres, mayusculas y minusculas."
                } else if (validation == 3) {
                    jazmin.reservedStringPassMatch = "La contraseña requiere entre 8 y 16 caracteres, mayusculas, minusculas y números."
                } else if (validation == 4) {
                    jazmin.reservedStringPassMatch = "La contraseña requiere entre 8 y 16 caracteres, mayusculas, minusculas, números y simbolos."
                }

                // Obtenemos Id's
                firstIdPass = document.getElementById(firstIdPass);
                secondIdPass = document.getElementById(secondIdPass);

                function matchPassInput2() {
                    // Verificamos mayusculas, minusculas, numeros
                    if (validation == 1) {
                        jazmin.verify = -1;
                        firstIdPass.style = 'border: solid 1px green !important';
                        secondIdPass.style = 'border: solid 1px green !important';
                    } else if (validation == 2) {
                        if (/^(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(secondIdPass.value) == false || secondIdPass.value != firstIdPass.value) {
                            jazmin.verify = 0;
                            firstIdPass.style = 'border: solid 1px red !important';
                            secondIdPass.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            firstIdPass.style = 'border: solid 1px green !important';
                            secondIdPass.style = 'border: solid 1px green !important';
                        }
                    } else if (validation == 3) {
                        if (/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(secondIdPass.value) == false || secondIdPass.value != firstIdPass.value) {
                            jazmin.verify = 0;
                            firstIdPass.style = 'border: solid 1px red !important';
                            secondIdPass.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            firstIdPass.style = 'border: solid 1px green !important';
                            secondIdPass.style = 'border: solid 1px green !important';
                        }
                    } else if (validation == 4) {
                        if (/^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(secondIdPass.value) == false || secondIdPass.value != firstIdPass.value) {
                            jazmin.verify = 0;
                            firstIdPass.style = 'border: solid 1px red !important';
                            secondIdPass.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            firstIdPass.style = 'border: solid 1px green !important';
                            secondIdPass.style = 'border: solid 1px green !important';
                        }
                    }

                }

                function matchPassInput1() {
                    // Verificamos mayusculas, minusculas, numeros
                    if (validation == 1) {
                        jazmin.verify = -1;
                        firstIdPass.style = 'border: solid 1px green !important';
                        secondIdPass.style = 'border: solid 1px green !important';
                    } else if (validation == 2) {
                        if (/^(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(secondIdPass.value) == false || secondIdPass.value != firstIdPass.value) {
                            jazmin.verify = 0;
                            firstIdPass.style = 'border: solid 1px red !important';
                            secondIdPass.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            firstIdPass.style = 'border: solid 1px green !important';
                            secondIdPass.style = 'border: solid 1px green !important';
                        }
                    } else if (validation == 3) {
                        if (/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(secondIdPass.value) == false || secondIdPass.value != firstIdPass.value) {
                            jazmin.verify = 0;
                            firstIdPass.style = 'border: solid 1px red !important';
                            secondIdPass.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            firstIdPass.style = 'border: solid 1px green !important';
                            secondIdPass.style = 'border: solid 1px green !important';
                        }
                    } else if (validation == 4) {
                        if (/^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(secondIdPass.value) == false || secondIdPass.value != firstIdPass.value) {
                            jazmin.verify = 0;
                            firstIdPass.style = 'border: solid 1px red !important';
                            secondIdPass.style = 'border: solid 1px red !important';
                        } else {
                            jazmin.verify = -1;
                            firstIdPass.style = 'border: solid 1px green !important';
                            secondIdPass.style = 'border: solid 1px green !important';
                        }
                    }
                }

                //Agregamos evento para comparar
                secondIdPass.addEventListener('input', () => {
                    matchPassInput2();
                });
                secondIdPass.addEventListener('blur', () => {
                    matchPassInput2();
                });
                firstIdPass.addEventListener('input', () => {
                    matchPassInput1();
                });
                firstIdPass.addEventListener('blur', () => {
                    matchPassInput1();
                });
            },

            /*
            Función para extraer el valor de una etiqueta.
            */
            getVal: (id) => {
                return document.getElementById(id).value;
            },

            /*
            Función para setear el valor de una etiqueta.
            */
            setVal: (id, valor) => {
                document.getElementById(id).value = valor;
            },

            /* 
            Función pensada para el evento click.
            jazmin.clickById('id', e => {
                // Código
            });
            */
            clickById: (id, event) => {
                let input = document.getElementById(id);
                input.addEventListener("click", (e) => {
                    e.preventDefault();
                    event(input);
                });
            },

            /* 
            Función pensada para el evento click, a diferencia de el que trabaja con el Id, este retorna el objeto
            en su pocision actual, de esta forma se facilita la manipulacion individual por objeto.
            jazmin.clickByClass('classname', e => {
                // Código
            });
            */
            clickByClass: (className, event) => {
                let object = document.getElementsByClassName(className);
                for (let i = 0; i < object.length; i++) {
                    object[i].addEventListener('click', (e) => {
                        e.preventDefault();
                        event(object[i]);
                    });
                }
            },

            /* 
            Función pensada para el evento change, a diferencia de el que trabaja con el Id, este retorna el objeto
            en su pocision actual, de esta forma se facilita la manipulacion individual por objeto.
            jazmin.clickByTag('tagName', e => {
                // Código
            });
            */
            clickByTag: (tagName, event) => {
                let object = document.getElementsByTagName(tagName);
                for (let i = 0; i < object.length; i++) {
                    object[i].addEventListener('click', (e) => {
                        e.preventDefault();
                        event(object[i]);
                    });
                }
            },

            /* 
            Función pensada para el evento change.
            jazmin.changeById('id', e => {
                // Código
            });
            */
            changeById: (id, event) => {
                let input = document.getElementById(id);
                input.addEventListener("change", (e) => {
                    e.preventDefault();
                    event(input);
                });
            },

            /* 
            Función pensada para el evento change, a diferencia de el que trabaja con el Id, este retorna el objeto
            en su pocision actual, de esta forma se facilita la manipulacion individual por objeto.
            jazmin.changeByClass('classname', e => {
                // Código
            });
            */
            changeByClass: (className, event) => {
                let object = document.getElementsByClassName(className);
                for (let i = 0; i < object.length; i++) {
                    object[i].addEventListener('change', (e) => {
                        e.preventDefault();
                        event(object[i]);
                    });
                }
            },

            /* 
            Función pensada para el evento change, a diferencia de el que trabaja con el Id, este retorna el objeto
            en su pocision actual, de esta forma se facilita la manipulacion individual por objeto.
            jazmin.changeByTag('tagName', e => {
                // Código
            });
            */
            changeByTag: (tagName, event) => {
                let object = document.getElementsByClassName(tagName);
                for (let i = 0; i < object.length; i++) {
                    object[i].addEventListener('change', (e) => {
                        e.preventDefault();
                        event(object[i]);
                    });
                }
            },

            inputEnter: (id, event) => {
                let object = document.getElementById(id);
                object.addEventListener("keypress", (e) => {
                    let enter = e.keyCode;
                    if (enter == 13) {
                        e.preventDefault();
                        event(object);
                    }
                });
            },

            /* 
            Función pensada para los botones submit dentro de un formulario.
            jazmin.submit('id', e => {
                // Código
            });
            */

            submit: (idForm, event) => {
                document.getElementById(idForm).addEventListener("submit", (e) => {
                    e.preventDefault();
                    event();
                });
            },

            // Sustituir html
            html: (id, content) => {
                document.getElementById(id).innerHTML = content;
            },

            // Agregar html al final
            htmlAppend: (id, content) => {
                document.getElementById(id).insertAdjacentHTML('beforeend', content);
            },

            // Agregar html al inicio
            htmlPrepend: (id, content) => {
                document.getElementById(id).insertAdjacentHTML('afterbegin', content);
            },

            // Agregar html antes de...
            beforeHtml: (id, content) => {
                document.getElementById(id).insertAdjacentHTML('beforebegin', content);
            },

            // Agregar html después de...
            afterHtml: (id, content) => {
                document.getElementById(id).insertAdjacentHTML('afterend', content);
            },


            /*
            Función pensada para limitar un input a cierto numero de caracteres
            acepta input del tipo 'text', 'email', 'password', 'number'
            */
            characterLimit: (object) => {
                object = jazmin.extend({
                    idInput: '',
                    inputType: 'text',
                    minCharacters: 2,
                    maxCharacters: 60,
                }, object);

                let input = document.getElementById(object.idInput);

                // agregamos función dependiendo el tipo de input
                if (object.inputType == 'text' || object.inputType == 'email') {
                    input.addEventListener('input', () => {
                        if (input.value.length > object.maxCharacters) {
                            input.value = input.value.slice(0, object.maxCharacters);
                        }
                    });
                } else if (object.inputType == 'number') {
                    input.addEventListener('input', () => {
                        for (let i = 0; i < input.value.length; i++) {
                            if (isNaN(input.value[i]) == true) {
                                input.value = input.value.slice(0, input.value.length - 1); //Esto no permitira escribir letras
                            } else {
                                input.value = input.value.slice(0, object.maxCharacters); // Se aplica limite normalmente
                            }
                        }

                    });
                } else if (object.inputType == 'password') {
                    input.addEventListener('input', () => {

                        // Limitamos caracteres
                        if (input.value.length > object.maxCharacters) {
                            input.value = input.value.slice(0, object.maxCharacters);
                        }

                    });
                }
            },

            /* 
            Funcion creada para setear el contenido del atributo data de las etiquetas HTML
            recibe un objeto html, seguido del valor del data.
            jazmin.setData(".jaz","dataName");
            */
            setData: (object, val) => {
                object.dataset.value = val;
            },

            /* 
            Funcion creada para extraer el contenido del atributo data de las etiquetas HTML
            Al igual que Jquery, recibe ID(#name), Class(.name), Name(:name) y Tag(name), y el nombre del data.
            El resultado es retornado.
            ejemplo de ejecución:
            jazmin.getData(".jaz","dataName");
            */
            getData: (object, dataName) => {
                return object.getAttribute(`data-${dataName}`);
            },

            // Esta función es equivalente a $.extend() de JQuery
            extend: (byDefault, valExtend) => {
                // copiamos los valores del objeto a la variable extendida
                valExtend = Object.assign(byDefault, valExtend);
                return valExtend;
            },

            /*
            Esta función está pensada para hacer una validación a todos los valores de los inputs
            ejemplo de ejecución:
            jazmin.validate({
                idForm : 'nombre del ID de tu formulario'
            });
        	
            atributos para HTML:
            optional: Sólo verificará que no hayan escritos caracteres invalidos, pero el campo lo pasará como vacío.
            nocheck: Omitirá el input y no lo verificará
            */
            validate: (id) => {
                let nameInput = "";
                let Form;
                // Almacenamos todos los inputs dentro del formulario
                if (typeof(id) == "object") {
                    Form = id.querySelectorAll("input,textarea");
                } else {
                    Form = document.getElementById(id).querySelectorAll("input,textarea");
                }



                // Recorremos y verificamos que no tengan caracteres invalidos [de forma inversa].
                for (let i = Form.length - 1; i > -1; i--) {

                    // excluiremos campos sin nombre, botones (incluido los submit), inputs file, resets, y campos deshabilitados [|| Form[i].disabled]
                    if (!Form[i].name || Form[i].type === 'file' || Form[i].type === 'reset' || Form[i].type === 'submit' || Form[i].type === 'button') {
                        continue; // Esta palabra reservada cumple la función de saltarse un ciclo dentro de un for o while.
                    }

                    // Excluimos los que sean opcionales
                    if (Form[i].getAttribute('optional') != null) {
                        if (jazmin.noInject(Form[i].value) == true) {
                            nameInput = Form[i].getAttribute('data-name');
                            if (nameInput == null) {
                                console.log(`El campo "${Form[i].name}" necesita el atributo "data-name" para mostrar mensajes de error.`);
                                nameInput = Form[i].name;
                            }
                        }
                        continue;
                    }

                    // Excluimos los que no deben ser checados
                    if (Form[i].getAttribute('nocheck') != null) {
                        continue;
                    }

                    // Revisamos caracteres especiales
                    if (jazmin.noInject(Form[i].value) == true) {
                        nameInput = Form[i].getAttribute('data-name');
                        if (nameInput == null) {
                            console.log(`El campo "${Form[i].name}" necesita el atributo "data-name" para mostrar mensajes de error.`);
                            nameInput = Form[i].name;
                        }

                        console.log(`Existen caracteres especiales en "${nameInput}".`);
                        return false;
                    }

                    // Comprobación normal
                    if (Form[i].value.trim() == "") {
                        nameInput = Form[i].getAttribute('data-name');
                        if (nameInput == null) {
                            nameInput = Form[i].name;
                            console.log(`El campo "${Form[i].name}" necesita el atributo "data-name" para mostrar mensajes de error.`);
                        }
                    }
                }
                if (nameInput.length > 0) {
                    M.toast({ html: `El campo "${nameInput}" está vacío o tiene caracteres especiales`, classes: 'white grey-text text-darken-3' });
                    return false;
                }
            },

            /* 
            Función serialize de Jquery mejorada para retornar arrays en caso de que sea opcion multiple.
            NOTA: encodeURIComponent es una función que sirve para escapar los caracteres que te pudieran dar un error al enviarlo por HTTP.
            */
            serialize: (form) => {
                // Inicializamos el array
                let array = [];

                // Recorremos cada uno de los campos
                for (let i = 0; i < form.elements.length; i++) {
                    let field = form.elements[i];

                    // excluiremos campos sin nombre, botones (incluido los submit), inputs file, resets, y campos deshabilitados "|| field.disabled"
                    if (!field.name || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') {
                        continue; // Esta palabra reservada cumple la función de saltarse un ciclo dentro de un for o while.
                    }

                    // Si nuestro campo es de múltiple selección, se obtendrán todos los valores seleccionados.
                    if (field.type === 'select-multiple') {
                        for (let n = 0; n < field.options.length; n++) {
                            if (!field.options[n].selected) {
                                continue;
                            }
                            array.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[n].value.trim()));
                        }
                    } // Si no es de opción múltiple se agrega
                    else if (field.type !== 'checkbox' && field.type !== 'radio') {
                        array.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value.trim()));
                    } // Pero si es de opción múltiple, se agrega en arreglo, esto es para evitar sustituir la información de estos
                    else if ((field.type == 'checkbox' || field.type == 'radio') && field.checked) {
                        array.push(encodeURIComponent(`${field.name}[]`) + "=" + encodeURIComponent(field.value.trim()));
                    }
                }
                // Join sirve para sustituir las ',' que separan los campos.

                return array.join('&');

                // El resultado sería algo así:   {valor=resultado&valor=resultado&valor=resultado}
            },

            /*
            Esta función sólo tiene como objetivo recibir como parametro la url del archivo a traer, y en caso de tener
            un preloader, recibir su ID para despúes retornar la DATA.
            ejemplo de ejecución:
            jazmin.getAjax({
                url: 'ubicacion de los datos a traer, ya sea un JSON o php preconfigurado a ejecutar una cosa predeterminada',
                preLoader: 'El ID de tu preloader'
            });
            */
            getAjax: (object) => {
                object = jazmin.extend({
                    url: '', // Ubicación del archivo php u otro
                    onCharge: null, // ID del preloader
                    success: (e) => { console.log(e); },
                    error: () => {},
                    loadBar: true
                }, object);

                if (object.url.trim() == '') {
                    console.log("Falta URL");
                    return false;
                }

                // Códigos
                const STATUS_OK = 200;
                const STATUS_UNAUTHORIZED = 401;
                const STATUS_NOT_FOUND = 404;
                const STATUS_INTERNAL_SERVER_ERROR = 500;
                // Petición
                let ajax = new XMLHttpRequest();
                // Abrimos pero para retornar necesitamos que sea sincrono
                ajax.open('GET', object.url, true);
                // si hay una funcionOncharge, la ejecutamos
                let content = `
				<div class="progress blue lighten-4" style="position: fixed; top: 0px; margin: 0; z-index: 10000;">
					<div class="indeterminate blue darken-2"></div>
				</div>
				`;
                // solo si se permite loadBar
                if (object.loadBar == true) {
                    jazmin.html('progressBar', content);
                }

                if (typeof(object.onCharge) == 'function') {
                    object.onCharge();
                }

                // Al terminar hacer...
                ajax.addEventListener('load', e => {
                    if (e.target.status == STATUS_OK) {
                        if (typeof(object.success) == 'function') {
                            // solo si existe loadBar
                            if (object.loadBar == true) {
                                jazmin.html('progressBar', '');
                            }
                            object.success(e.target.responseText);
                        }
                    } else if (e.target.status == STATUS_UNAUTHORIZED) {
                        console.log(`Sin autorización.`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }
                    } else if (e.target.status == STATUS_NOT_FOUND) {
                        console.log(`No se encontró el archivo en la ubicación.`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }

                    } else if (e.target.status == STATUS_INTERNAL_SERVER_ERROR) {
                        console.log(`Error interno en el servidor.`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }

                    } else {
                        console.log(`Error: ${e.target.status}`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }
                    }
                });

                if (navigator.onLine) {
                    // el navegador está conectado a la red
                    ajax.send(null);
                } else {
                    // el navegador NO está conectado a la red
                    if (object.loadBar == true) {
                        jazmin.html('progressBar', '');
                    }
                    if (typeof(object.error) == 'function') {
                        object.error();
                    }
                }
            },

            /**
             * Esta función está hecha para reemplazar Ajax con método POST de Jquery
             *
             * @param {object} object este parametro recibe las siguientes claves dentro de { }:
             * @property {string} url: La ubicación del archivo php
             * @property {string, FormData} data: La información que enviarás, ya sea un formulario y o string
             * @property {function} onCharge: se ejecutará durante la carga
             * @property {string} dataType: si en la variable "data" envias strings serializados, escribe "serialize"
             * @property {function} toFinish: se ejecutará después de terminar la carga
             * @property {function} success: recibe la información devuelta por el servidor (data) => {}
             **/
            postAjax: (object) => {
                object = jazmin.extend({
                    url: '', // ubicación del php u otro
                    data: null, // Data a enviar por POST
                    onCharge: null,
                    success: (e) => { console.log(e); },
                    error: () => {},
                    dataType: null,
                    toFinish: null,
                    loadBar: true
                }, object);

                if (object.url.trim() == '') {
                    console.log("Falta URL");
                    return false;
                }
                // Códigos
                const STATUS_OK = 200;
                const STATUS_UNAUTHORIZED = 401;
                const STATUS_NOT_FOUND = 404;
                const STATUS_INTERNAL_SERVER_ERROR = 500;
                // Petición
                let ajax = new XMLHttpRequest();
                // Abrimos pero para retornar necesitamos que sea sincrono, si no, es asincrono.
                ajax.open('POST', object.url, true);

                if (object.dataType == 'serialize' || object.dataType == 'Serialize' || object.dataType == 'SERIALIZE') {
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }
                // else if (object.dataType == 'json' || object.dataType == 'Json' || object.dataType == 'JSON') {
                // 	ajax.setRequestHeader("Content-type", "application/json;charset=UTF-8");
                // }
                // else if (object.dataType == 'text' || object.dataType == 'Text' || object.dataType == 'TEXT') {
                // 	ajax.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                // }

                // si hay una funcionOncharge, la ejecutamos
                let content = `
			<div class="progress blue lighten-4" style="position: fixed; top: 0px; margin: 0; z-index: 10000;">
        		<div class="indeterminate blue darken-2"></div>
    		</div>
			`;
                // si se permite, se pone la barra de carga
                if (object.loadBar == true) {
                    jazmin.html('progressBar', content);
                }

                if (typeof(object.onCharge) == 'function') {
                    object.onCharge();
                }

                // Al terminar hacer...
                ajax.addEventListener('load', e => {
                    if (e.target.status == STATUS_OK) {
                        if (typeof(object.success) == 'function') {
                            // solo si existe loadBar
                            if (object.loadBar == true) {
                                jazmin.html('progressBar', '');
                            }
                            object.success(e.target.responseText);
                        }
                    } else if (e.target.status == STATUS_UNAUTHORIZED) {
                        console.log(`Sin autorización.`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }
                    } else if (e.target.status == STATUS_NOT_FOUND) {
                        console.log(`No se encontró el archivo.`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }
                    } else if (e.target.status == STATUS_INTERNAL_SERVER_ERROR) {
                        console.log(`Error interno en el servidor.`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }

                    } else {
                        console.log(`Error: ${e.target.status}`);
                        // solo si existe loadBar
                        if (object.loadBar == true) {
                            jazmin.html('progressBar', '');
                        }
                        if (typeof(object.error) == 'function') {
                            object.error();
                        }

                    }
                });

                // Realizar operación, o mandamos a error
                if (navigator.onLine) {
                    // el navegador está conectado a la red
                    ajax.send(object.data);
                } else {
                    // el navegador NO está conectado a la red
                    if (object.loadBar == true) {
                        jazmin.html('progressBar', '');
                    }
                    if (typeof(object.error) == 'function') {
                        object.error();
                    }
                }

                // si hay una funcion toFinish, la ejecutamos
                if (typeof(object.toFinish) == 'function') {
                    object.toFinish();
                }
            },

            /*	
            Esta función está pensada para limitar a los checkbox a seleccionar cierto número de casillas.
            Recibe el nombre del grupo de checkboxs y el límite de casillas a seleccionar.
            Requiere de un evento click al formulario para funcionar
        	
            Ejemplo de ejecución:
            document.getElementById('form').addEventListener("click", function () {
                jazmin.limitCheckboxByName("question5", 3);
                jazmin.limitCheckboxByName("question7", 3);
            });
            */
            limitCheckboxByName: (namegroup, limit) => {
                let Checkbox = document.getElementsByName(namegroup); // obtenemos el nombre del grupo
                let Count = 0;
                for (let i = 0; i < Checkbox.length; i++) { // Recorremos, si el Check esta activo, sumamos 1 al contador

                    if (Checkbox[i].checked == true) {
                        Count++;
                    }

                    if (Count == limit + 1) { // Si llega al limite y quiere seleccionar otro, reiniciará el grupo y mostrara un mensaje.
                        for (let j = 0; j < Checkbox.length; j++) {
                            Checkbox[j].checked = false;
                        }
                        console.log(`Sólo puede seleccionar ${limit} casillas.`);
                        return false; // Retornamos false para evitar la duplicación de mensajes
                    }
                }
            },

            // Función pensada para evitar caracteres no deseados, en caso de encontrarlos retornará un TRUE
            noInject: (string) => {
                const $sql = new RegExp(/["`;$']/); // Preparamos reglas
                return $sql.test(string); //Comprobamos si hay alguno de los caracteres anteriores.
            },

            clearForm: (idForm) => {
                let Form;
                // Almacenamos todos los inputs dentro del formulario
                if (typeof(idForm) == "object") {
                    Form = idForm.querySelectorAll("input,textarea");
                } else {
                    Form = document.getElementById(idForm).querySelectorAll("input,textarea");
                }

                // Recorremos y verificamos que no tengan caracteres invalidos.
                for (let i = 0; i < Form.length; i++) {
                    // excluiremos campos sin nombre, botones (incluido los submit), inputs file, resets, y campos deshabilitados || Form[i].type === 'file'
                    if (!Form[i].name || Form[i].disabled || Form[i].type === 'reset' || Form[i].type === 'submit' || Form[i].type === 'button' || Form[i].type === 'radio' || Form[i].type === 'checkbox') {
                        continue; // Esta palabra reservada cumple la función de saltarse un ciclo dentro de un for o while.
                    }

                    // Excluimos los que no deben ser limpiados
                    if (Form[i].getAttribute('noclear') != null) {
                        continue;
                    }

                    // limpieza normal
                    if (Form[i].value) {
                        Form[i].value = '';
                    }
                }
            },

            /*	Para agregar a un formulario más claves debe de recibirse el formulario en addToForm y retornarse */
            sendForm: (object) => {
                object = jazmin.extend({ //Extendemos
                    id: '',
                    url: '',
                    addToForm: null, // esta funcion debe retornar el Form con los datos agregados
                    clearForm: true,
                    serialize: true,
                    onCharge: null,
                    success: (e) => { console.log(e); }
                }, object);

                // Antes de iniciar, iniciamos una verificacion de parametros
                if (object.id == '' || object.id == null || object.id == undefined) {
                    console.log(`sendForm: Parámetro 'id' faltante`);
                    return false;
                }
                if (object.url == '' || object.url == null || object.url == undefined) {
                    console.log(`sendForm: Parámetro 'url' faltante`);
                    return false;
                }
                if (object.addToForm != null) {
                    object.serialize = false;
                }

                // Pegamos el evento
                document.getElementById(object.id).addEventListener("submit", (e) => {
                    e.preventDefault();

                    // Checamos confirmacion de password
                    if (jazmin.verify != -1) {
                        M.toast({ html: jazmin.reservedStringPassMatch, classes: "white grey-text text-darken-3" });
                        return false;
                    }

                    // Validamos el formulario
                    let v = jazmin.validate(object.id);
                    if (v == false) {
                        return false;
                    }

                    // Obtenemos y almacenamos el fomulario en un FormData o simplemente serializamos
                    let f = document.getElementById(object.id);

                    if (object.serialize == true) {
                        f = jazmin.serialize(f);

                        jazmin.postAjax({
                            url: object.url, // ubicación del php u otro
                            data: f, // Data a enviar por POST
                            dataType: 'serialize',
                            onCharge: object.onCharge,
                            success: data => {
                                object.success(data);

                                if (object.clearForm == true) {
                                    jazmin.clearForm(object.id);
                                }
                            }
                        });
                    } else {
                        f = new FormData(f);

                        if (typeof(object.addToForm) == 'function') {
                            f = object.addToForm(f);
                        }

                        jazmin.postAjax({
                            url: object.url, // ubicación del php u otro
                            data: f, // Data a enviar por POST
                            onCharge: object.onCharge,
                            success: data => {
                                object.success(data);

                                if (object.clearForm == true) {
                                    jazmin.clearForm(object.id);
                                }
                            }
                        });
                    }

                });
            },

            /*
                Recibe como parametro varios divs, forms, u objetos a mostrar y ocultar de forma apilada.
                Esta funcion esta pensada para mostrar en forma de pasos varias secciones de una pagina,
                un ejemplo puede ser cuando quieres mostrar un formulario en partes para no saturar la pagina.
                como requisito hace falta poner una etiqueta personalizada o alguna clase personalizada para trabajar.
    	
                Ejemplo de uso:
                Esta funcion siempre se inicializa en 0, por lo que siempre mostrara la posicion 0.
                si requieres avanzar, basta con sumar 1 al contador en algun evento click.
    	
                Ejecucion por primera vez:
                objetos = document.getElementsByClassName('sector');
                jazmin.showAndHideSection(objetos);
    	
                Avanzar a un paso especifico (recibes como parametro el numero de paso al que saltarás, empieza desde el 0 ~):
                nota: una vez uses el modo especifico, los comandos next y back se deshabilitaran
                jazmin.showAndHideSection(objetos, 2);
    	
                Avanzar un paso:
                jazmin.showAndHideSection(objetos,'next');
    	
                Retroceder un paso:
                jazmin.showAndHideSection(objetos,'back');
    	
                si quieres hacer algo en el ultimo paso, como por ejemplo, enviar un Formulario, se debe agregar un parametro
                adicional, esta seria una funcion.
                Puedes adicionarla ya sea en el 'back' o  en el 'next':
    	
                Avanzar un paso y al final ejecutar una funcion:
                jazmin.showAndHideSection(objetos,'next', ()=>{
                    //	Codigo
                });
    	
            */
            showAndHideSectionCount: 0, // Variable helper
            showAndHideSection: (objets, step = null, event) => {
                let animation = 'mostrar'
                if (step == null) {
                    if (jazmin.showAndHideSectionCount < objets.length) {
                        for (let i = 0; i < objets.length; i++) {
                            objets[i].classList.add('hide');
                            objets[i].classList.add('prepare');
                        }
                        objets[jazmin.showAndHideSectionCount].classList.remove('hide');
                        objets[jazmin.showAndHideSectionCount].classList.add(animation);
                    }
                } else if (step == 'next') {
                    if (jazmin.showAndHideSectionCount == objets.length - 1) {
                        // Ocultamos anterior
                        objets[jazmin.showAndHideSectionCount - 1].classList.remove(animation);
                        objets[jazmin.showAndHideSectionCount - 1].classList.add('hide');
                        // Mostramos el siguiente
                        objets[jazmin.showAndHideSectionCount].classList.remove('hide');
                        objets[jazmin.showAndHideSectionCount].classList.add(animation);

                        if (typeof(event) == 'function') {
                            jazmin.showAndHideSectionCount = 0;
                            event();
                        }
                    } else if (jazmin.showAndHideSectionCount < objets.length) {
                        jazmin.showAndHideSectionCount++;
                        // Ocultamos anterior
                        objets[jazmin.showAndHideSectionCount - 1].classList.remove(animation);
                        objets[jazmin.showAndHideSectionCount - 1].classList.add('hide');
                        // Mostramos el siguiente
                        objets[jazmin.showAndHideSectionCount].classList.remove('hide');
                        objets[jazmin.showAndHideSectionCount].classList.add(animation);
                    }
                } else if (step == 'back') {
                    if (jazmin.showAndHideSectionCount == 0) {
                        // Ocultamos pregunta actual
                        objets[jazmin.showAndHideSectionCount + 1].classList.remove(animation);
                        objets[jazmin.showAndHideSectionCount + 1].classList.add('hide');
                        // Mostramos pregunta anterior
                        objets[jazmin.showAndHideSectionCount].classList.remove('hide');
                        objets[jazmin.showAndHideSectionCount].classList.add(animation);
                    } else if (jazmin.showAndHideSectionCount > 0) {
                        jazmin.showAndHideSectionCount--;
                        // Ocultamos pregunta actual
                        objets[jazmin.showAndHideSectionCount + 1].classList.remove(animation);
                        objets[jazmin.showAndHideSectionCount + 1].classList.add('hide');
                        // Mostramos pregunta anterior
                        objets[jazmin.showAndHideSectionCount].classList.remove('hide');
                        objets[jazmin.showAndHideSectionCount].classList.add(animation);
                    }
                } else if (typeof(step) == 'number') {
                    jazmin.showAndHideSectionCount = step;
                    // Ocultamos todas
                    for (let i = 0; i < objets.length; i++) {
                        objets[i].classList.remove(animation);
                        objets[i].classList.add('hide');
                    }
                    // Mostramos la indicada
                    objets[jazmin.showAndHideSectionCount].classList.remove('hide');
                    objets[jazmin.showAndHideSectionCount].classList.add(animation);
                }
            }
        };
        return jazmin;
    }

    if (typeof window.jazmin === 'undefined') {
        window.jazmin = inicio();
    } else {
        console.log('Jazmin está siendo llamada 2 veces o más, verifique su código.');
    }
})(window, document);

// Utilidades css
const jhead = document.getElementsByTagName('head')[0];
const jcss = `
<style>
	@charset "UTF-8";
	.prepare{
		will-change: transform, opacity !important;
	}
	.mostrar{
		animation: mostrar 0.5s;
	}
	@keyframes mostrar{
		0%{opacity: 0;}
	}

	.mostrar2 {
		animation: mostrar2 .2s;
	}
	@keyframes mostrar2 {
		from {
	
			transform: scale(0.9);
			opacity: 0.1;
		}
		to  
		{
				transform: scale(1);
				opacity: 1;
		}
	}
</style>`;
jhead.insertAdjacentHTML('beforeend', jcss);

const jbody = document.getElementsByTagName('body')[0];
// contenedor para barra de progreso
const progressBarJ = `
	<div id="progressBar"></div>
`;
jbody.insertAdjacentHTML('beforeend', progressBarJ);