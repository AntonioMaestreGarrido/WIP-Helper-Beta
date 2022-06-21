//containerName nombre del div a buiscar
//constdatos array con los datos
//campos especifica que columnas se van a renderizar
export function creaTabla(containerName, constdatos, campos) {
  
  const container = document.getElementById(containerName);

  const filas = campos.length;
  const columnas = Object.keys(constdatos).length;

  let tabla = document.createElement("table");
  tabla.id = `${containerName}Table`;

  let cabecera = document.createElement("tr");
  for (let i = 0; i < campos.length; i++) {
    let celda = document.createElement("th");
    let index = campos[i];
    let contenido = constdatos[0][index];
    celda.innerText = contenido;
    cabecera.appendChild(celda);
    
  }
  tabla.appendChild(cabecera);
  // console.log(constdatos[0].length)=8
  // console.log(constdatos.length)=3

  const tbody = document.createElement("tbody");
  for (let i = 1; i < constdatos.length; i++) {
    let linea = document.createElement("tr");
    linea.addEventListener("click",(e)=>alert(e.target))
    for (let j = 0; j < campos.length; j++) {
      let celda = document.createElement("td");
      let index = campos[j];
      let contenido = constdatos[i][index];
      console.log("????")
      celda.innerText = contenido;
      linea.appendChild(celda);
    }
    tbody.appendChild(linea);
  }
  tabla.appendChild(tbody);
  container.appendChild(tabla);
}
//   constdatos.filter((p,i)=>i>0).forEach((ele,index) => {
//     if(campos.includes(index)){
//     let linea = document.createElement("tr");
//     tabla.appendChild(linea);
//     ele.forEach((cel) => {
//       let celda = document.createElement("td");
//       celda.innerText = cel;
//       linea.appendChild(celda);
//     });
//     tbody.appendChild(linea);}
//   });
//   tabla.appendChild(tbody)
//   container.appendChild(tabla);

// }
