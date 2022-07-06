import { getAPIdata, getAPIgetdata } from "./src/api.js";
import { checkArrived, renderGeneralRates } from "./src/generalRatesW.js";
import { drawChart, testChart, addtest, updateChart } from "./src/grafica.js";
import { parcelList } from "./src/parcelList.js";
import { setSideLine } from "./src/sideLine.js";
import { creaTabla } from "./src/tablas.js";
import {
  exportFullData,
  getRanking,
  renderWindowsData,
} from "./src/widonsData.js";
export let CONFIG;
CONFIG = getConfig();

document.getElementById("site").textContent = CONFIG.site;
function saveConfig() {
  localStorage.setItem("config", JSON.stringify(CONFIG));
}
function getConfig() {
  let config = JSON.parse(localStorage.getItem("config"));
  if (!config) {
    CONFIG = { site: document.getElementById("site").textContent };
  } else {
    CONFIG = config;
  }
  return CONFIG;
}
function isScreenLockSupported() {
  return "wakeLock" in navigator;
}
getScreenLock();
async function getScreenLock() {
  if (isScreenLockSupported()) {
    let screenLock;
    try {
      screenLock = await navigator.wakeLock.request("screen");
    } catch (err) {
      console.log(err.name, err.message);
    }
    return screenLock;
  }
}

const windowData = {
  window: 0,
  ATs: 0,
  InducAct: 0,
  StowAct: 0,
  IductTotal: 0,
  StowTotal: 0,
};
let database;

let ATsAct = 0,
  ATsMax = 0,
  ATsMin = 0,
  ATsCustom;
let StowRateAct = 0,
  StowRateMin = 0,
  StowRateMax = 0,
  StowRateCustom = 0;
let InductRateAct = 0,
  InductRateMin = 0,
  InductRateMax = 0,
  InductRateCustom = 0;
let MinutesToCheck = 0,
  MinutesToCheckCustom = 0,
  ATsAtTime = 0,
  ATsAtTimeCustom = 0;

const startButton = document.getElementById("startButton");

setupEventsListener();

function fillCustom() {
  ATsCustom = parseInt(document.getElementById("ATsCustom").textContent);

  MinutesToCheckCustom = parseInt(
    document.getElementById("MinutesToCheckCustom").textContent
  );
  InductRateCustom = parseInt(
    document.getElementById("InductRateCustom").textContent
  );
  StowRateCustom = parseInt(
    document.getElementById("StowRateCustom").textContent
  );
  ATsAtTimeCustom = parseInt(
    ((InductRateCustom - StowRateCustom) / 60) * MinutesToCheckCustom +
      ATsCustom
  );
  document.getElementById("MinCustom").textContent =
    document.getElementById("StowRateCustom").textContent / 4;
  document.getElementById("MaxCustom").textContent =
    document.getElementById("StowRateCustom").textContent / 2;
  document.getElementById("ATsAtTimeCustom").textContent = ATsAtTimeCustom;
  giveStyle();
}

async function apitest() {
  let data2;

  // await fetch(`http://localhost:3000/:${CONFIG.site}`)
  await fetch(`http://localhost:3000/main2/${CONFIG.site}`)
    .then((response) => response.json())
    .then((data) => {
      let datos = data;
      // console.log(datos);
      calculate(datos);
      sessionStorage.setItem("lastWindowData", JSON.stringify(datos));
    })
    .catch((error) => console.log("No se encuentra el servidor", error));
}
async function getDataBase() {
  await fetch("http://localhost:3000/getData")
    .then((response) => response.json())
    .then((data) => {
      database = data;
    })
    .catch((error) => console.log("No se encuentra el servidor", error));
}
async function calculate(data) {
  calculate.minute;
  calculate.windowMinute;
  if (!calculate.windowMinute) {
    calculate.windowMinute = 0;
  }
  let date = new Date();
  ATsAct = parseInt(data.ATs);
  if (document.querySelector("#checkBoxSide").checked) {
    ATsAct =
      ATsAct - parseInt(document.querySelector(".dataSideLineOut").textContent);
  }
  StowRateAct = parseInt(data.stowRate);
  InductRateAct = parseInt(data.inductRate);
  let stowRateMinute = StowRateAct / 60;
  let inductRateMinute = InductRateAct / 60;
  MinutesToCheck = 15 - (date.getMinutes() % 15);
  //console.log(InductRateAct, StowRateAct, MinutesToCheck, ATsAct);
  let ritmo = parseInt(InductRateAct - StowRateAct);
  ATsAtTime = parseInt((ritmo / 60) * MinutesToCheck + ATsAct);

  ATsMax = StowRateAct / 2;
  ATsMin = StowRateAct / 4;

  StowRateMax = parseInt(
    (MinutesToCheck * InductRateAct + 60 * ATsAct) / (15 + MinutesToCheck)
  );
  StowRateMin = parseInt(
    (MinutesToCheck * InductRateAct + 60 * ATsAct) / (30 + MinutesToCheck)
  );

  InductRateMax = parseInt(
    (60 * ATsMax - 60 * ATsAct) / MinutesToCheck + StowRateAct
  );
  InductRateMin = parseInt(
    (60 * ATsMin - 60 * ATsAct) / MinutesToCheck + StowRateAct
  );

  filltable();

  // if (calculate.minute != date.getMinutes()) {
  //   calculate.minute = date.getMinutes();
  //   const dataForActu = {
  //     InductRateAct,
  //     StowRateAct,
  //     ATsAct,
  //     ATsMax,
  //     ATsMin,
  //     hora: new Date().getHours(),
  //     minuto: new Date().getMinutes(),
  //     fecha: new Date().getDate(),
  //     epoch: Date.now(),
  //     passed: checkComply(ATsAct, StowRateAct),
  //   };
  //   console.log("se envia", dataForActu);
  //   //updateChart(dataForActu);
  //   let dataToSend = JSON.stringify(dataForActu);
  //   console.log("datato send", dataToSend);
  //   await fetch("http://localhost:3000/send", {
  //     method: "post",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(dataForActu),
  //   });
  // }
}
// comprueba si el valor de ats esta comply con el ritmo de stow
function checkComply(Ats, stow) {
  if (Ats > stow / 2 || Ats < stow / 4) {
    return false;
  }
  return true;
}

async function filltable() {
  document.getElementById("ATsAct").innerText = ATsAct;
  document.getElementById("ATsMax").innerText = ATsMax;
  document.getElementById("ATsMin").innerText = ATsMin;

  document.getElementById("StowRateAct").innerText = StowRateAct;
  document.getElementById("StowRateMax").innerText = StowRateMax;
  document.getElementById("StowRateMin").innerText = StowRateMin;

  document.getElementById("InductRateAct").innerText = InductRateAct;
  document.getElementById("InductRateMax").innerText = InductRateMax;
  document.getElementById("InductRateMin").innerText = InductRateMin;

  document.getElementById("MinutesToCheck").innerText = MinutesToCheck;

  document.getElementById("ATsAtTime").innerText = ATsAtTime;
  let buffer = Math.round((ATsAct * 60) / StowRateAct);
  if (isNaN(buffer)) {
    buffer = 0;
  }
  let bufferAtCheck = Math.round((ATsAtTime * 60) / StowRateAct);
  if (isNaN(bufferAtCheck)) {
    bufferAtCheck = 0;
  }
  document.getElementById("buffer").textContent = buffer + "m";

  document.getElementById("bufferAtCheck").textContent = bufferAtCheck + "m";

  giveStyle();
}

function giveStyle() {
  if (ATsAct > ATsMax || ATsAct < ATsMin) {
    document.getElementById("ATsAct").style.backgroundColor = "red";
  } else {
    document.getElementById("ATsAct").style.backgroundColor =
      "rgb(109, 230, 109)";
  }
  if (ATsAtTime > ATsMax || ATsAtTime < ATsMin) {
    document.getElementById("ATsAtTime").style.backgroundColor = "red";
  } else {
    document.getElementById("ATsAtTime").style.backgroundColor =
      "rgb(109, 230, 109)";
  }

  if (
    ATsAtTimeCustom > StowRateCustom / 2 ||
    ATsAtTimeCustom < StowRateCustom / 4
  ) {
    document.getElementById("ATsAtTimeCustom").style.backgroundColor = "red";
  } else {
    document.getElementById("ATsAtTimeCustom").style.backgroundColor =
      "rgb(109, 230, 109)";
  }
}

function setupEventsListener() {
  document.querySelector(".exportFullData").addEventListener("click", (e) => {
    parcelList();
  });
  document.getElementById("site").addEventListener("focusout", (e) => {
    if (e.target.textContent.toUpperCase().trim() !== CONFIG.site) {
      sessionStorage.removeItem("trucksList");
    }
    CONFIG.site = e.target.textContent.toUpperCase().trim();
    document.getElementById("site").textContent = CONFIG.site;
    saveConfig();
    renderWindowsData();
    console.log(CONFIG.site);
  });
  document
    .querySelector("#checkBoxSide")
    .addEventListener("click", (e) =>
      calculate(JSON.parse(sessionStorage.getItem("lastWindowData")))
    );
  document
    .querySelector(".getSide")
    .addEventListener("click", () => setSideLine());
  document.getElementById("test").addEventListener("click", async () => {
    const t = await getAPIgetdata("/wipData");
    console.log(t);
  });
  document.querySelector(".getRanking").addEventListener("click", getRanking);
  document
    .querySelector(".refreshTimeWindows")
    .addEventListener("click", renderWindowsData);
  document
    .getElementById("StowRateCustom")
    .addEventListener("focusout", () => fillCustom());
  document
    .getElementById("InductRateCustom")
    .addEventListener("focusout", () => fillCustom());
  document
    .getElementById("MinutesToCheckCustom")
    .addEventListener("focusout", () => fillCustom());
  document
    .getElementById("ATsCustom")
    .addEventListener("focusout", () => fillCustom());
  document
    .getElementById("showChart")
    .addEventListener("click", () => drawChart());

  startButton.addEventListener("click", () => handleStartButton());
  document.getElementById("copy").addEventListener("click", () => copyData());
  document
    .getElementById("testpos")
    .addEventListener("click", () => testChart());

  addListenerToModifierButtons();
  addListenerToFindMinMaxCuston();
  document
    .getElementById("botonGetStowersRates")
    .addEventListener("click", () => {
      getStowersRates();
    });
  document
    .getElementById("botonGetInductersRates")
    .addEventListener("click", () => {
      getInductersRates();
    });
}
async function getStowersRates() {
  let objFlat = [];
  const StowersContainer = document.getElementById("stowersRates");
  if (StowersContainer.classList.contains("visible")) {
    StowersContainer.classList.remove("visible");
    StowersContainer.innerHTML = "";
    StowersContainer.style.display = "none";
  } else {
    StowersContainer.classList.add("visible");
    let stowList = await getAPIdata({
      resourcePath: "svs/associates/data",
      httpMethod: "post",
      processName: "stow",
      requestBody: {
        filters: { NODE: [CONFIG.site], CYCLE: ["CYCLE_1"] },
        fieldsRequired: ["NAME", "STATUS", "PERFORMANCE", "LOCATION"],
      },
    });
    console.log(stowList);
    //////////////////////////
    stowList.associates.forEach((ele) => {
      ele.pph = ele.performance.pph;
      console.log(ele.performance.pph);
    });

    console.log(objFlat);

    /////////////////////////

    creaTabla(
      "stowersRates",
      stowList.associates.filter((ele) => ele.status === "ACTIVE"),
      ["alias", "pph", "location"]
    );

    StowersContainer.style.display = "block";
  }
}
function flattenObj(obj, parent, res = {}) {
  for (let key in obj) {
    let propName = parent ? parent + "_" + key : key;
    if (typeof obj[key] == "object") {
      flattenObj(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}
async function getInductersRates() {
  const inductContainer = document.getElementById("inductersRates");
  if (inductContainer.classList.contains("visible")) {
    inductContainer.classList.remove("visible");
    inductContainer.innerHTML = "";
    inductContainer.style.display = "none";
  } else {
    inductContainer.classList.add("visible");
    let inductList = await getAPIdata({
      resourcePath: "/ivs/getAssociateMetric",
      httpMethod: "post",
      processName: "induct",
      requestBody: { nodeId: CONFIG.site },
    });
    console.log(inductList.associateMetricList);
    let activeInducters = inductList.associateMetricList.filter(
      (ele) => ele.active === true
    );
    console.log(activeInducters);

    creaTabla("inductersRates", activeInducters, [
      "alias",
      "PPH",
      // "hourSpent",
      "location",
      // "packageHandled",
    ]);
    inductContainer.style.display = "block";
  }
}

function mueve() {
  mueve.flag;
  let chart = document.getElementById("test");
  console.log("chart leftt", chart.style.left);
  if (mueve.flag) {
    mueve.flag = false;
    chart.style.left = "100vw";
  } else {
    mueve.flag = true;

    chart.style.left = "0";
  }
}
function addListenerToModifierButtons() {
  let celda;
  const BotonesModifi = document.querySelectorAll(".sumatorios");

  BotonesModifi.forEach((boton) =>
    boton.addEventListener("click", (e) => {
      if (boton.classList.contains("stow")) {
        celda = document.getElementById("StowRateCustom");
      } else if (boton.classList.contains("minutes")) {
        celda = document.getElementById("MinutesToCheckCustom");
      } else if (boton.classList.contains("induct")) {
        celda = document.getElementById("InductRateCustom");
      } else {
        return;
      }

      celda.textContent =
        Number(celda.textContent) + Number(e.target.textContent);
      fillCustom();
    })
  );
}
function addListenerToFindMinMaxCuston() {
  document
    .querySelector("#customMinStow") //(MinutesToCheck * InductRateAct + 60 * ATsAct) / (30 + MinutesToCheck)
    .addEventListener("click", (e) => {
      document.getElementById("StowRateCustom").textContent = Math.round(
        (MinutesToCheckCustom * InductRateCustom + 60 * ATsCustom) /
          (30 + MinutesToCheckCustom)
      );
      fillCustom();
    });
  document.querySelector("#customMaxStow").addEventListener("click", (e) => {
    document.getElementById("StowRateCustom").textContent = Math.round(
      (MinutesToCheckCustom * InductRateCustom + 60 * ATsCustom) /
        (15 + MinutesToCheckCustom)
    );
    fillCustom();
  });

  document.querySelector("#customMinInduct").addEventListener("click", (e) => {
    document.getElementById("InductRateCustom").textContent = Math.round(
      (60 * (StowRateCustom / 4) - 60 * ATsCustom) /
        Number(MinutesToCheckCustom) +
        Number(StowRateCustom)
    );
    fillCustom();
  });
  document.querySelector("#customMaxInduct").addEventListener("click", (e) => {
    document.getElementById("InductRateCustom").textContent = Math.round(
      (60 * (StowRateCustom / 2) - 60 * ATsCustom) /
        Number(MinutesToCheckCustom) +
        Number(StowRateCustom)
    );
    fillCustom();
  });
}
function copyData() {
  document.getElementById("ATsCustom").textContent = ATsAct;
  document.getElementById("StowRateCustom").textContent = StowRateAct;
  document.getElementById("InductRateCustom").textContent = InductRateAct;
  document.getElementById("MinutesToCheckCustom").textContent = MinutesToCheck;
  fillCustom();
}

function testcall() {
  //alert("holaaaaaa")
  let n = new Date();
  console.log("llamada a las " + n);
  setTimeout(testcall, 2 * 60 * 1000);
}
let next;
function handleStartButton() {
  if (startButton.textContent === "Off") {
    startButton.textContent = "Running";
    getScreenLock();
    // drawChart();
    apitest();
    calculateNextWindowCall();

    handleStartButton.intervalID = setInterval(apitest, 15000);
    handleStartButton.intervalTruck=setInterval(checkArrived, 1*60*1000);
  } else {
    startButton.textContent = "Off";
    clearInterval(handleStartButton.intervalID);
    clearInterval(handleStartButton.intervalTruck)
  }
}
function calculateNextWindowCall() {
  
  renderWindowsData();
  const interval = 15;
  let ahora = new Date();
  let nextw = interval - (ahora.getMinutes() % interval);
  console.log(nextw);
  let nextdate = new Date(ahora);
  nextdate.setMinutes(ahora.getMinutes() + nextw);
  nextdate.setSeconds(10);
  let nextCall = nextdate.getTime() - ahora.getTime();
  console.log(nextCall / 1000 / 60);

  console.log(nextdate, nextdate.getTime());
  console.log(ahora.setMinutes(ahora.getMinutes() + nextw));
  setTimeout(windowsInterval, nextCall);
}
function windowsInterval() {
  renderWindowsData();
  setTimeout(windowsInterval, 5 * 60 * 1000 - 1);
}
//renderWindowsData()
// first parameter Table ID, second arrayasync
