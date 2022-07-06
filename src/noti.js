

export function sendNotification(ele) {
  console.log(ele);
  let vrid = ele.lineHaulId
  
  

  if (Notification.permission !== "granted") {
    askFroNoti();
  }
  let claxon = new Audio("./src/sounds/claxon.mp3");
  claxon.play();

  var img = "./src/img/truck-noti.jpg";
  let ico = "./src/img/peccy.jpg";

  let titulo = "Truck";
  var text = `Llega camion VRID:${vrid} de ${ele.origin} con ${ele.volume} paquetes`;
//   notiChime(text)
  var notification = new Notification("Truck Arrived", {
      timestamp:Date(),
      title:titulo,
    body: text,
    image: img,
    icon: ico,
    requireInteraction: true,
    silent: true,
  });
  notification.addEventListener("show", () => console.log("camion llegado"));
}
function askFroNoti() {
  {
    Notification.requestPermission().then(function (result) {
      console.log(result);
    });
  }
}


 export async function notiChime(msg){
 let link="https://hooks.chime.aws/incomingwebhooks/d4dd040c-16a9-41b5-a202-29fa312b70a7?token=c0hIWlFDMzd8MXw5d0ROZXFWZ1M5dUNzVEFjOVBfRy1ld2FzNEF5M1lRWDVRZVAzQjFGTi1B"
 let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:3001/chimeMsg");
  
  xhr.setRequestHeader("Content-Type", "application/json");
  
  xhr.onreadystatechange = function () {
     if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
     }};
  
  var data =JSON.stringify ({"Content":msg,"Link":link})
  
  xhr.send(data);


}
