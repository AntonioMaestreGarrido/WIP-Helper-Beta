import { CONFIG } from "../index.js";

export async function getAPIdata(peticion) {
  console.log(peticion);
  let scc = await fetch("http://localhost:3000/testpost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify(peticion),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("succes");
      let scc = data;

      return scc;
    })
    .catch((error) => []);
  return scc;
}

export async function getAPIgetdata(link) {
  let data = await fetch("http://localhost:3000/wipData")
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => console.log("No se ha podido acceder a SSC", error));

  return data;
}

export async function getInductAndStow() {
  let body = {
    resourcePath: "/ivs/getLocationMetric",
    httpMethod: "post",
    processName: "induct",
    requestBody: { nodeId: CONFIG.site },
  };

  const data = await getAPIdata(body);
  console.log(data);
  let induct = 0;
  data.locationInsightList.forEach((ele) => (induct = induct + ele.inductRate));
  let body2 = {
    resourcePath: "svs/packages/metrics",
    httpMethod: "post",
    processName: "stow",
    requestBody: {
      groupBy: "CLUSTER",
      filters: {
        NODE: [CONFIG.site],
        DRS: ["FALSE"],
        CYCLE: ["CYCLE_1"],
        CYCLE_ID: ["761553f5-9fc1-4cef-8815-b974bc63f0a9"],
      },
      metrics: [
        "STOW_RATE",
        "SCAN_COMPLIANCE",
        "PROBLEM_SOLVE_COUNT",
        "PLANNED_COUNT",
        "STOW_VS_PLAN",
        "STOWED_COUNT",
        "CURRENT_INDUCTED_COUNT",
      ],
      isAggregationRequired: true,
    },
  };
  const stowData = await getAPIdata(body2);
  let stow = stowData.aggregatePackageMetrics.stowRate;
  console.log(`ritmo de Stow: ${stow} y ritmo de induccion ${induct}`);
  return { induct, stow };
}

export async function getSideList(site) {
  if (!site) {
    site = CONFIG.site;
  }
  let start =
    new Date(JSON.parse(sessionStorage.getItem("timetable")).start).getTime() /
    1000;
  let end =
    new Date(JSON.parse(sessionStorage.getItem("timetable")).end).getTime() /
    1000;
  start = start - 4 * 60 * 60;
  end = end + 4 * 60 * 60;
  let d = new Date();
  // let end=Math.floor(d.getTime()/1000)
  //let start=Math.floor((d.getTime() -(10*60*60*1000))/1000)
  console.log(`http://localhost:3000/sideList/${site}/${start}/${end}`);
  let data = await fetch(
    `http://localhost:3000/sideList/${site}/${start}/${end}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => console.log("No se ha podido acceder a SSC", error));

  return data.packageResultList;
}
export async function getAged(site) {
  if (!site) {
    site = CONFIG.site;
  }
  let data = await fetch(`http://localhost:3000/getAged/${site}`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => console.log("No se ha podido acceder a SSC", error));

  return data.metricResult;
}
export async function getDwell(site) {
  if (!site) {
    site = CONFIG.site;
  }
  let data = await fetch(`http://localhost:3000/getDwell/${site}`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => console.log("No se ha podido acceder a SSC", error));

  return data.metricResult;
}

export async function getTruckList() {
  try {
    const camiones = await getAPIdata({
      resourcePath: "/ivs/getNodeLineHaulList",
      httpMethod: "post",
      processName: "induct",
      requestBody: { nodeId: CONFIG.site, groupBy: "" },
    });
    return camiones.lineHauls;
  } catch (error) {
    return [];
  }
}
