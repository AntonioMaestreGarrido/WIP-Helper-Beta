import { CONFIG } from "../index.js";
import { getFullData, getParcelList, getTruckList } from "./api.js";
import { testCSV } from "./sideLine.js";


export async function parcelList(site = CONFIG.site) {
  let a = new Date();
  const truckList = (await getTruckList(site)).filter((ele) => ele.volume != 0);
  const listVRID = [];
  
  truckList.forEach((ele) => {
    listVRID.push(ele.lineHaulId);
  });
  console.log(truckList);
  let manifests = [[],[]];

  //   for (let i = 0; i < listVRID.length; i++) {
  //     // for (let i = 0; i <1; i++) {
  //     let manifest = await getParcelList(listVRID[i]);
  //     console.log(manifests.packageList);
  //     manifest.packageList.forEach((ele) => manifests.push(ele.trackingId));
  //   }

  await Promise.all(
    listVRID.map(async (vrid) => {
      let manifest = await getParcelList(vrid);

      manifest.packageList.forEach((ele) => {manifests[0].push(ele.trackingId);manifests[1].push(vrid)});

      return true;
    })
  );

  //manifests = manifests.flat();
  console.log(manifests);
  //   testCSV(manifests)
  let bigdata = await fullSearchData(manifests);
  bigdata = bigdata.flat();
  bigdata.forEach((ele) => (ele = flatSearchData(ele)));
  console.log(bigdata);
  let b = new Date();

  console.log("Tempo total:", (b - a) / 1000);
  console.log(bigdata)
  // se coloca columna vrid primera
  let truckIndex=bigdata
  testCSV(bigdata);
  return bigdata;
}
async function fullSearchData(array) {
  let a = new Date();
  const bigData = [];
  const arrayPartido = chunk(array, 1000);

  console.log("strt");
  console.log(arrayPartido)
  await Promise.all(
    arrayPartido[0].map(async (ele,indexPartido) => {
      console.log("pidiendo ");
      let a = await  getFullData(ele);//await
       console.log(arrayPartido[1][indexPartido][5])
       a.packageSummaryList.forEach((e,index)=>{e.Truck=arrayPartido[1][indexPartido][index]})
      console.log("recibiendo");

      bigData.push(a.packageSummaryList);
      return true;
    })
  );
  console.log("end");
  let b = new Date();
  console.log("tiempo de fullsearch" + (b - a) / 1000);
  return bigData;
}

function chunk(items, size) {
  const chunks = [[],[]];
  //items = [].concat(...items);
console.log(items[0].length)
  while (items[0].length) {
    chunks[0].push(items[0].splice(0, size));
    chunks[1].push(items[1].splice(0, size));
  }

  return chunks;
}
const objTest = {
  time_for: 1656871200000,
  trackingId: "EA0381097276",

  stationTimeZone: "Europe/Berlin",
  packageLength: {
    unit: "cm",
    value: 33.5,
  },
  packageWidth: {
    unit: "cm",
    value: 23.5,
  },
  packageHeight: {
    unit: "cm",
    value: 1.6,
  },
  packageWeight: {
    unit: "kg",
    value: 0.13,
  },
  additionalAttributes: {
    SHIP_OPTION: {
      value: "next-es",
    },
    SCHEDULED_DELIVERY_TIME: {
      value: 0,
    },
    SHIP_DATE: {
      value: 1656770824770,
    },
    PROMISED_DELIVERY_DATE: {
      value: 1656885599000,
    },
    SHIP_METHOD: {
      value: "AMZN_ES_PRIME",
    },
    ESTIMATED_ARRIVAL_DATE: {
      value: 1656871200000,
    },
    PROVIDER_ID: {
      value: "",
    },
  },
  orderId: "404-7078122-0610703",
};
function flatSearchData(obj) {
  for (const key in obj.additionalAttributes) {
    
    obj[key] = obj.additionalAttributes[key].value;
  }
  for (const key in obj) {
    let name = key;
    let valu = obj[key];
    if (typeof valu == "string" && valu.includes(",")) {
     
      obj[key] = valu.replace(",", " ");
    }
    if (obj[key]!= null && name.toLocaleLowerCase().includes("date") ) {
    
      obj[key] = new Date(obj[key]).toLocaleDateString();
    }
    if (
      name.toLocaleLowerCase().includes("time") &&
      obj[key] != 0 &&
      obj[key] != null &&
      name !== "stationTimeZone"
    ) {
     
      let t = 1;
      obj[key] = new Date(obj[key]).toLocaleString().replace(",", "");
      
    }
  }
  obj.packageHeightInCm = obj.packageHeight.value;
  obj.packageLengthtInCm = obj.packageLength.value;
  obj.packagepackageWeightInKg = obj.packageWeight.value;
  obj.packagepackageWidthInCm = obj.packageWidth.value;
  let a = new Date();
  let t = a.toLocaleString();
  t = t.replace(",", "");
  

  delete obj.additionalAttributes;
  delete obj.packageHeight;
  delete obj.packageLength;
  delete obj.packageWeight;
  delete obj.packageWidth;
  delete obj.packageId;

  return obj;
}