window.addEventListener('scroll', function(e) {

  /*
    ANIMAMOS HILO AZUL
  */
  
  var bloques = [1, 2, 3, 4, 5, 7]; // número de vinetas con hilo
  for (var i = 0; i < bloques.length; i++) {

    var container = "container"+bloques[i];
    var containerHilo = "container"+bloques[i]+"Hilo";
        
    window[container] = document.getElementById('vineta'+bloques[i]);
    window[containerHilo] = document.getElementById('hilo'+bloques[i]);

    var coordinatesContainer = "coordinatescontainer"+bloques[i];
    window[coordinatesContainer] = window[container].getBoundingClientRect();

    var positionScrollcontainer = "positionScrollcontainer"+bloques[i];
    window[positionScrollcontainer] = window[coordinatesContainer].top / window[coordinatesContainer].bottom;

    var percent = "percent"+bloques[i];
    window[percent] = window[positionScrollcontainer] / 0.99 * -1;

    var percentPosition = "percentPosition"+bloques[i];
    window[percentPosition] = window[percent] * 100;

    if (window[percentPosition] > 100) { window[percentPosition] = 100; }
    if (window[percentPosition] < 0) { window[percentPosition] = 0; }
    
    if (bloques[i] == '2' || bloques[i] == '3' || bloques[i] == '4'){
      window[containerHilo].style.setProperty("width", window[percentPosition]+'%');  
    } else {
      window[containerHilo].style.setProperty("height", window[percentPosition]+'%');
    }

  }

  
  /*
    MOSTRAMOS LAS RESPUESTAS POR BLOQUES
  */
  
  var respuestasContenedor = document.querySelector('#respuestas');
  var respuestasImagenes = respuestasContenedor.querySelectorAll('img');  
  
  var respuestas = [];
  for (var i = 0; i < respuestasImagenes.length; i++) {  
    respuestas.push(i+1);
  }

  for (var i = 0; i < respuestas.length; i++) {

    var coordinatesRespuesta = "coordinatesRespuesta"+respuestas[i];
    window[coordinatesRespuesta] = respuestasImagenes[i].getBoundingClientRect();
    var posicionVisible = window.innerHeight * 0.75;

    if (window[coordinatesRespuesta].top < posicionVisible){
      respuestasImagenes[i].classList.add("activo");
    } else {
      respuestasImagenes[i].classList.remove("activo");
    }
  
  }

});
