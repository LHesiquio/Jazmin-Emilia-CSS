/*
Creador: Luis Enrique Hernandez Hesiquio.
Nombre de la librería: EmiliaJS.
Creada el: 2019
Última modificación: 02/09/2021.
Versión actual: 1.1.7
Changelog:  
- añadido guard
*/

// Memoria temporal
document.body.prepend(document.createElement('temp'));

(function(window, document) {
    // Para utilidad
    window.__restritions = [];
    window.__nameApp = "";

    let inicio = function() {
        let elemento = null,
            pageHome = null,
            memory = ["#/home"],
            memoryCount = 0,
            memoryStatus = true,
            nameAnimation = 'scalerIn', // scalerIn and fadeIn
            marco = null,
            rutas = {},
            libreria = {
                // Funcion para animar
                animateCSS: function(element, animationName, callback) {
                    const node = element;
                    node.classList.add('animated', animationName);

                    function handleAnimationEnd() {
                        node.classList.remove('animated', animationName);
                        node.removeEventListener('animationend', handleAnimationEnd);

                        if (typeof callback === 'function') callback();
                    }

                    node.addEventListener('animationend', handleAnimationEnd);
                },

                // función para obtener ID.
                getMain: function() {
                    elemento = document.getElementsByTagName('main')[0];
                    return this; // Lo usaremos como cadena
                },

                // Prevenir que los formularios se envien.
                noSubmit: function() {
                    elemento.addEventListener('submit', function() {
                        e.preventDefault();
                    }, false);
                    return this;
                },

                enrutar: function() {
                    marco = elemento;
                    return this;
                },

                ruta: function(ruta, plantilla, controlador, patch) {
                    rutas[ruta] = {
                        'plantilla': plantilla,
                        'controlador': controlador,
                        'patch': patch
                    };

                    return this;
                },

                back: function() {

                    let back = document.getElementsByClassName('eBack');
                    if (back != undefined || back != null) {
                        for (let i = 0; i < back.length; i++) {
                            back[i].addEventListener('click', (e) => {
                                e.preventDefault();

                                if (memoryCount > 0) {
                                    memoryCount--;
                                }

                                memoryStatus = false;
                                window.location.hash = memory[memoryCount];
                            });
                        }
                    }

                },

                // elimina acentos de la url para evitar errores de llamado
                eliminarAcentos: function(texto) {
                    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                },

                extend: function(byDefault, valExtend) {
                    valExtend = Object.assign(byDefault, valExtend);
                    return valExtend;
                },

                addCss: function(href) {
                    let css = document.createElement('link');
                    css.rel = 'stylesheet';
                    css.href = href;
                    document.body.append(css);
                },

                addScript: function(src) {
                    let script = document.createElement('script');
                    script.src = src;
                    document.body.append(script);
                },

                addTempCss: function(href) {
                    let css = document.createElement('link');
                    css.rel = 'stylesheet';
                    css.href = href;
                    document.body.children[0].append(css);
                },

                executeController: function(destino) {
                    if (typeof(window[destino.controlador]) == 'function') {

                        window[destino.controlador]();
                        // se ejecuta la funcion para buscar los botones eBack para poder navegar hacia atras
                        lia.back();

                    } else {
                        setTimeout(() => {
                            console.log('Cargando controlador...');

                            // callback
                            lia.executeController(destino);
                        }, 250);
                    }
                },

                liActive: function() {
                    // obtenemos todos los li a
                    let divli = document.querySelectorAll("li a");
                    let divliReturn;
                    // limpiamos la clase active el el nodo padre y al que coincida con el hash lo activamos
                    for (let i = 0; i < divli.length; i++) {
                        if (divli[i].getAttribute("permission") == "noCheck") {
                            continue;
                        }
                        divli[i].parentNode.classList.remove("active");
                    };
                    for (let i = 0; i < divli.length; i++) {
                        if (location.hash == divli[i].getAttribute("href")) {
                            divli[i].parentNode.classList.add("active");
                            divliReturn = divli[i].parentNode; // retornamos para expandir catergoria
                        } else if (location.hash == "" && divli[i].getAttribute("href") == pageHome) {
                            divli[i].parentNode.classList.add("active");
                            // divliReturn = divli[i].parentNode; // retornamos para expandir catergoria
                        } else if (divli[i].getAttribute("permission") == "noCheck") {
                            continue;
                        }
                    };

                    return divliReturn;
                },

                selectCategoryLi: function() {
                    let categoriaClick;
                    try {
                        categoriaClick = emilia.liActive();
                        categoriaClick = categoriaClick.parentNode.parentNode.parentNode.getElementsByTagName("a")[0].getAttribute("id");
                        document.getElementById(categoriaClick).click();
                    } catch (error) {

                    }
                },


                manejadorRutas: function() {
                    // obtenemos a partir de la posición 1 para ignorar el # del hash, o simplemente asignamos el '/'
                    let hash = window.location.hash.substring(1) || '/';
                    hash = decodeURI(hash);
                    let destino = rutas[hash];
                    let progressBar = document.getElementById('progressBarE');
                    let namePage = "";

                    // barra de carga
                    let content = `
                    <div class="progress blue lighten-4" style="position: fixed; top: 0px; margin: 0; z-index: 10000;">
                        <div class="determinate blue darken-2" style="width: 90%"></div>
                    </div>
			        `;

                    if (destino && destino.plantilla) {
                        // insertamos barra
                        progressBar.innerHTML = content;

                        // Verificamos titulos
                        if (__restritions.length != undefined) {
                            for (let i = 0; i < __restritions.length; i++) {
                                // verificamos que la pagina coincida en el array
                                if (__restritions[i][0] === destino.controlador) {
                                    // almacenamos nombre
                                    namePage = __restritions[i][1];
                                }
                            }
                        } else {
                            for (var key in __restritions) {
                                for (let i = 0; i < __restritions[key].length; i++) {
                                    // verificamos que la pagina coincida en el array
                                    if (__restritions[key][i][0] === destino.controlador) {
                                        // almacenamos nombre
                                        namePage = __restritions[key][i][1];
                                    }
                                }
                            }
                        }


                        //Fetch
                        fetch(destino.plantilla)
                            .then(res => res.text())
                            .then(data => {
                                // Cambiamos titulo
                                document.getElementsByTagName("title")[0].innerHTML = `${namePage} - ${__nameApp}`;
                                // Insertamos página
                                marco.innerHTML = data;
                                // Animacion
                                lia.animateCSS(marco, nameAnimation);
                                // Dependencia con jazmin
                                if (jazmin.verify == 0) {
                                    jazmin.verify = -1;
                                }
                                // cerramos barra de carga
                                progressBar.innerHTML = '';

                                // limpiamos y agregamos controlador temporal
                                document.getElementsByTagName("temp")[0].innerHTML = "";
                                lia.addTempCss(`${destino.patch}${destino.controlador}.css`);

                                // se ejecuta la memoria temporal de ultima vez
                                if (memoryStatus == true) {
                                    memoryCount++;
                                    memory[memoryCount] = window.location.hash;
                                } else {
                                    memoryStatus = true;
                                }

                                // Realizamos un Scroll a la posicion 0
                                window.scroll({
                                    top: 0,
                                    left: 0,
                                    behavior: 'smooth'
                                });

                                // función para mantener activo el <li class="active"> en el menu
                                try {
                                    emilia.liActive();
                                } catch (error) {
                                    // console.log("No se encontró menú de opciones");
                                }
                                // Experimental en esta version
                                lia.back();

                                // Ejecutamos controlador
                                lia.executeController(destino);
                            });

                    } else {
                        // esta instrucción sirve para que en caso de no cargar correctamente el main, emilia reintente cargar
                        setTimeout(() => {
                            let divs = document.getElementsByTagName("main")[0].getElementsByTagName("div");
                            if (divs.length == 0) {
                                window.location.hash = pageHome;
                                lia.selectCategoryLi();
                            }
                        }, 150);
                    }
                },

                /*
                Esta función sirve para cargar los módulos en modo SPA
                let array = [
                    ["module", "title"],
                    ["module", "title"],
                    ["module", "title"]
                ];
                */
                processor: function(object) {
                    object = lia.extend({
                        nameApp: null,
                        hash: [],
                        route: 'modules',
                        home: true,
                        clean: true,
                        footer: null,
                        sidenav: null,
                        success: null
                    }, object);
                    // limpiamos header y footer
                    document.getElementsByTagName("header")[0].innerHTML = "";
                    document.getElementsByTagName("footer")[0].innerHTML = "";

                    // insertamos header y footer cuando se requiera
                    if (object.header != null) {
                        fetch(`${object.header}.html`)
                            .then(res => res.text())
                            .then(data => {
                                // Insertamos data
                                document.getElementsByTagName("header")[0].innerHTML = data;
                            });
                        lia.addScript(`${object.header}.js`);
                    }
                    if (object.footer != null) {
                        fetch(`${object.footer}.html`)
                            .then(res => res.text())
                            .then(data => {
                                // Insertamos data
                                document.getElementsByTagName("footer")[0].innerHTML = data;
                            });
                        lia.addScript(`${object.header}.js`);
                    }

                    // Limpiamos permisos en caso de requerirlo
                    if (object.clean == true) {
                        rutas = {};
                    }

                    let hashAux = '';
                    let patch = '';

                    // recorremos los permisos
                    for (let i = 0; i < object.hash.length; i++) {

                        // Limpiamos acentos del array de modulos
                        hashAux = lia.eliminarAcentos(object.hash[i][0]);
                        patch = `${object.route}/${hashAux}/`;

                        // autoload script
                        lia.addScript(`${patch}${hashAux}.js`);

                        // ejecutamos home una sola vez en caso de que se requiera un Home
                        if (i == 0 && object.home == true) {
                            lia.getMain().enrutar().ruta(``, `${patch}${hashAux}.html`, hashAux, patch);
                            lia.getMain().enrutar().ruta(`/`, `${patch}${hashAux}.html`, hashAux, patch);
                            lia.getMain().enrutar().ruta(`/home`, `${patch}${hashAux}.html`, hashAux, patch);
                        }

                        // Colocamos rutas obligatorias recibidas
                        lia.getMain().enrutar().ruta(`/${hashAux}`, `${patch}${hashAux}.html`, hashAux, patch);

                        hashAux = "";
                    }

                    // Agregamos a arreglo global
                    __restritions = object.hash;

                    // Damos nombre a la aplicación
                    if (object.nameApp != null) {
                        __nameApp = object.nameApp;
                    }

                    // Cambiamos titulo temporalmente
                    document.getElementsByTagName("title")[0].innerHTML = __nameApp;

                    // Ejecutamos pagina
                    lia.manejadorRutas();
                },

                /*
                Esta función sirve para cargar los módulos en modo SPA de forma extendida.
                Las claves header y footer reciben como parametro la ubicacion y archivo a ejecutar, asegurate
                de tener un .html y un .js en el directorio, ya que son obligatorios.
                Ejemplo de parametro que recibe: "path/archivo" sin extension.

                Ejemplo de array que recibe en hash:
                la posicion 3 define como aparecera en el sidenav: por defecto esta en false.
                false: se apila normalmente.
                true: se apila fuera de la categoria.
                "hide": se oculta (tendras que acceder manualmente mediante un boton)
                let array = {
                    example: [
                        ["module", "title", "icon", false || true || "hide"],
                        ["module", "title", "icon", false || true || "hide"]
                    ],
                    example2: [
                        ["module", "title", "icon", false || true || "hide"],
                        ["module", "title", "icon", false || true || "hide"]
                    ],
                }
                */
                extendedProcessor: function(object) {
                    object = lia.extend({
                        nameApp: null,
                        hash: null,
                        route: 'modules',
                        home: true,
                        clean: true,
                        header: null,
                        footer: null,
                        sidenav: null,
                        success: null
                    }, object);
                    // limpiamos header y footer y main
                    document.getElementsByTagName("main")[0].innerHTML = "";
                    document.getElementsByTagName("header")[0].innerHTML = "";
                    document.getElementsByTagName("footer")[0].innerHTML = "";

                    // insertamos header y footer cuando se requiera
                    if (object.header != null) {
                        fetch(`${object.header}.html`)
                            .then(res => res.text())
                            .then(data => {
                                // Insertamos data
                                document.getElementsByTagName("header")[0].innerHTML = data;
                            });
                        lia.addScript(`${object.header}.js`);
                    }
                    if (object.footer != null) {
                        fetch(`${object.footer}.html`)
                            .then(res => res.text())
                            .then(data => {
                                // Insertamos data
                                document.getElementsByTagName("footer")[0].innerHTML = data;
                            });
                        lia.addScript(`${object.header}.js`);
                    }

                    // Limpiamos permisos en caso de requerirlo
                    if (object.clean == true) {
                        rutas = {};
                    }

                    let hashAux = '';
                    let patch = '';
                    let positionFor = 0;
                    // recorremos los permisos
                    for (var key in object.hash) {
                        // console.log(key);
                        // console.log(object.hash[key]);

                        // recorremos array interno en cada clave
                        for (let i = 0; i < object.hash[key].length; i++) {
                            // Limpiamos acentos del array de modulos
                            hashAux = lia.eliminarAcentos(object.hash[key][i][0]);
                            patch = `${object.route}/${hashAux}/`;

                            // autoload script
                            lia.addScript(`${patch}${hashAux}.js`);

                            // ejecutamos home una sola vez en caso de que se requiera un Home
                            if (positionFor == 0 && object.home == true) {
                                // lia.getMain().enrutar().ruta(``, `${patch}${hashAux}.html`, hashAux, patch);
                                // lia.getMain().enrutar().ruta(`/`, `${patch}${hashAux}.html`, hashAux, patch);
                                // lia.getMain().enrutar().ruta(`/home`, `${patch}${hashAux}.html`, hashAux, patch);

                                // agregamos pagina principal
                                pageHome = `#/${hashAux}`;
                            }

                            // Colocamos rutas obligatorias recibidas
                            lia.getMain().enrutar().ruta(`/${hashAux}`, `${patch}${hashAux}.html`, hashAux, patch);

                            hashAux = "";
                            positionFor++;
                        }
                    }

                    // Agregamos a arreglo global
                    __restritions = object.hash;

                    // Damos nombre a la aplicación
                    if (object.nameApp != null) {
                        __nameApp = object.nameApp;
                    }

                    // Cambiamos titulo temporalmente
                    document.getElementsByTagName("title")[0].innerHTML = __nameApp;

                    // colocamos sidenav
                    setTimeout(() => {
                        if (object.sidenav != null) {
                            object.sidenav = document.getElementById(object.sidenav);
                            let parentSidenav = object.sidenav;
                            let alternContent = '';

                            // preparamos contenedor de listas
                            let content = `<li class="no-padding">
                            <ul id="newTargetSidenav" class="collapsible collapsible-accordion"></ul>
                            </li>`;
                            object.sidenav.insertAdjacentHTML('beforeend', content);

                            // actualizamos a contenedor de listas
                            object.sidenav = document.getElementById("newTargetSidenav");

                            // recorremos los permisos
                            for (var key in object.hash) {

                                content = `
                                        <li>
                                            <a permission="noCheck" id="li_${key}" class="collapsible-header">${key}<i class="material-icons">arrow_drop_down</i></a>
                                            <div class="collapsible-body">
                                                <ul>
                                `;

                                // recorremos array interno en cada clave
                                for (let i = 0; i < object.hash[key].length; i++) {
                                    // Limpiamos acentos del array de modulos
                                    hashAux = lia.eliminarAcentos(object.hash[key][i][0]);

                                    if (object.hash[key][i][3] == true) {
                                        alternContent = `<li><a class="sidenav-close fixText line-1" href="#/${hashAux}"><i class="material-icons">${object.hash[key][i][2] || ""}</i>${object.hash[key][i][1]}</a></li>`;
                                        parentSidenav.insertAdjacentHTML('beforeend', alternContent);
                                        continue;
                                    } else if (object.hash[key][i][3] == "hide") {
                                        continue;
                                    }
                                    content += `<li><a class="sidenav-close fixText line-1" href="#/${hashAux}"><i class="material-icons">${object.hash[key][i][2] || ""}</i>${object.hash[key][i][1]}</a></li>`;

                                }
                                content += `
                                                </ul>
                                            </div>
                                        </li>
                                `;
                                object.sidenav.insertAdjacentHTML('beforeend', content);
                            }

                            setTimeout(() => {
                                lia.selectCategoryLi();
                            }, 150);
                        }

                        // ejecutamos función
                        if (typeof(object.success) == 'function') {
                            object.success();
                        }
                    }, 400);


                    // Ejecutamos pagina
                    lia.manejadorRutas();
                }

            };
        return libreria;
    }

    if (typeof window.emilia === 'undefined') {
        window.emilia = window.lia = inicio();

        // Mientra la página carga ejecutamos el controlador de rutas
        // window.addEventListener('load', lia.manejadorRutas, false);
        // Escuchamos el hash para ejecutar el controlador de rutas
        window.addEventListener('hashchange', lia.manejadorRutas, false);
    } else {
        console.log('Emilia está siendo llamada 2 veces o más, verifique su código.');
    }
})(window, document);

// Utilidades css
const ehead = document.getElementsByTagName('head')[0];
const ecss = `
<style>
@charset "UTF-8";
.scalerIn {
    animation: scalerIn .2s;
}

@keyframes scalerIn {
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

  .fadeIn{
    animation: fadeIn 1s;
  }
  @keyframes fadeIn{
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
  }
</style>`;
ehead.insertAdjacentHTML('beforeend', ecss);

// Incluyendo barra
const Ebody = document.getElementsByTagName('body')[0];
const progressBar = `
  <div id="progressBarE"></div>
`;
Ebody.insertAdjacentHTML('beforeend', progressBar);