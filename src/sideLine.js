import { CONFIG } from "../index.js";
import { getAged, getDwell, getSideList } from "./api.js";

export async function setSideLine() {
  // let end
  // let start
  /////////////
  // let d=new Date()
  // if(!end){end=Math.floor(d.getTime()/1000)}
  // if(!start){start=Math.floor((d.getTime() -(10*60*60*1000))/1000)}
  // console.log( end)
  // console.log(start)




  /////////////
  let a = new Date()
  let sideList = await getSideList();
  console.log(sideList);
  const list=parseDate(sideList);
  let b= new Date()
  console.log("Tiempo de respuesta: "+  (b.getMilliseconds()-a.getMilliseconds())/1000+" segundos")
  console.log("*")
 return list
}
export async function getSideOut(site) {
  let sideTotal = 0;
  
  const dwell = await getDwell(site);
  // console.log(dwell);
  // console.log(dwell[5].packageStatus);
  let held = dwell.filter((ele) => {
    // console.log(ele.packageStatus);
    return ele.packageStatus == "Held";
  });
  held = held[0].columnToViewDataMap;
  console.log(held);
  for (const key in held) {
    // console.log(key)
    // console.log(held[key].value)
    sideTotal = sideTotal + parseInt(held[key].value);
  }
  console.log("sideline Total= " + sideTotal);
  return sideTotal;
}
export async function getSideIn(site) {
  const age = await getAged(site);
  console.log(age);
  const sideForAdd = age.filter(
    (ele) => ele.packageStatus == "Sidelined Closed"
  );
  return sideForAdd[0].columnToViewDataMap.TOTAL.value;
}
function parseDate(data) {
  const ventanas=JSON.parse( sessionStorage.getItem("windows"))
  console.log(ventanas)
  const start=new Date(ventanas.dataPointList[0].timeStampVal)
  const end=new Date(ventanas.dataPointList[ventanas.dataPointList.length-1].timeStampVal)
  console.log(start,end)
  const sideListArray = [];
  data.forEach((ele) => {
    // console.log(ele);
    ele.last = new Date(ele.lastUpdatedTime);
    let d = new Date();
    d.getMinutes();
    // console.log(ele.last.getHours(), ele.last.getMinutes());
    // let window =( ele.last.getHours()-start.getHours())*4 ;
    let window =( ele.last.getHours()-start.getHours())*4 + Math.ceil((ele.last.getMinutes()+1) / 15);
    // console.log(window);
    sideListArray.push({
      Tracking: ele.trackingId,
      hora: ele.last.getHours(),
      minutos: ele.last.getMinutes(),
      ventana: window,
    });
  });
  console.table(sideListArray)
  return windowSidelined(sideListArray)
}

function createContainer() {
  const containerSideline = document.createElement("div");
  const textSideline = document.createElement("textarea");
  textSideline.setAttribute("type", "text");
  const boton = document.createElement("button");
  boton.textContent = "Send";
  boton.addEventListener("click", (e) => parseText(textSideline.value));

  document.querySelector("body").appendChild(containerSideline);
  containerSideline.appendChild(textSideline);
  containerSideline.appendChild(boton);
}
function parseCsv(data, fieldSep, newLine) {
  fieldSep = fieldSep || ",";
  newLine = newLine || "\n";
  var nSep = "\x1D";
  var qSep = "\x1E";
  var cSep = "\x1F";
  var nSepRe = new RegExp(nSep, "g");
  var qSepRe = new RegExp(qSep, "g");
  var cSepRe = new RegExp(cSep, "g");
  var fieldRe = new RegExp(
    "(?<=(^|[" +
      fieldSep +
      '\\n]))"(|[\\s\\S]+?(?<![^"]"))"(?=($|[' +
      fieldSep +
      "\\n]))",
    "g"
  );
  var grid = [];
  data
    .replace(/\r/g, "")
    .replace(/\n+$/, "")
    .replace(fieldRe, function (match, p1, p2) {
      return p2.replace(/\n/g, nSep).replace(/""/g, qSep).replace(/,/g, cSep);
    })
    .split(/\n/)
    .forEach(function (line) {
      var row = line.split(fieldSep).map(function (cell) {
        return cell
          .replace(nSepRe, newLine)
          .replace(qSepRe, '"')
          .replace(cSepRe, ",");
      });
      grid.push(row);
    });
  //console.log('- grid: ' + JSON.stringify(grid, null, ' '));
  return grid;
}
function testCSV(array) {
  var universalBOM = "\uFEFF";

  //headers from object
  var csv = "\uFEFF";
  let fila = Object.keys(array[0]);
  for (let col of fila) {
    csv += col + ",";
  }
  csv += "\r\n";
  // rest of data
  for (let row of array) {
    let fila = Object.values(row);
    for (let col of fila) {
      if (col) {
        col = col.normalize("NFD");
      }
      csv += col + ",";
    }
    csv += "\r\n";
  }

  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([csv], { type: "text/csv" });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "demo.csv";

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}
export function windowSidelined(sideListArray){
  const windowSide=[]
  for (let i = 0; i < 50; i++) {
     windowSide[i]=0;
    
  }
  sideListArray.forEach((ele,index) => {
    let w=ele.ventana-1
    windowSide[w]=windowSide[w]+1
    //console.log(windowSide)
  });
 // console.log(windowSide)
return windowSide
}
