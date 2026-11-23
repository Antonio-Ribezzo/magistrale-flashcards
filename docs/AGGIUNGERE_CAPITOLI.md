# Aggiungere, verificare e pubblicare i capitoli

## 1. Prima del codice: qualità didattica

L'origine dei contenuti è il **manuale definitivo fornito dallo studente**. Procedere **un capitolo alla volta**:

1. Esaminare il capitolo completo, incluse figure, tabelle, formule, note ed esempi.
2. Costruire una **mappa di copertura** degli argomenti (paragrafi del manuale → ID schede).
3. Redigere domande atomiche e risposte autosufficienti: definizione rigorosa, approfondimento, esempi, formule, errori tipici e citazione della fonte.
4. Controllare **copertura completa**, nessun concetto omesso e nessuna affermazione incompatibile con il manuale.
5. Validare il JSON e verificare l'esperienza mobile di studio.
6. Aggiungere il file al repository senza alterare gli ID già esistenti.

**Non** introdurre integrazioni da fonti esterne senza distinguere queste dal manuale. Il file template ha solo *SEGNAPOSTO* per mostrare la struttura.

## 2. Schema JSON

Usa [`examples/capitolo-template.json`](../examples/capitolo-template.json) e sostituisci TUTTI i segnaposto con il contenuto verificato.

Campi principali:

- `schemaVersion`: sempre `1` in questa versione.
- `subjectId`: `cdg`, `mca`, `cyber`, `si`.
- `chapter.id`, `chapter.title`, `chapter.order`.
- `chapter.topics`: ciascun argomento con ID univoco e titolo.
- `cards`: domande che referenziano `topicId`, con `id`, `question`, `answer` **obbligatori**.
- `detail`, `example`, `formulas`, `connections`, `mistakes`, `reference`: facoltativi ma necessari quando aggiungono comprensione o rigore.
- `coverage.sections`: elenco dei paragrafi del manuale e degli ID di flashcard che li coprono.

### Esempio di formula

```json
"formulas": [
  {"latex":"Q^* = \\frac{CF}{p-c_v}", "meaning":"Spiegare tutte le variabili e le condizioni di validità, seguendo il manuale."}
]
```

Il campo `latex` viene reso con MathJax solo quando serve: è necessaria una connessione Internet per caricare la libreria. Se MathJax non è disponibile, rimane visibile la notazione sorgente.

### Formattazione del testo

Risposte e approfondimenti accettano paragrafi separati da una riga vuota, elenchi con `- `, grassetto con `**testo**` e `*corsivo*`. **Non** inserire HTML: viene visualizzato come testo per prevenire injection.

## 3. Test rapido prima di pubblicare

1. Apri il sito e vai in **Impostazioni**.
2. Scegli **Carica capitolo JSON**, seleziona il capitolo.
3. Verifica il numero delle schede e fai una sessione di prova.
4. In caso di errore, correggi il file JSON. Non è necessario modificare la UI.
5. Elimina il capitolo di anteprima dalle impostazioni se non desideri mantenerlo localmente.

L'anteprima locale può coesistere con il capitolo pubblicato; quando pubblichi **lo stesso `chapter.id`**, la versione del repository prevale e le valutazioni con ID delle flashcard invariati vengono mantenute.

## 4. Pubblicazione

Aggiungi il JSON dentro `content/subjects/<subjectId>/...` e un elemento nell'array `chapters` della materia corrispondente dentro `content/manifest.json`:

```json
{
  "id": "cdg-c01",
  "file": "content/subjects/cdg/01-capitolo.json"
}
```

Gli ID devono coincidere tra manifest e file capitolo. I percorsi non possono risalire sopra la cartella `content/subjects`.

Commit/push delle modifiche → GitHub Pages rende disponibile il nuovo file. Il browser scarica il catalogo aggiornato alla prossima visita; se rimane aperta una scheda, ricarica la pagina.

## 5. Aggiornamenti senza perdere il lavoro

- Correzione di un refuso → conserva `card.id`.
- Approfondimento di una risposta → conserva `card.id`.
- Domanda nuova o concetto distinto → nuovo ID.
- Rimozione di una scheda → lo storico locale relativo rimane archiviato nel database e nei backup, ma non appare nelle statistiche del catalogo attuale.
- Cambi di manuale → prepara un confronto di copertura prima di sostituire interi capitoli.

È consigliato fare **backup dei progressi** prima di ogni aggiornamento importante del catalogo.
