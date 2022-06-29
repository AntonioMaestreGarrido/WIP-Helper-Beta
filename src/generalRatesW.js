import { CONFIG } from "../index.js";
import { getAPIdata, getTruckList } from "./api.js";
import { getSideIn, getSideOut } from "./sideLine.js";

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
  
  document.querySelector(".volumeManifested span").textContent = ` ${truckData.totalVolume} (${truckData.truckManifested}/${truckData.trucksNumber})`;
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
  //document.querySelector(".sideline").textContent=`Sideline: ${data.groupedPackageMetrics.SIDELINE[CONFIG.site]}`
}

async function truckList() {
  const truckList = await getTruckList();
  let totalVolume = 0;
  let trucksNumber = 0;
  let truckManifested = 0;
  console.log(truckList[1])
  truckList.forEach((ele) => {
    trucksNumber++;
    if (!isNaN(ele.volume) && !ele.volume==0) {
      totalVolume += ele.volume;
      truckManifested++;
    }
  });

  return { totalVolume, trucksNumber, truckManifested };
}
