let database;
const complyArray = [];
let myChart;
let myPieChart;
const inducRateArray = [];
const stowRateArray = [];
const AtsArray = [];
const times = [];
const maxAts = [];
const minAts = [];
const epochArray=[]


export function updateChart(data) {
  //{ InductRateAct, StowRateAct, ATsAct, "hora": new Date().getHours(),"minuto":new Date().getMinutes() }
 
  
  database.push(data)
  
  
  myChart.update();
  if (data.minuto % 15 === 0 ) {
    console.log(data)
   // if (ele.epoch>inicioEpoch && ele.epoch)
    complyArray.push(data);
    myPieChart.update()}
 
}
export async function addtest() {

  getWindowsComply()
  
  
}

export async function testChart() {
  await getDataBase().then(myChart.update());

  //drawChart();
}

async function getDataBase() {
  await fetch("http://localhost:3000/getData")
    .then((response) => response.json())
    .then((data) => {
      database = data;
    })
    .catch((error) => alert("No se encuentra el servidor", error));
  return await database;
}
let y = [];

export async function drawChart() {
  
  database = await fetch("http://localhost:3000/getData").then((response) =>
  response.json()
  );
  const ctx = document.getElementById("test").getContext("2d");


  myChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Induct Rate",
          data: database,
          backgroundColor: "red",
          borderColor: "red",
          tension: "0.2",
          parsing: {
            yAxisKey: "InductRateAct",
          },
        },
        {
          label: "ATs",
          data: database,
          parsing: {
            yAxisKey: "ATsAct",
          },
          backgroundColor: "green",
          borderColor: "green",
          tension: "0.2",
          indexAxis: "y",
        },
        {
          label: "Stow Rate",
          data: database,
          parsing: {
            yAxisKey: "StowRateAct",
          },
          backgroundColor: "blue",
          borderColor: "blue",
          
          tension: "0.2",
          indexAxis: "y",
        },
        {
          label: "Max Ats",
          data: database,
          parsing: {
            yAxisKey: "ATsMax",
          },
          pointRadius:"0",
          backgroundColor: "black",
          borderColor: "black",
          tension: "0.2",
          indexAxis: "y",
        },{
          label: "Min Ats",
          data: database,
          parsing: {
            yAxisKey: "ATsMin",
          },
          pointRadius:"0",
          backgroundColor: "black",
          borderColor: "black",
          tension: "0.2",
          indexAxis: "y",
        },
      ],
    },
    options: {
      pointRadius:"0",
      parsing: { xAxisKey: "epoch" },
      animation: true,
      scales: {
        xAxisKey: {
          type: "time",
          time: {
            unit: "minute",
            displayFormats: {
              minute: "HH:mm",
            },
          },
        },
        yAxis: {
          beginAtZero: false,
          type: "linear",
        },
      },
    },
  });
  console.log(myChart.data.datasets);
}

function setWorkTime() {
  // Las horas de inicio y final estan hardcoded ,se calcula cuantos intervalos de un minuto hay en el tiempo de trabajp para la coordenada Y de la grafica
  const inicio = new Date();
  inicio.setHours("01");
  inicio.setMinutes("30");
  inicio.setSeconds("00");

  const final = new Date();
  final.setHours("9");
  final.setMinutes("00");
  final.setSeconds("00");

  y = [];
  while (inicio <= final) {
    y.push(inicio.getHours() + ":" + addZero(inicio.getMinutes()));
    inicio.setMinutes(inicio.getMinutes() + 1);
  }
}

/***************************************************pequeña funcion para añadir un 0 a los minutos  */
function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

async function getWindowsComply() {
 
  //let database = await getDataBase();

  let inicio = {
    hora: 1,
    minuto: 30,
  };
  database.forEach((ele) => {
    if (ele.minuto % 15 === 0 ) {
      console.log(ele)
     // if (ele.epoch>inicioEpoch && ele.epoch)
      complyArray.push(ele);
    }
  });


  drawPie(complyArray);
}

function drawPie() {
  var passed = 0;
  var failed = 0;

  complyArray.forEach((ele) => {
    if (ele.passed === true) {
      passed++;
    } else {
      failed++;
    }
  });
  myPieChart = new Chart(document.getElementById("pieComply"), {
    type: "pie",
    data: {
      labels: [
        // Math.round(((passed * 100) / (passed + failed)) * 100) / 100);
        `Passed ${Math.round((((passed * 100) / (passed + failed)) * 100) / 100)}%`,
        `Failed ${Math.round((((failed * 100) / (passed + failed)) * 100) / 100)}%`,
      ],
      datasets: [
        {
          label: "Population (millions)",
          backgroundColor: ["green", "red"],
          data: [passed, failed],
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "% Of Time Comply",
      },
    },
  });
  console.log("pie", myPieChart.data.datasets[0].data[0]);
}
