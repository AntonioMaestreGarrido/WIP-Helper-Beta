//containerName nombre del div a buiscar
//constdatos array con los datos
//campos especifica que columnas se van a renderizar
export function creaTabla(containerName, constdatos, campos) {
  if (constdatos.length<=0){return}
  //purgaObj(constdatos, campos);
  //let datos = purgaObj(constdatos, campos);
  const container = document.getElementById(containerName);

  const filas = constdatos.length;
  const columnas = campos.length;

  let tabla = document.createElement("table");
  tabla.id = `${containerName}Table`;

  let cabecera = document.createElement("tr");
  for (const key in campos) {
    let celda = document.createElement("th");
    celda.innerText =campos[key];
    cabecera.appendChild(celda);
  }

  tabla.appendChild(cabecera);
  // console.log(constdatos[0].length)=8
  // console.log(constdatos.length)=3

  const tbody = document.createElement("tbody");


  constdatos.forEach((ele,index) => {
    let pictureContainer=document.createElement("div")
    let picture=document.createElement("img")
    picture.classList.add("miniPicture")
    console.log(ele)
    console.log(ele.alias)
    picture.setAttribute("src",`https://internal-cdn.amazon.com/badgephotos.amazon.com/?uid=${ele.alias.replace("@amazon.com","")}`)
    
    let linea = document.createElement("tr");
    linea.appendChild(picture)
    campos.forEach((key)=>{
      let celda = document.createElement("td");
      let txt=ele[key]
      console.log( typeof(txt))
      if(typeof(txt)==="string"){
        txt= txt.replace("@amazon.com","")
      }
      celda.innerText = txt;
      linea.appendChild(celda);
      
    })
    
    tbody.appendChild(linea);
  });
  let celda = document.createElement("th");
  celda.innerText ="Picture";
  //eElement.insertBefore(newFirstElement, eElement.firstChild);
  cabecera.insertBefore( cabecera.appendChild(celda),cabecera.firstChild)
  tabla.appendChild(tbody);
  container.appendChild(tabla);
}
function purgaObj(arrayObj, lista = []) {
  arrayObj.forEach((ele) => {
    ele.alias=ele.alias.replace("@amazon.com","")
    for (const key in ele) {
      console.log(key);
      
      if (lista.includes(key)) {
        console.log(key);
        console.log(ele[key]);
      } else {
        delete ele[key];
      }
    }
  });
  console.log(arrayObj);
  return arrayObj;
}
