import { CONFIG } from "../index.js";
import { getAPIdata, getDwell } from "./api.js";
import { renderGeneralRates } from "./generalRatesW.js";
import { parcelList } from "./parcelList.js";
import { setSideLine, testCSV } from "./sideLine.js";

export async function renderWindowsData() {
 


  const petBody = {
    resourcePath: "/ivs/getpvadata",
    httpMethod: "post",
    processName: "induct",
    requestBody: {
      nodeId: CONFIG.site,
      cycleIds: ["CYCLE_1"],
      processPath: "induct",
    },
  };
  //const sideLined=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  const data = await getAPIdata(petBody);
  console.log(data)
  const dwell = await getDwell(CONFIG.site);
  console.log(data.error)
  if(data.error ==0 ){return }
  sessionStorage.setItem("windows", JSON.stringify(data.flowPVAData[15][2]));
  const sccData = data.flowPVAData[15];
  console.log(sccData);
  renderGeneralRates(data.flowPVAData[15][2]);
  const sideLined = await setSideLine();
  let volume = document
    .querySelector(".volumeExpected")
    .textContent.match(/(\d+)/);
  let volumenTotal = 1;
  let sideTotal=1
  //let sideMatch=document.querySelector(".sideline").textContent.match(/(\d+)/)
  let side = 0;
  // if(sideMatch){
  //  side=sideMatch[0]
  //}
  console.log("el side es ", side);
  if (volume) {
    console.log(volume);
    volumenTotal = volume[0];
  }
  //const data=sccwindowData
  console.log("wdonswdata llamado a las " + Date());

  const induction = data.flowPVAData[15][0];
  const sortation = data.flowPVAData[15][2];
  console.log(sortation.dataPointList.length);
  let v = sortation.dataPointList.length;
  let lowSortThreshold = (parseInt(volumenTotal) / v / 15) * 2;
  let totalAts = 0;
  let windowContainer = document.querySelector("#windows15Data");
  windowContainer.innerHTML = "";
  let windowInfoContainer = document.createElement("div");
  let title = document.createElement("h2");
  title.textContent = `WIP compliance`;
  windowInfoContainer.appendChild(title);
  let windowtotal = document.createElement("p");
  let windowPassed = document.createElement("p");
  let windowFailed = document.createElement("p");
  let windowNull = document.createElement("p");
  windowContainer.appendChild(windowInfoContainer);
  windowInfoContainer.appendChild(windowtotal);
  windowInfoContainer.appendChild(windowPassed);
  windowInfoContainer.appendChild(windowFailed);
  windowInfoContainer.appendChild(windowNull);

  let complience = await compliencePorCent();
  let inductAcumulu = 0;
  let stowAcumulu = 0;
  let sideAcumulu=0
  const totalData=[]
  let partialData= induction.dataPointList.map((ele, index) => {
    
    //induction.dataPointList.forEach((ele, index) => {
    // if (index === induction.dataPointList.length - 1) {
    //   return;
    // }
    if (index == 30) {
      console.log("");
    }

    let sort = sortation.dataPointList[index].metricValue;
    inductAcumulu = inductAcumulu + ele.metricValue ;
    // inductAcumulu = inductAcumulu + ele.metricValue - sideLined[index];
    stowAcumulu = stowAcumulu + sort;
    sideAcumulu=sideAcumulu+sideLined[index] 
    totalAts = totalAts + (ele.metricValue - sideLined[index] - sort); // experimentando con el side
    if (sort > lowSortThreshold) {
      //totalAts=totalAts-sort
    }
    let time = new Date(ele.timeStampVal);
    let bufferInMinutes;

    if (sort === 0) {
      bufferInMinutes = 0;
    } else bufferInMinutes = ((totalAts - side) / sort) * 15;

    //{type:"",class:"",content:""}
    let title = ` ${time.getHours()}:${String(time.getMinutes()).padEnd(
      2,
      "0"
    )}-${time.getHours()}:${String(time.getMinutes() + 15).padEnd(2, "0")} `;
    let flowRatexCent = (ele.metricValue / sort) * 100;

    if (isNaN(flowRatexCent) || flowRatexCent === Infinity) {
      flowRatexCent = 0;
    }

    let windowTime = new Date(ele.timeStampVal).getTime();
    let now = new Date().getTime();

    // console.log(now, new Date(windowTime), now > windowTime);
    // console.log(now);
    // console.log(windowTime + 15 * 60 * 1000);
    if (now > windowTime + 15 * 60 * 1000) {
      //comenatdo a falta de confirmar
      let partialWindow = createNewEle({ type: "div", class: "divContainer" });
      let timeWindowMark = createNewEle({
        type: "div",
        class: "title",
        content: title,
      });
      // console.log(index, induction.dataPointList.length - 1);

      // console.log((volumenTotal / complience.total / 15) * 2);
      if (bufferInMinutes === 30) {
        console.log("");
      }
      if (
        sort < lowSortThreshold ||
        index === induction.dataPointList.length - 1
      ) {
        timeWindowMark.classList.add("nula");
      } else {
        if (
          (bufferInMinutes >= 15 && bufferInMinutes <= 30) ||
          index == induction.dataPointList.length - 1
        ) {
          timeWindowMark.classList.add("passed");
        } else {
          timeWindowMark.classList.add("failed");
        }
      }

      //console.log(ele.timeStampVal.getHours());
      let sortData = createNewEle({
        type: "div",
        class: "windowData",
        content: `Induction=${ele.metricValue }`,
      });
      let inductData = createNewEle({
        type: "div",
        class: "windowData",
        content: `Sortattion=${sort}`,
      });
      let inductAcuData = createNewEle({
        type: "div",
        class: "windowData",
        content: `Induct Total=${inductAcumulu}`,
      });
      let sortAcuData = createNewEle({
        type: "div",
        class: "windowData",
        content: `Stow total=${stowAcumulu}`,
      });
      let AtsData = createNewEle({
        type: "div",
        class: "windowData",
        content: `AtStation=${totalAts}`,
      });
      let sideInWindow = createNewEle({
        type: "div",
        class: "windowData",
        content: `Sidelined=${sideLined[index]}`,
      });
      let sideAcumuluInWindow = createNewEle({
        type: "div",
        class: "windowData",
        content: `Total Side=${sideAcumulu}`,
      });
      let buffer = createNewEle({
        type: "div",
        class: "windowData",
        content: `Buffer=${bufferInMinutes.toFixed(1)}m`,
      });
      let flowRate = createNewEle({
        type: "div",
        class: "windowData",
        content: `FlowRate=${flowRatexCent.toFixed(2)}%`,
      });
      partialWindow.appendChild(timeWindowMark);
      partialWindow.appendChild(inductData);
      partialWindow.appendChild(sortData);
      partialWindow.appendChild(inductAcuData);
      partialWindow.appendChild(sortAcuData);
      partialWindow.appendChild(sideInWindow);
      partialWindow.appendChild(sideAcumuluInWindow);
      
      partialWindow.appendChild(AtsData);
      partialWindow.appendChild(buffer);
      partialWindow.appendChild(flowRate);
      windowContainer.appendChild(partialWindow);

      
    }return{"site":CONFIG.site,"time":ele.timeStampVal,"induccion":ele.metricValue - sideLined[index],"sort":sort,"side":sideLined[index],
  "ats":totalAts,inductAcumulu,stowAcumulu,"buffer":bufferInMinutes.toFixed(1)
  }
  });
totalData.push(partialData)
  function createNewEle(ele) {
    const newEle = document.createElement(ele.type);
    newEle.classList.add(ele.class);
    newEle.textContent = ele.content;

    return newEle;
  }
  complience = await compliencePorCent();
  console.log(complience);
  title.textContent = `WIP ${complience.txC}% `;
  windowtotal.textContent = `Windows ${complience.total}`;
  windowPassed.textContent = `Passed ${complience.pass}`;
  windowFailed.textContent = `Failed ${complience.failed}`;
  windowNull.textContent = `Null ${complience.nulas}`;
  return totalData;
}
async function compliencePorCent() {
  let pass = document.querySelectorAll(".passed").length;
  let failed = document.querySelectorAll(".failed").length;
  let txC;
  let total = pass + failed;
  let container = document.querySelectorAll(".divContainer");
  let nulas = document.querySelectorAll(".nula").length;
  let time=document.querySelector(".endTime").textContent
  // console.log(nulas.length)
  // container.forEach((ele)=>{if(ele.querySelectorAll(".passed").length>0){pass++}else{failed++}})
  // console.log(pass,failed)
  txC = ((pass * 100) / (pass + failed)).toFixed("2");
  total = pass + failed;
  if (isNaN(txC)) {
    txC = 0;
  }

  return { total, pass, failed, nulas, txC,time };
}

export async function getRanking(ExportToCSV=false) {
  let actualSite = CONFIG.site; // guarda el site actual para reinstaurarlo despues del ranking
  const sites2 = [
    "DQB2",
    "DQZ5",
    "DAS1",
    "DGA2",
    "DIC1",
    "DQA2",
    "DMA2",
    "DMA3",
    "DMA4",
    "DMA6",
    // "DMZ1",
    "DMZ2",
    "DMZ4",
    "DCZ3",
    "DCT2",
    "DCT4",
    // "DCT9",
    "DQA7",
    "DCT7",
    "DCZ4",
    "DQA4",
    "DQV6",
    "DQV2",
    "DQV1",
  ];
  let sites = [
    [
      "DCT7",
      "DQB5",
      "DQV1",
      "DQV6",
      "DQE2",
      "DGA2",
      "DQA7",
      "DGP1",
      "DQA4",
      "DMA4",
      "DCZ3",
      "DMA3",
      "DGQ1",
      "DIC1",
      "DQZ5",
      "DQB9",
      "DQV2",
      "DQB4",
      "DQV3",
      "DQA5",
      "DMA2",
      "DQA2",
      "DQB2",
      "DQZ3",
      "DZG2",
      "DQB6",
      "DCT4",
      "DQL2",
      "DMZ4",
      "DCT2",
      "DMZ2",
      "DAS1",
      "DMA6",
      "DQV8",
      "DCT5",
      "DCZ4",
    ],
    [
      "Barcelona7",
      "AMPL San Sebastian",
      "Valencia",
      "Valencia",
      "Merida2",
      "Vigo",
      "Cadiz7",
      "Almeria",
      "Sevilla 2",
      "Mostoles",
      "Tarragona3",
      "Madrid 3",
      "AMPL La Coruna",
      "DS Murcia",
      "Sevilla5",
      "Santander",
      "Alicante",
      "Pampiona",
      "Denia",
      "Granada",
      "Alcobendas",
      "Malaga",
      "Trapaga",
      "Huelva",
      "Zaragoza2",
      "AMPL Vitoria",
      "DS Rubi",
      "Valladolid2",
      "Getafe4",
      "Barcelona South",
      "Madrid2",
      "Oviedo",
      "Coslada",
      "AMPL Castellon",
      "Girona",
      "Barcelona4",
    ],
  ];

  console.log(sites);
  //  sites = rankingFrancia
   const ranking = [];
  // sites=mini

  const todosLosDatos=[]
  for (let i = 0; i < sites[0].length; i++) {
    CONFIG.site = sites[0][i];
    let partial=await renderWindowsData()
    todosLosDatos.push(partial) 
    let t = await compliencePorCent();
    console.log(t);
    ranking.push({ site: sites[0][i], percentil: t.txC, name: sites[1][i] });
    console.log("ranking en " + CONFIG.site);
  }
  console.log("listado todas")
  console.log(todosLosDatos)
  if(ExportToCSV==="yes")
  {testCSV(todosLosDatos)}
  
  console.log(ranking.sort((a, b) => b.percentil - a.percentil));

  renderRanking(ranking);
  console.log(CONFIG.site);
  CONFIG.site = actualSite;
  renderWindowsData();
  // ranking.push({ele:t.txC})
  return ranking;
}
function renderRanking(ranking) {
  console.log(ranking)
  let container = document.querySelector("#rankingcontainer");
  container.innerHTML = "";
  for (let i = 0; i < ranking.length; i++) {
    let fila = document.createElement("div");
    fila.classList.add("fila");
    let site = document.createElement("div");
    let tanto = document.createElement("div");
    let nombre = document.createElement("div");
    site.textContent = `${String(i + 1).padStart(2, "0")} - ${ranking[i].site}`;
    nombre.textContent = ranking[i].name;
    tanto.textContent = ranking[i].percentil + "%";
    fila.appendChild(site);
    fila.appendChild(nombre);
    fila.appendChild(tanto);
    container.appendChild(fila);
    document.querySelector("#ranking").appendChild(container);

    // let siteInRanking = document.createElement("div");
    // siteInRanking.textContent = `${String(i + 1).padStart(2, "0")} - ${
    //   ranking[i].site
    // } - ${ranking[i].name}- ${ranking[i].percentil}%`;
    // container.appendChild(siteInRanking);
  }
}
const mini=[[
  "DLP5",
  "DND2",
  "DWP2"],["Villeneuve",
  "Moult",
  "Nice2",

  ]

]
const rankingFrancia = [
  [
    "DLP5",
    "DND2",
    "DWP2",
    "DWV1",
    "DAO9",
    "DND1",
    "DAO2",
    "DNC3",
    "DLP4",
    "DNC1",
    "DLP2",
    "DNC2",
    "DAC2",
    "DAO1",
    "DAR1",
    "DBF1",
    "DIF6",
    "DAO3",
    "DIF2",
    "DIF3",
    "DIF4",
    "DWL1",
    "DIF5",
    "DRQ6",
    "DAR2",
    "DWP1",
    "DIF1",
    "DWP8",
    "DWB9",
    "DWP3",
    "DWP9",
    "DAR9",
    "DRQ5",
    "DLP9",
    "DRQ7",
    "DAC9",
    "DIF8",
    "DWP7",
    "DWV9",
    "DAC8",
    "DHG6",
  ],
  [
    "Villeneuve",
    "Moult",
    "Nice2",
    "Orleans",
    "Mulhouse",
    "DND1",
    "Woippy",
    "Gauchy",
    "Rivesaltes",
    "Lille",
    "Toulouse",
    "Lens",
    "Morlaas",
    "Strasbourg",
    "Lyon",
    "Longvic",
    "Noisy",
    "Fontaine",
    "Paris SE",
    "Paris SW",
    "Paris NE",
    "Nantes",
    "Osny",
    "Portes-les-Valence",
    "DAR2",
    "Marseille",
    "Paris NW",
    "Toulon",
    "Rennes",
    "DWP3_AMPL",
    "Marseille (SC)",
    "DAR9_AMPL",
    "Anse",
    "DLP9_AMPL",
    "Corbas",
    "DAC9_AMPL",
    "Moissy-Cramayel",
    "Marseille",
    "Saint-Pierre-des-Corps",
    "DAC8_AMPL",
    "Antwerpen",
  ],
];
const rankingItalia = [
  [
    "DLY1",
    "DLZ3",
    "DSG1",
    "DLO4",
    "DVN5",
    "DER5",
    "DVN6",
    "DLO5",
    "DFV2",
    "DER1",
    "DVN1",
    "DNP1",
    "DTT1",
    "DLO8",
    "DTC2",
    "DFV1",
    "DER3",
    "DVN3",
    "DPU1",
    "DVN2",
    "DLO7",
    "DER2",
    "DSI2",
    "DPI3",
    "DMR1",
    "DPI2",
    "DLG1",
    "DLZ1",
    "DSI1",
    "DRU1",
    "DUM1",
    "DTC1",
    "DLO3",
    "DLO1",
    "DLZ2",
    "DLO2",
  ],
  [
    "Cisterna di Latina",
    "Roma Magliana",
    "Cagliari",
    "Buccinasco",
    "Dese",
    "Calderara Di Reno",
    "Riese Pio X",
    "Castegnato",
    "Udine",
    "Valsamoggia",
    "Vigonza",
    "Arzano",
    "Trento",
    "Pioltello",
    "Montacchiello",
    "Pordenone",
    "Parma",
    "Vicenza",
    "Bitonto",
    "Verona",
    "Mezzate",
    "Sant'Arcangelo di Romagna",
    "Catania",
    "Grugliasco",
    "Camerano",
    "Brandizzo",
    "Genova",
    "Roma Settecamini",
    "Palermo",
    "San Giovanni Teatino",
    "Soccorso",
    "Calenzano",
    "Burago di Molgora",
    "Milano Rogoredo",
    "Pomezia",
    "Origgio",
  ],
];
export function exportFullData() {
  getRanking("yes")

  
}