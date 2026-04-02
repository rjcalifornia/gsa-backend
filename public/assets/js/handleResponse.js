/**
 * Inserta los errores en el Help apropiado de campos
 * @param {array} errors Array con campos y sus msjs de error
 * @returns void
 */
 function showFormErrors(errors) {
    // Extrae array de propiedades del objeto errors
    let keys = Object.keys(errors);
    let msgSwal = "";
    // Recorremos todas las propiedades del objeto
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // Se extrae su elemento informativo en el form
      // ejemplo $("#nombreHelp").html("El nombre es obligatorio");
      $("#" + key + "Help").html(errors[key]);
      // Se preparan los mensajes para mostrarlos tambien con swal
      msgSwal += `<p>${errors[key]}</p>`;
    }
    return Swal.fire({
      title: 'Se encontraron errores',
      text: 'Favor corregir los siguientes puntos',
      icon: 'warning',
      html: msgSwal,
    });
  }
  
  
  
  
  /**
   * Inserta los errores en el Help apropiado de campos de un form en especifico
   * @param {array} errors Array con campos y sus msjs de error
   * @param {Form} form Form para filtrar los campos e insertar el error apropiado
   */
  function showSpecificFormErrors(errors, form) {
    // Extrae array de propiedades del objeto errors
    let campos = Object.keys(errors);
    let msgSwal = "";
    // Recorremos todas las propiedades del objeto
    for (let i = 0; i < campos.length; i++) {
      const campo = campos[i];
      const msj = errors[campo];
      // Se preparan los mensajes para mostrarlos tambien con swal
      msgSwal += `<p>${msj}</p>`;
      // Se extrae su elemento informativo en el form especifico
      // Ejemplo formCrear input[name="nombre"]
      const element = form.querySelector(`small[name="${campo}Help"]`);
      if (element) {
        element.innerHTML = msj;
      }
    }
    return Swal.fire({
      title: 'Se encontraron errores',
      text: 'Favor corregir los siguientes puntos',
      icon: 'warning',
      html: msgSwal,
    });
  }
  
  function showSuccesMessage(msg) {
    return Swal.fire({
      title: 'Exito',
      text: msg,
      icon: 'success',
    });
  }
  
  function showSucessMessageWithTimeout(msg, time) {
    time *= 1000;
    return Swal.fire({
      title: 'Exito',
      text: msg,
      icon: 'success',
      timer: time,
      timerProgressBar: true,
    });
  }
  function showLoadingMessageWithTimeout(title, message, icon, time) {
    time *= 1000;
    return Swal.fire({
      title: title,
      text: message,
      icon: icon,
      timer: time,
      timerProgressBar: true,
    });
  }
  
  function showGenericError(error) {
    console.error(error);
    return Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error, intentar de nuevo',
      icon: 'error',
    });
  }
  
  function showDefault(title, message, icon) {
      console.error(message);
      return Swal.fire({
        title: title,
        text: message,
        icon: icon,
        allowOutsideClick: false,
      });
    }
  
  
    function formFieldValidation(formulario){
        if ($(formulario)[0].checkValidity() == false) {
            showDefault('Atenci&oacute;n:','Datos del formulario contiene errores, por favor revise', 'info');
          }else{
              showLoadingMessageWithTimeout('Atenci&oacute;n:','Procesando solicitud, por favor espere...', 'info', 0.1);
             // Swal.showLoading();
          }
  
          }