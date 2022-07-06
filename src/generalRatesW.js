import { CONFIG } from "../index.js";
import { getAPIdata, getTruckList } from "./api.js";
import { sendNotification } from "./noti.js";
import { getSideIn, getSideOut } from "./sideLine.js";
import { renderWindowsData } from "./widonsData.js";

export async function renderGeneralRates(sccData) {
  let sideIN = await getSideIn(CONFIG.site);
  let sideOut = await getSideOut();
  const truckData = await truckList();
  console.log(truckData);
  const start = new Date(sccData.dataPointList[0].timeStampVal);
  const end = new Date(
    sccData.dataPointList[sccData.dataPointList.length - 1].timeStampVal
  );
  sessionStorage.setItem(
    "timetable",
    JSON.stringify({ start: start, end: end })
  );
  const shiftDuration = (end - start) / 1000 / 60;
  const worktime = (shiftDuration - 30 - 15) / 60; //tiempo del turno en minutos menos descanso y menos primera ventana o ultima
  console.log((end - start) / 1000 / 60);
  const petBody = {
    resourcePath: "/ivs/getPackageMetric",
    httpMethod: "post",
    processName: "induct",
    requestBody: {
      nodeId: CONFIG.site,
      filters: { Cycle: ["CYCLE_1"] },
      groupBy: "Node",
      metricList: [
        "CURRENT_CYCLE_RECEIVED",
        "OTHER_CYCLE_RECEIVED",
        "PENDING_DEPART_FROM_UPSTREAM",
        "PENDING_DEPART_FROM_UPSTREAM_UNPLANNED",
        "IN_TRANSIT_FROM_UPSTREAM",
        "IN_TRANSIT_FROM_UPSTREAM_UNPLANNED",
        "PENDING_INDUCT",
        "PENDING_INDUCT_UNPLANNED",
        "PENDING_RE_INDUCT",
        "PENDING_RE_INDUCT_UNPLANNED",
        "INDUCTED_AT_STATION",
        "PLANNED_MANIFESTED",
        "SIDELINE",
      ],
    },
  };
  const data = await getAPIdata(petBody);
  console.log(data);
  console.log(data.groupedPackageMetrics.PLANNED_MANIFESTED[CONFIG.site]);
  document.querySelector(".volumeExpected").textContent = `Volume Expected: ${
    data.groupedPackageMetrics.PLANNED_MANIFESTED[CONFIG.site]
  }`;

  document.querySelector(
    ".volumeManifested span"
  ).textContent = ` ${truckData.totalVolume} (${truckData.truckManifested}/${truckData.trucksNumber})`;
  document.querySelector(".inductHourlyRate").textContent = `Induct Hr: ${(
    data.groupedPackageMetrics.PLANNED_MANIFESTED[CONFIG.site] / worktime
  ).toFixed(0)}`;
  document.querySelector(".stowHourlyRate").textContent = `Stow Hr: ${(
    data.groupedPackageMetrics.PLANNED_MANIFESTED[CONFIG.site] / worktime
  ).toFixed(0)}`;
  document.querySelector(".inductWindowRate").textContent = `Induct Wr: ${(
    data.groupedPackageMetrics.PLANNED_MANIFESTED[CONFIG.site] /
    (worktime * 4)
  ).toFixed(0)}`;
  document.querySelector(".stowWindowRate").textContent = `Stow Wr: ${(
    data.groupedPackageMetrics.PLANNED_MANIFESTED[CONFIG.site] /
    (worktime * 4)
  ).toFixed(0)}`;
  document.querySelector(".startTime").textContent = `Start time: ${String(
    start.getHours()
  ).padStart(2, "0")}:${String(start.getMinutes()).padEnd(2, "0")}`;
  document.querySelector(".endTime").textContent = `End time: ${String(
    end.getHours()
  ).padStart(2, "0")}:${String(end.getMinutes()).padEnd(2, "0")}`;
  document.querySelector("span.dataSideLineIn").textContent = sideIN;
  document.querySelector("span.dataSideLineOut").textContent = sideOut;
  document.querySelector("#truckArrived").textContent = truckData.truckArrived;
  let a = document.querySelector("#truckTotal");
  document.querySelector("#truckTotal").textContent = truckData.trucksNumber;
  //document.querySelector(".sideline").textContent=`Sideline: ${data.groupedPackageMetrics.SIDELINE[CONFIG.site]}`
}

async function truckList() {
  let truckList = await getTruckList();
  truckList = truckList.filter(
    (ele) =>
      !ele.origin.startsWith("OQ") &&
      !ele.origin.startsWith("OC") &&
      ele.origin.length < 5
  );
  checkArrived(truckList);
  let totalVolume = 0;
  let trucksNumber = 0;
  let truckManifested = 0;
  let truckArrived = 0;
  console.log(truckList);
  truckList.forEach((ele) => {
    console.log(ele.origin.length);
    if (
      !ele.origin.startsWith("OQ") &&
      !ele.origin.startsWith("OC") &&
      ele.origin.length < 5
    ) {
      trucksNumber++;
      console.log(ele);
      if (!isNaN(ele.volume) && !ele.volume == 0) {
        totalVolume += ele.volume;
        truckManifested++;
      }
    }
    if (ele.lineHaulStatus === "ARRIVED") {
      truckArrived++;
    }
  });

  return { totalVolume, trucksNumber, truckManifested, truckArrived };
}
export async function checkArrived() {
  let a=new Date()
  
  console.log("llamada a truckarrive",a.toTimeString())
  const trucks = await  getTruckList();
  if (sessionStorage.getItem("trucksList") == null) {
    sessionStorage.setItem("trucksList", JSON.stringify(trucks));
    return;
  }
  const oldList = JSON.parse(sessionStorage.getItem("trucksList")).filter(
    (ele) => ele.lineHaulStatus !== "ARRIVED"
  );
  console.log(oldList);
  if (oldList.length == 0) {
    return;
  }
  console.table(trucks)
  
  console.table(oldList)
  oldList.forEach((ele) => {
    if (
      
      trucks.filter((truck) => truck.lineHaulId === ele.lineHaulId)[0]
        .lineHaulStatus === "ARRIVED"
    ) {
      console.log(ele.lineHaulId + "llegado");
      sendNotification(ele)
      renderWindowsData()
      sessionStorage.setItem("trucksList", JSON.stringify(trucks));
    }
  });
}
