// Variabili condivise a più funzioni.
let data;
let maxLength = 0;
let maxDischarge = 0;
let maxTributaries = 0;

// Altezza dell'intestazione (titolo e legenda)
let hIntestazione = 130;

// Colori per la temperatura: freddo -> caldo
let coloreFreddo;
let coloreCaldo;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  coloreFreddo = color("#2F5FA8");
  coloreCaldo = color("#E0452B");

  // Carico i dati: "header" usa la prima riga come nomi delle colonne.
  data = await loadTable("ASSETS/rivers_world - Data.csv", ",", "header");

  // Cerco i valori massimi, servono per riportare i dati alla stessa scala.
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let length = data.getNum(rowNumber, "length");
    let discharge = data.getNum(rowNumber, "discharge");
    let tributaries = data.getNum(rowNumber, "tributaries");

    if (length > maxLength) {
      maxLength = length;
    }
    if (discharge > maxDischarge) {
      maxDischarge = discharge;
    }
    if (tributaries > maxTributaries) {
      maxTributaries = tributaries;
    }
  }
}

function draw() {
  background(245);

  disegnaIntestazione();

  // Calcolo la griglia: un glifo per ogni fiume
  let numeroGlifi = data.getRowCount();
  let numeroColonne = ceil(sqrt(numeroGlifi));
  let numeroRighe = ceil(numeroGlifi / numeroColonne);

  let dimColonna = width / numeroColonne;
  let dimRiga = (height - hIntestazione) / numeroRighe;
  let dimensione = min(dimColonna, dimRiga) * 0.45;

  let label = "";

  for (let rowNumber = 0; rowNumber < numeroGlifi; rowNumber++) {
    // Leggo i dati del fiume
    let nome = data.getString(rowNumber, "name");
    let lunghezza = data.getNum(rowNumber, "length");
    let portata = data.getNum(rowNumber, "discharge");
    let affluenti = data.getNum(rowNumber, "tributaries");
    let temperatura = data.getNum(rowNumber, "avg_temp");

    // Calcolo colonna, riga e centro della cella
    let colonna = rowNumber % numeroColonne;
    let riga = floor(rowNumber / numeroColonne);
    let xCorrente = colonna * dimColonna + dimColonna / 2;
    let yCorrente = hIntestazione + riga * dimRiga + dimRiga / 2;

    // Disegno il glifo
    mioGlifo(xCorrente, yCorrente, dimensione, lunghezza, portata, affluenti, temperatura);

    // Rollover: se il mouse è dentro il glifo, memorizzo il nome
    if (dist(mouseX, mouseY, xCorrente, yCorrente) < dimensione) {
      label = nome + "\n" + lunghezza + " km, " + portata + " m³/s, " + temperatura + " °C";

      // cerchio attorno al glifo selezionato
      noFill();
      stroke(0);
      strokeWeight(1);
      circle(xCorrente, yCorrente, dimensione * 2);
    }
  }

  // Mostro il testo vicino al mouse solo se sono sopra un glifo
  if (label != "") {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(12);
    text(label, mouseX + 12, mouseY + 12);
  }
}

function mioGlifo(x, y, dimensione, lunghezza, portata, affluenti, temperatura) {
  // 1. Trasformo i dati in dimensioni visive
  // portata -> raggio del disco (scala logaritmica: i valori sono molto diversi)
  let raggioDisco = map(log(portata), 0, log(maxDischarge), 0, dimensione * 0.4);
  // lunghezza -> lunghezza dei raggi
  let lunghezzaRaggi = map(lunghezza, 0, maxLength, dimensione * 0.15, dimensione * 0.6);
  // affluenti -> numero di raggi (scala logaritmica)
  let numeroRaggi = round(map(log(affluenti), 0, log(maxTributaries), 3, 20));
  // temperatura -> colore
  let colore = lerpColor(coloreFreddo, coloreCaldo, map(temperatura, -10, 30, 0, 1));

  // 2. Posiziono il centro del glifo
  push();
  translate(x, y);

  // 3. Raggi: ruoto di un angolo uguale per ogni raggio
  stroke(colore);
  strokeWeight(1.5);
  for (let i = 0; i < numeroRaggi; i++) {
    push();
    rotate(i * 360 / numeroRaggi);
    line(0, -raggioDisco, 0, -raggioDisco - lunghezzaRaggi);
    pop();
  }

  // 4. Disco al centro
  noStroke();
  fill(colore);
  circle(0, 0, raggioDisco * 2);

  pop();
}

function disegnaIntestazione() {
  // Titolo
  noStroke();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(28);
  text("Cento fiumi del mondo", 20, 15);

  // Legenda
  textSize(13);
  text(
    "Ogni glifo è un fiume.\n" +
    "Disco: portata media (più grande = più acqua)    Raggi lunghi: fiume lungo    Molti raggi: molti affluenti\n" +
    "Passa il mouse su un glifo per leggere i dati.",
    20, 55
  );

  // Barra colore per la temperatura media
  text("Colore: temperatura media   -10 °C", 20, 108);
  for (let i = 0; i < 100; i++) {
    stroke(lerpColor(coloreFreddo, coloreCaldo, i / 99));
    line(235 + i, 108, 235 + i, 122);
  }
  noStroke();
  fill(0);
  text("30 °C", 345, 108);
}