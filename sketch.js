/* -AIUTO AI-
- Per collegare le funzioni del cgrea glifi all'area che ho creato in html
-Il lessico e come funzionavano termini come return, continue; implementati dopo aver scoperto degli errori
-Lo spostamente del testo in base alla posizione del mouse e al bordo destro della pagina


*/
// Variabili condivise a più funzioni.
let data;
let maxLength = 0;
let maxDischarge = 0;
let maxTributaries = 0;
let continents = [];
let continentCounts = [];

// Dimensione minima della cella di un glifo che evita glifi troppo piccoli.
let dimMinima = 110;

// Altezza del titolo di ogni sezione continente
let hTitoloSezione = 50;

// Colori per la temperatura: freddo -> caldo
let coloreFreddo;
let coloreCaldo;

// Nomi dei continenti da mostrare: nomiContinenti["Europe"] restituisce "Europa".
let nomiContinenti = {
  'Asia': 'Asia',
  'Europe': 'Europa',
  'South America': 'Sud America',
  'North America': 'Nord America',
  'Africa': 'Africa',
  'Oceania': 'Oceania',
}

async function setup() {
  // Il canvas viene messo nella parte destra della pagina (<main id="area-glifi">). -AIUTO AI-
  let canvas = createCanvas(larghezzaArea(), 100);
  canvas.parent("area-glifi");
  angleMode(DEGREES);

  coloreFreddo = color("#2F5FA8");
  coloreCaldo = color("#E0452B");

  // Carico i dati
  data = await loadTable("ASSETS/rivers_world - Data.csv", ",", "header");

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

    // Raccoglie i continenti senza duplicati e conta quanti fiumi ha ciascuno.
    let continent = nomeContinente(rowNumber);
    let posizione = continents.indexOf(continent);
    if (posizione == -1) {
      continents.push(continent);
      continentCounts.push(1);
    } else {
      continentCounts[posizione] += 1;
    }
  }

  calcolaAltezza();
}




function draw() {
  background(245);

  // draw() parte anche prima che i dati siano caricati: aspetto.
  if (data == undefined) {
    return;
  }

  // Calcolo la griglia: quante colonne entrano nella larghezza disponibile
  let numeroColonne = floor(width / dimMinima);
  let dimCella = width / numeroColonne;
  let dimensione = dimCella * 0.45;

  let label = "";
  let yInizio = 0;

  // Una sezione per ogni continente, una sotto l'altra
  for (let c = 0; c < continents.length; c++) {
    let continentCorrente = continents[c];

    // Titolo della sezione
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(20);
    text(nomiContinenti[continentCorrente] + " (" + continentCounts[c] + ")", 20, yInizio + 15);
    stroke(180);
    strokeWeight(1);
    line(20, yInizio + hTitoloSezione - 5, width - 20, yInizio + hTitoloSezione - 5);

    // Contatore dei glifi già disegnati in questa sezione
    let posizioneInSezione = 0;

    for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
      // Salto i fiumi di altri continenti
      if (nomeContinente(rowNumber) != continentCorrente) {
        continue; 
      }

      // Leggo i dati del fiume
      let nome = data.getString(rowNumber, "name");
      let lunghezza = data.getNum(rowNumber, "length");
      let portata = data.getNum(rowNumber, "discharge");
      let affluenti = data.getNum(rowNumber, "tributaries");
      let temperatura = data.getNum(rowNumber, "avg_temp");

      // Calcolo colonna, riga e centro della cella
      let colonna = posizioneInSezione % numeroColonne;
      let riga = floor(posizioneInSezione / numeroColonne);
      let xCorrente = colonna * dimCella + dimCella / 2;
      let yCorrente = yInizio + hTitoloSezione + riga * dimCella + dimCella / 2;

      // Disegno il glifo
      mioGlifo(xCorrente, yCorrente, dimensione, lunghezza, portata, affluenti, temperatura);

      // Rollover: se il mouse è dentro il glifo, memorizzo il testo
      if (dist(mouseX, mouseY, xCorrente, yCorrente) < dimensione) {
        label = nome + "\n" + lunghezza + " km, " + portata + " m³/s\n" + affluenti + " affluenti, " + temperatura + " °C";

        // cerchio attorno al glifo selezionato
        noFill();
        stroke(0);
        strokeWeight(1);
        circle(xCorrente, yCorrente, dimensione * 2);
      }

      posizioneInSezione += 1;
    }

    // La sezione successiva parte sotto l'ultima riga di questa
    let numeroRighe = ceil(continentCounts[c] / numeroColonne);
    yInizio += hTitoloSezione + numeroRighe * dimCella;
  }

  // Mostro il testo vicino al mouse solo se sono sopra un glifo
  if (label != "") {
    let xTesto = mouseX + 12;
    // se siamo vicini al bordo destro, il testo va a sinistra del mouse -AIUTO AI-
    if (mouseX > width - 220) {
      xTesto = mouseX - 200;
    }
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(12);
    text(label, xTesto, mouseY + 12);
  }
}

function mioGlifo(x, y, dimensione, lunghezza, portata, affluenti, temperatura) {

  // 1. Trasformo i dati - portata -> raggio del disco (scala logaritmica: i valori sono molto diversi)
  let raggioDisco = map(log(portata), 0, log(maxDischarge), 0, dimensione * 0.4);

  // 1.2. Trasformo i dati - lunghezza -> lunghezza dei raggi
  let lunghezzaRaggi = map(lunghezza, 0, maxLength, dimensione * 0.15, dimensione * 0.6);

  // 1.3. Trasformo i dati - affluenti -> numero di raggi (scala logaritmica)
  let numeroRaggi = round(map(log(affluenti), 0, log(maxTributaries), 3, 40));

  // 1.4. Trasformo i dati - temperatura -> colore
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

// Larghezza della parte destra della pagina (dove sta il canvas)
function larghezzaArea() {
  return document.getElementById("area-glifi").clientWidth;
}

// Nome del continente di una riga: unisco "Australia" a "Oceania" (un solo fiume ciascuno)
function nomeContinente(rowNumber) {
  let continent = data.getString(rowNumber, "continent");
  if (continent == "Australia") {
    continent = "Oceania";
  }
  return continent;
}

// Altezza totale del canvas: serve per far comparire lo scroll verso il basso
function calcolaAltezza() {
  let numeroColonne = floor(width / dimMinima);
  let dimCella = width / numeroColonne;
  let altezzaTotale = 0;
  for (let c = 0; c < continents.length; c++) {
    let numeroRighe = ceil(continentCounts[c] / numeroColonne);
    altezzaTotale += hTitoloSezione + numeroRighe * dimCella;
  }
  resizeCanvas(width, altezzaTotale + 20);
}

// Se cambia la finestra, ricalcolo larghezza e altezza del canvas
function windowResized() {
  resizeCanvas(larghezzaArea(), height);
  if (data != undefined) {
    calcolaAltezza();
  }
}