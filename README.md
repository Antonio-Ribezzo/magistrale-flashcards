# Magistrale Flashcards

Una piattaforma web **statica, mobile-first, gratuita e senza backend** per la preparazione teorica ai quattro esami del primo semestre della Laurea Magistrale in Ingegneria Gestionale (curriculum Gestione d'Impresa).

## Cosa è già pronto

- Dashboard per **Controllo di Gestione**, **Marketing e Customer Analytics**, **Fondamenti di Cybersecurity**, **Sistemi Informativi**.
- Catalogo materie → capitoli → argomenti → flashcard, costruito da file JSON esterni all'interfaccia.
- Modalità di studio: tutte, nuove, incerte, in scadenza, casuali, singola materia/capitolo/argomento.
- Flashcard con **domanda → risposta fondamentale → approfondimento espandibile → esempio → formule → collegamenti → errori → fonte**.
- Autovalutazione in quattro livelli, ripassi basati su intervalli iniziali **1, 3, 7, 14 giorni**, ampliabili dopo ripassi riusciti.
- Progresso per materia e capitolo, distinguendo **copertura** e **padronanza verificata**.
- Salvataggio locale su **IndexedDB**, storico, backup JSON esportabile/importabile, importazione conservativa.
- Importazione **locale** di singoli capitoli JSON come anteprima; la pubblicazione su GitHub Pages è separata.
- Tema chiaro/scuro, responsive per Android e desktop, accessibilità dei controlli.

**Importante:** i contenuti dei quattro manuali **non sono stati inventati**. Le quattro materie sono inizialmente vuote. Il file `examples/capitolo-template.json` contiene *segnaposto*, non materiale per lo studio; non viene caricato dal catalogo.

## Scelte tecniche

| Componente | Scelta | Motivo |
|---|---|---|
| Frontend | HTML + CSS + JavaScript ES Modules | Nessuna build, nessun framework e nessuna dipendenza obbligatoria |
| Catalogo | `content/manifest.json` + JSON per capitolo | Modulare e aggiornabile senza toccare il codice UI |
| Persistenza | IndexedDB | Dati locali nel browser, senza account |
| Formule | Notazione TeX + MathJax caricato a richiesta via CDN | Formule leggibili senza appesantire il sito iniziale |
| Hosting | GitHub Pages | Pubblicazione gratuita di file statici |

**Non è una PWA**, non richiede installazione e **non promette funzionamento offline**. La rete è necessaria per caricare il sito e i contenuti (e MathJax quando sono presenti formule TeX). Non è presente alcuna sincronizzazione automatica tra dispositivi.

## Avvio locale (facoltativo)

L'app non richiede installazione di pacchetti.

```bash
cd magistrale-flashcards
python3 -m http.server 8000
```

Apri `http://localhost:8000`. Non aprire direttamente `index.html` con `file://` perché i browser possono bloccare le richieste ai JSON.

Per test automatizzati (Node.js 20+):

```bash
npm test
```

## Pubblicazione su GitHub Pages

1. Crea su GitHub un nuovo repository, ad esempio `magistrale-flashcards`.
2. **Estrai questo ZIP** e carica **tutti i file e le cartelle** nella radice (`/`) del repository (non la cartella contenitore).
3. Nelle impostazioni del repository apri **Settings → Pages**.
4. Sotto **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona il branch `main`, la cartella **`/(root)`**, poi **Save**.
6. Quando GitHub completa la pubblicazione, visita l'indirizzo indicato nella schermata Pages, generalmente `https://TUO-USERNAME.github.io/magistrale-flashcards/`.

Tutti i percorsi del sito sono **relativi**, quindi funziona anche nella sottocartella di un repository GitHub Pages. Il file `.nojekyll` evita trasformazioni indesiderate di Jekyll.

> Un repository pubblico rende visibili anche **i file JSON dei contenuti didattici**. Le valutazioni e i backup locali NON vengono pubblicati automaticamente. Non inserire informazioni private nei file del catalogo.

## Aggiungere un capitolo senza modificare codice

Leggi [docs/AGGIUNGERE_CAPITOLI.md](docs/AGGIUNGERE_CAPITOLI.md).

Sintesi:

1. Prepara e **valida rispetto al manuale** un JSON conforme a `examples/capitolo-template.json`.
2. Posizionalo ad esempio in `content/subjects/cdg/01-capitolo.json`.
3. Registra il file in `content/manifest.json`, nella materia con ID `cdg`:

```json
"chapters": [
  {"id":"cdg-c01", "file":"content/subjects/cdg/01-capitolo.json"}
]
```

4. Fai commit/push: GitHub Pages pubblica automaticamente il nuovo capitolo.

Gli ID di capitolo, argomento e flashcard devono rimanere **stabili** nei successivi aggiornamenti. Se il contenuto viene corretto senza cambiare concetto, mantieni lo stesso ID per preservare i progressi. Per una domanda *sostanzialmente nuova*, usa un nuovo ID.

### Importazione locale per anteprima

Da **Impostazioni → Carica capitolo JSON** puoi testare un capitolo *soltanto nel browser corrente*. Questo non lo pubblica su GitHub e non lo rende disponibile su altri dispositivi. I contenuti locali vengono inclusi nei backup, ma per distribuirli serve registrare il relativo file nel manifest del repository.

## Backup, privacy e protezione dei progressi

- **Impostazioni → Esporta backup JSON** salva progressi, storico, preferenze e contenuti locali.
- **Ripristina backup** importa i dati assenti. In caso di ID già presenti, **non li sovrascrive** per impostazione predefinita.
- È disponibile una checkbox esplicita, con conferma, per sostituire gli elementi esistenti con quelli importati.
- Il browser può cancellare IndexedDB (pulizia dei dati, navigazione privata, quote). Consigliamo **un backup settimanale** e prima di cambiare dispositivo.
- **Nessuna sincronizzazione cloud automatica**: il passaggio di dati si effettua manualmente con i file JSON.
- L'importazione dei progressi non impone che tutte le flashcard siano già pubblicate: una valutazione può restare conservata fino all'aggiunta del capitolo con lo stesso ID.

## Guida allo studio

1. In una materia, scegli *Schede nuove* per il primo ciclo.
2. Leggi la domanda, **prova a rispondere senza aiuto**, poi mostra la risposta.
3. Apri gli approfondimenti solo quando utili; valuta la risposta con uno dei quattro pulsanti.
4. In **Ripassi di oggi** affronta prima le schede scadute.
5. Non confondere *vista/affrontata* con *consolidata*: la seconda richiede più risposte buone nel tempo.

Il software non sostituisce esercizi numerici, simulazioni pratiche o il progetto EnerPrice, che rimangono attività separate.

## Struttura repository

```text
magistrale-flashcards/
├── index.html
├── styles.css
├── favicon.svg
├── .nojekyll
├── js/
│   ├── main.js          # UI, navigazione, sessioni
│   ├── catalog.js       # caricamento e validazione capitoli
│   ├── scheduler.js     # algoritmo ripassi e statistiche
│   └── db.js            # IndexedDB e backup
├── content/
│   ├── manifest.json
│   └── subjects/        # JSON capitoli da aggiungere
├── examples/
│   └── capitolo-template.json
├── docs/
│   └── AGGIUNGERE_CAPITOLI.md
└── tests/
    └── logic.test.js
```

## Versione

**1.0.0** — Prima versione funzionante: struttura multiesame, sessioni, ripassi, archiviazione, import/export; **in attesa dei manuali** per il popolamento didattico rigoroso capitolo per capitolo.
