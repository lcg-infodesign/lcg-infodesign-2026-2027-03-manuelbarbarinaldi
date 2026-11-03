let table;

let maxMortality = 0;
let sumDuration = 0;

async function preload() {
  // carico i dati
table= loadTable("ASSETS/famines - Sheet1.csv", "csv", "header");
}


/*
function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('p5.js version:', p5.VERSION);
  // put setup code here
  const message =
    "This is a template repository\nfor the course Laboratorio di Computergrafica\nCommunication Design, Politecnico di Milano";
  textAlign(CENTER, CENTER);
  textSize(16);
  text(message, width / 2, height / 2);
}*/

function setup() {
  createCanvas(400, 400);


  for (let numRiga = 0; numRiga < table.getRowCount(); numRiga++){
      console.log("numero:", numRiga);

      let mortality= table.getNum(numRiga, "Excess Mortality midpoint");
      console.log("mortality:", mortality);

      if (mortality > maxMortality){
        maxMortality = mortality;
      }
   }

   // stampa max
    console.log("max mortality:", maxMortality);

}

function draw() {
createCanvas(400, 400);
background(220);



}
