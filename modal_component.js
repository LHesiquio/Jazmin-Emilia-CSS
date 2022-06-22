const __modal = {

        extend: (byDefault, valExtend) => {
            valExtend = Object.assign(byDefault, valExtend);
            return valExtend;
        },

        // optimize es booleano
        openThis: (modalID, optimize = null, object = false) => {
            // abrimos el modal correspondiente
            let modalOverlay = document.getElementById(modalID);
            let modal = modalOverlay.firstElementChild;
            let mainContent = modal.firstElementChild;
            modalOverlay.classList.remove("hide");
            modal.classList.add("showModal");
            document.body.classList.add('overflowhid');

            if (optimize === false) {
                mainContent.classList.remove('hide');
            }

            // Al finalizar la animación de apertura
            function handleAnimationEnd() {
                modal.classList.remove('animated', 'showModal');
                modal.removeEventListener('animationend', handleAnimationEnd);
                // optimizamos modal
                if (optimize === true) {
                    mainContent.classList.remove('hide');
                }
                if (object != false) {
                    if (typeof(object.onOpenEnd) == 'function') {
                        object.onOpenEnd();
                    }
                }
            }
            modal.addEventListener('animationend', handleAnimationEnd);
        },

        // optimize es booleano
        closeThis: (modalID, optimize = null, object = false) => {
            let modalOverlay = document.getElementById(modalID);
            let modal = modalOverlay.firstElementChild;
            let mainContent = modal.firstElementChild;
            if (optimize === true) {
                mainContent.classList.add('hide');
            }
            modalOverlay.classList.remove("hide");
            modal.classList.remove("showModal");
            modal.classList.add('hideModal');
            document.body.classList.remove('overflowhid');

            // Al finalizar la animacion de cerrado
            function handleAnimationEnd() {
                modal.classList.remove('animated', 'hideModal');
                modal.removeEventListener('animationend', handleAnimationEnd);
                modalOverlay.classList.add('hide');
                if (optimize === false) {
                    mainContent.classList.add('hide');
                }
                if (object != false) {
                    if (typeof(object.onCloseEnd) == 'function') {
                        object.onCloseEnd();
                    }
                }
            }
            modal.addEventListener('animationend', handleAnimationEnd);
        },

        // <!-- Modal Structure -->
        // <div id="modal" class="shadow hide">
        //     <div class="main-modal">
        //         <div class="main-content">
        //         </div>
        //     </div>
        // </div>

        // Clase para ejecutar modal
        // modalComponent-trigger       Acompañado de un atributo data-target="idDelModalAEjecutar"

        // Clase para cerrar modal
        // modalComponent-close         Acompañado de un atributo data-target="idDelModalAEjecutar"

        full: (object) => {
            object = __m.extend({
                onOpenStart: false,
                onOpenEnd: false,
                onCloseStart: false,
                onCloseEnd: false
            }, object);

            // Iniciamos preparativos
            let ini = document.querySelectorAll('.shadow');
            for (let i = 0; i < ini.length; i++) {
                ini[i].classList.add("hide");
            }
            let ini2 = document.querySelectorAll('.main-content');
            for (let i = 0; i < ini.length; i++) {
                ini2[i].classList.add("hide");
            }

            // abrir modal con varios botones
            let buttonOpen = document.querySelectorAll('.modalComponent-trigger');
            for (let i = 0; i < buttonOpen.length; i++) {
                buttonOpen[i].addEventListener('click', function() {
                    if (typeof(object.onOpenStart) == 'function') {
                        object.onOpenStart();
                    }

                    // abrimos el modal correspondiente
                    let modalName = buttonOpen[i].getAttribute('data-target');
                    __modal.openThis(modalName, true, object);
                });
            }

            // cerrar modal con varios botones
            let buttonClose = document.querySelectorAll('.modalComponent-close');
            for (let i = 0; i < buttonClose.length; i++) {
                buttonClose[i].addEventListener('click', function() {
                    if (typeof(object.onCloseStart) == 'function') {
                        object.onCloseStart();
                    }

                    // cerramos el modal correspondiente
                    let modalName = buttonClose[i].getAttribute('data-target');
                    __modal.closeThis(modalName, true, object);
                });
            }
        },

        // <!-- Modal Structure Alert -->
        // <div id="modalAlert" class="alert-modalComponent hide">
        //     <div class="alert-modal">
        //          <div class="main-content" style="width: 100%;">
        //              <h4 class="grey-text text-darken-3" style="font-size: 1.1rem; font-weight: 500; margin-top: 0;">¿Desea eliminar?</h4>
        //              <span class="grey-text text-darken-1" style="font-size: 0.9rem; font-weight: 500;">Los cambios no podrán ser revertidos</span>
        //              <div style="position: absolute; bottom: 1rem; right: 1.5rem;">
        //                  <button data-target="modalAlert" class="modalAlert-close btn blue waves-effect z-depth-0 right"
        //                      style="margin-left: 12px;">Aceptar</button>
        //                  <button data-target="modalAlert" class="modalAlert-close waves-effect btn-flat right blue-text"
        //                      style="line-height: 34px;">Cancelar</button>
        //              </div>
        //          </div>
        //      </div>
        // </div>

        // Clase para ejecutar modal
        // modalAlert-trigger       Acompañado de un atributo data-target="idDelModalAEjecutar"

        // Clase para cerrar modal
        // modalAlert-close         Acompañado de un atributo data-target="idDelModalAEjecutar"
        alert: (object) => {
            object = __m.extend({
                onOpenStart: false,
                onOpenEnd: false,
                onCloseStart: false,
                onCloseEnd: false
            }, object);

            // Iniciamos preparativos
            let ini = document.querySelectorAll('.alert-modalComponent');
            for (let i = 0; i < ini.length; i++) {
                ini[i].classList.add("hide");
            }
            ini = document.querySelectorAll('.alert-content');
            for (let i = 0; i < ini.length; i++) {
                ini[i].classList.add("hide");
            }

            // abrir modal con varios botones
            let buttonOpen = document.querySelectorAll('.modalAlert-trigger');
            for (let i = 0; i < buttonOpen.length; i++) {
                buttonOpen[i].addEventListener('click', function() {
                    if (typeof(object.onOpenStart) == 'function') {
                        object.onOpenStart();
                    }

                    // abrimos el modal correspondiente
                    let modalName = buttonOpen[i].getAttribute('data-target');
                    __modal.openThis(modalName, false, object);
                });
            }

            // cerrar modal con varios botones
            let buttonClose = document.querySelectorAll('.modalAlert-close');
            for (let i = 0; i < buttonClose.length; i++) {
                buttonClose[i].addEventListener('click', function() {
                    if (typeof(object.onCloseStart) == 'function') {
                        object.onCloseStart();
                    }

                    // cerramos el modal correspondiente
                    let modalName = buttonClose[i].getAttribute('data-target');
                    __modal.closeThis(modalName, false, object);
                });
            }

            // cerrar modal alert con overlay
            let modalOverlayAlertClose = document.querySelectorAll('.alert-modalComponent');
            for (let i = 0; i < modalOverlayAlertClose.length; i++) {
                modalOverlayAlertClose[i].addEventListener('click', function(e) {
                    if (typeof(object.onCloseStart) == 'function') {
                        object.onCloseStart();
                    }

                    // si está dentro del overlay, de lo contrario
                    if (modalOverlayAlertClose[i].firstElementChild.contains(e.target)) {

                    } else {
                        // cerramos el modal correspondiente
                        let modalName = modalOverlayAlertClose[i].getAttribute('id');
                        let modalOverlay = document.querySelector(`#${modalName}`);
                        let modal = modalOverlay.firstElementChild;
                        // let mainContent = modal.firstElementChild;
                        // Esconde contenido del modal
                        // mainContent.classList.add('hide');
                        modalOverlay.classList.remove("hide");
                        modal.classList.remove("showModal");
                        modal.classList.add('hideModal');
                        document.body.classList.remove('overflowhid');

                        // Al finalizar la animacion de cerrado
                        function handleAnimationEnd() {
                            modal.classList.remove('animated', 'hideModal');
                            modal.removeEventListener('animationend', handleAnimationEnd);
                            modalOverlay.classList.add('hide');
                            if (typeof(object.onCloseEnd) == 'function') {
                                object.onCloseEnd();
                            }
                        }
                        modal.addEventListener('animationend', handleAnimationEnd);
                    }
                });
            }
        }
    },
    __m = __modal;

// Inserciones de inicio
let link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
link.rel = 'stylesheet';
document.body.append(link);

let head = document.getElementsByTagName('head')[0];
let style = `
            <style>
            .overflowhid{
                overflow: hidden !important;
            }
            .modalComponent-trigger{
                cursor: pointer;
            }

            .shadow {
            z-index: 1000;
            position: fixed;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: block;
            will-change: transform, opacity !important;
            }

            .main-modal {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 100%;
                height: 100%;
                background: #fff;
                display: block;
                overflow: auto;
                will-change: transform, opacity !important;
            }

            .main-modal .main-content{
                padding: 0px;
                width: 100%;
            }

            .main-content{
                padding: 24px;
                width: 100%;
            }

            .alert-modalComponent {
              z-index: 1001;
              position: fixed;
              top: 0px;
              left: 0px;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.6);
              display:flex;
              justify-content: center;
              align-items: center;
              will-change: transform, opacity !important;
            }
            
            .alert-modal {
              width: 37%;
              min-height: 175px;
              max-height: 99%;
              border-radius: 20px;
              background: #fff;
              display: flex;
              overflow: auto;
              will-change: transform, opacity !important;
            }
            
            .fixBtn{
                float: left !important;
                margin: 10px 10px 0 0 !important;
            }
            @media only screen and (max-width: 992px) {
              /* For Tablet: */
              .alert-modal{
                  width: 60% !important;
              }
            }
            
            @media only screen and (max-width: 600px) {
              /* For mobile phones: */
              .alert-modal{
                  width: 95% !important;
              }
              .fixBtn{
                    margin: 8px 10px 0 0 !important;
                }
            }

            .hide {
                display: none;
            }

            .hideModal {
                z-index: -1;
                opacity: 0;
                animation: hide .15s;
                /* transform: scale(0); */
            }

            @keyframes hide {
                from {
                    z-index: 2;
                    transform: scale(1);
                    opacity: 1;
                }

                to {
                    z-index: -1;
                    transform: scale(0.93);
                    opacity: 0;
                }
            }

            .showModal {
                opacity: 1;
                z-index: 2;
                animation: show .15s;

                /* transform: scale(1); */
            }

            @keyframes show {
                from {

                    transform: scale(0.93);
                    opacity: 0;
                    z-index: -1;
                }

                to {

                    transform: scale(1);
                    opacity: 1;
                    z-index: 2;
                }
            }
            </style>
            `;
head.insertAdjacentHTML('beforeend', style);