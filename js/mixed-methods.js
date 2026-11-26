export const mixedMethods = {
  mca: [
    ['Strategia','Coerenza tra segmento e marketing mix'],
    ['Quote','Penetration Share','Tra 20 persone che acquistano una categoria, 7 acquistano anche la tua marca. Quale percentuale dei clienti della categoria raggiungi? Indica numeratore e denominatore.'],
    ['Segmentazione','Indice di Dunn','Due cluster hanno diametri 2 e 3. I punti più vicini appartenenti a gruppi diversi sono a distanza 6. Quantifica la separazione fra gruppi rispetto al diametro peggiore e interpreta il dato.'],
    ['Posizionamento','Modello del punto ideale','Il profilo preferito dal cliente è (2,3). Le offerte A e B sono rappresentate rispettivamente da (2,5) e (5,3). Se gli attributi hanno uguale peso e scala, quale offerta è più vicina al profilo? Indica entrambe le distanze.'],
    ['Prezzo','Punto di pareggio','Un prodotto ha costi fissi di 45.000 €, prezzo 35 € e costo variabile unitario 20 €. Quante unità devi vendere per coprire tutti i costi?'],
    ['Clienti','Retention e churn per coorte','Hai 250 clienti a inizio periodo. Di questi, 200 sono ancora presenti alla fine. Nel frattempo arrivano 30 nuovi clienti. Quale quota del gruppo iniziale resta e quale viene persa?'],
    ['Analisi quantitativa','Relazione lineare prezzo–frequenza','A prezzi di 5, 10 e 15 € osservi 9, 6 e 3 acquisti. Supponendo lineare la relazione, quanto cambia la frequenza per euro e qual è il valore previsto a prezzo zero?']
  ],
  si: [
    null,
    ['Processi','Indicatori di efficacia ed efficienza'],
    ['Progettazione','Associazione E-R e cardinalità','Ogni offerta appartiene a un cliente. Un cliente può esistere senza offerte e averne più di una. Proponi un modello concettuale e rendi esplicita l’obbligatorietà del legame.'],
    ['Prestazioni','Tavola degli accessi e costo pesato'],
    ['Progettazione','Traduzione relazionale di un’associazione N:M'],
    ['Interrogazioni','Selezione e proiezione','In ESAME(Matricola, Voto) vuoi le sole matricole distinte di chi ha almeno un voto pari o superiore a 28. Descrivi le trasformazioni da applicare alla relazione e il loro ordine.'],
    ['Integrità','Chiusura e chiave candidata','R(A,B,C) ha le dipendenze A→B e B→C. Partendo da A, quali attributi puoi determinare? Motiva se A basta a identificare una tupla e se è minimale.'],
    ['Interrogazioni','Aggregazione con GROUP BY e HAVING'],
    ['Integrità','Vista aggiornabile con WITH CHECK OPTION'],
    ['Prestazioni','Selettività e verifica del piano fisico','Una tabella ha un milione di righe. Una query ricorrente ne seleziona 200 ed è lenta. Quale misura calcoleresti, quale modifica valuteresti e come verificheresti l’effetto?'],
    ['Analisi dati','Modellazione dimensionale'],
    ['Progettazione','Diagrammi dei casi d’uso e di sequenza'],
    ['Web e reti','Distinzione tra risoluzione DNS e identità TLS','Il browser raggiunge l’indirizzo atteso per un sito, ma avverte che il certificato possiede un nome diverso. Quali operazioni sono riuscite e quale verifica resta insoddisfatta?'],
    ['Interfacce','Etichette accessibili e validazione del modulo'],
    ['Interfacce','Calcolo del box model CSS'],
    ['Integrità','Verifica di buona formazione e validità XML'],
    ['Architettura','Separazione delle responsabilità nel pattern MVC','Un utente invia un modulo per aggiornare un’offerta. Come distribuiresti ricezione della richiesta, regole sui dati e presentazione dell’esito?']
  ],
  cyber: [
    ['Reti','Ricostruzione del percorso client–server'],
    ['Governance','Ciclo di sicurezza e obiettivi CIA'],
    ['Identità','Separazione dei compiti e minimo privilegio'],
    ['Dati','Cifratura a riposo e derivazione delle password'],
    ['Identità','Revisione dei diritti nel ciclo Joiner–Mover–Leaver'],
    ['Operazioni','Continuità del servizio e mitigazioni proporzionate'],
    ['Operazioni','Valutazione di falsi positivi nel rilevamento'],
    ['Governance','Perdita annua attesa (ALE)'],
    ['Dati','Confini della protezione TLS'],
    ['Reti','Segmentazione e autenticazione della WLAN'],
    ['Reti','Controllo dei flussi tra VLAN'],
    ['Governance','Valutazione e documentazione di un potenziale data breach'],
    ['Dati','Verifica dell’identità del server'],
    ['Operazioni','Verifica del recupero e riesame dopo un incidente']
  ]
};

export const cyberMixedCases = [
  ['Un utente inserisce il nome di un portale e poi scarica un documento su un canale protetto. Ricostruisci il percorso dal nome alla risorsa e spiega il ruolo degli apparati locali.', 'La risoluzione DNS associa al nome un indirizzo. Switch e router inoltrano rispettivamente il traffico locale e tra reti. Il client raggiunge il servizio, verifica l’identità prevista durante TLS e poi scambia richieste e risposte HTTP attraverso il canale protetto.',12],
  ['Un servizio essenziale si interrompe e i dati risultano ancora corretti. Quale obiettivo è compromesso e come organizzeresti prevenzione, rilevazione, risposta e ripristino?', 'È compromessa la disponibilità. Documenta le dipendenze e le misure preventive, imposta indicatori e allarmi, assegna responsabilità per la risposta e verifica ripristino e continuità con prove documentate.',20],
  ['Una persona può inserire, approvare e pagare una stessa richiesta. Come cambieresti la distribuzione delle responsabilità e dei permessi?', 'Separa ruoli e approvazioni tra persone indipendenti. Assegna a ciascuna solo i permessi necessari e verifica ogni operazione al momento dell’uso. Registra e riesamina gli accessi privilegiati.',27],
  ['Devi proteggere un archivio da leggere in futuro e conservare informazioni con cui verificare password. Come tratti ciascun insieme di dati?', 'Per l’archivio usa cifratura con gestione separata delle chiavi e controlli di accesso. Per le password conserva un valore derivato con un algoritmo dedicato e salt individuale, poi verifica ricalcolando il valore al momento dell’accesso.',47],
  ['Una persona passa a un ruolo diverso e accede a più servizi tramite un’identità aziendale. Come eviti che le autorizzazioni si accumulino?', 'Aggiorna ruoli e attributi alla fonte, revoca i diritti divenuti superflui e controlla l’effetto sulle applicazioni e sulle sessioni. L’identità federata facilita l’accesso, mentre ciascun servizio deve applicare le proprie autorizzazioni.',58],
  ['Durante un picco un portale rallenta e alcune richieste legittime vengono rifiutate. Quali misure prenderesti e come controlleresti l’effetto sugli utenti?', 'Misura tasso di errori, latenza, saturazione e traffico rispetto al profilo abituale. Applica limiti proporzionati, proteggi la capacità essenziale e coordina il fornitore se serve. Verifica ripristino e impatto sui client legittimi.',77],
  ['Un sistema blocca automaticamente molti accessi. Il team trova che una quota crescente era legittima. Quali evidenze useresti per decidere se mantenere il blocco?', 'Esamina falsi positivi, precisione, severità degli eventi confermati e impatto sul servizio. Verifica l’etichettatura con il triage. Per la regola in esame valuta una soglia diversa o la sola segnalazione, con metriche di controllo e responsabilità chiare.',91],
  ['Un evento costa in media 10.000 € e si stima avvenga una volta ogni cinque anni. Quanto pesa in media all’anno? Come useresti il risultato nella scelta di una misura?', 'La frequenza annua è 0,2, quindi la perdita attesa è 2.000 € all’anno. Confronta il costo della misura con la riduzione di perdita attesa e prova stime alternative di frequenza e impatto.',116],
  ['Un browser accede a un portale attraverso un intermediario che termina il canale protetto. Come stabilisci quali tratti restano protetti e chi può leggere la richiesta?', 'Ricostruisci separatamente i tratti browser–intermediario e intermediario–server. Verifica se il secondo ha un proprio canale protetto e quali identità sono controllate sui due tratti. La terminazione rende la richiesta accessibile all’intermediario.',133],
  ['Un ufficio usa una sola rete radio per dipendenti, ospiti e sensori. Come riorganizzeresti l’accesso con requisiti diversi per i tre gruppi?', 'Definisci segmenti e policy distinti, con autenticazione aziendale e configurazione controllata dei client. Limita i flussi di ospiti e sensori agli usi previsti. Prevedi verifiche della configurazione e monitoraggio.',163],
  ['Un computer deve raggiungere un solo servizio ospitato in un altro segmento di rete. Quali controlli consentono il flusso richiesto e come verifichi gli altri?', 'Controlla indirizzamento, gateway e routing tra segmenti. Applica una policy con sorgente, destinazione e servizio ammessi. Verifica sia il flusso consentito sia i flussi che devono rimanere bloccati.',177],
  ['Un fornitore segnala una possibile esposizione di dati personali. Quali informazioni raccoglieresti prima di decidere come agire?', 'Documenta tempi, dati e soggetti interessati, sistemi coinvolti, diffusione possibile e misure già in essere. Valuta il rischio per le persone e coinvolgi i responsabili previsti. Registra valutazione, azioni e decisioni di notifica pertinenti al caso.',202],
  ['Il browser raggiunge il portale previsto ma segnala che l’identità presentata dal server non corrisponde al nome. Quale verifica è fallita e come documenti il risultato?', 'Il raggiungimento dell’indirizzo non prova l’identità del servizio. Verifica nome richiesto, nome sul certificato, validità e catena di fiducia. Registra configurazione ed esito della prova e ripetila dopo la correzione.',225],
  ['Un servizio è tornato disponibile dopo un incidente. Che cosa raccogli per dimostrare che il ripristino è effettivo e decidere quali controlli migliorare?', 'Controlla integrità dei dati, funzionamento con prove rappresentative e monitoraggio dopo il ripristino. Ricostruisci la cronologia con le evidenze. Documenta responsabilità, misure correttive e verifiche da ripetere.',247]
];
