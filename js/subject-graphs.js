// Positions are [column, row] in a three-column grid.
export const subjectGraphs = {
  cdg: {
    nodes: {
      impresa: ['Impresa e bilancio',[1,0],[1,2]],
      costi: ['Misurare i costi',[1,1],[3,4,5,6,7]],
      operativo: ['Decisioni operative',[0,2],[9,10]],
      budget: ['Piani e budget',[1,2],[12,13]],
      investimenti: ['Investimenti',[2,2],[11]],
      scostamenti: ['Scostamenti',[0,3],[8]],
      reporting: ['Performance',[1,3],[14,15]],
      pratica: ['Revisione ed esercizi',[2,3],[16]]
    },
    edges: [
      ['impresa','costi','Il bilancio rileva i risultati. La contabilità direzionale misura il consumo di risorse per oggetto.'],
      ['costi','operativo','Margini e costi rilevanti orientano le decisioni di breve periodo.'],
      ['costi','budget','Volumi, standard e costi alimentano i prospetti previsionali.'],
      ['costi','investimenti','Ricavi e costi previsti aiutano a stimare i flussi incrementali del progetto.'],
      ['budget','scostamenti','Il budget e gli standard forniscono il riferimento per spiegare le differenze di volume e gestione.'],
      ['budget','reporting','Obiettivi e responsabilità diventano indicatori da monitorare nei report.'],
      ['scostamenti','reporting','Il report collega gli scostamenti osservati alle cause e alle azioni da verificare.'],
      ['investimenti','pratica','Le simulazioni allenano la scelta del criterio e il confronto tra progetti.']
    ]
  },
  mca: {
    nodes: {
      strategia: ['Strategia di marketing',[1,0],[0]],
      quote: ['Quote e crescita',[0,1],[1]],
      segmenti: ['Segmentazione',[1,1],[2]],
      posizionamento: ['Posizionamento',[2,1],[3]],
      azioni: ['Azioni di marketing',[2,2],[4]],
      metriche: ['Metriche cliente',[1,2],[5]],
      regressione: ['Regressione e conjoint',[0,2],[6]],
      pratica: ['Formulario e simulazioni',[1,3],[7]]
    },
    edges: [
      ['strategia','quote','Gli obiettivi di crescita indicano quali quote e confronti osservare.'],
      ['strategia','segmenti','Bisogni e comportamenti aiutano a distinguere i segmenti da servire.'],
      ['segmenti','posizionamento','Il target scelto orienta il valore da comunicare e le alternative con cui confrontarsi.'],
      ['posizionamento','azioni','La proposta di valore guida prodotto, prezzo, comunicazione e distribuzione.'],
      ['azioni','metriche','Le metriche permettono di osservare acquisizione, esperienza e fedeltà dopo le azioni.'],
      ['metriche','regressione','Dati di acquisto e consumo permettono di studiare relazioni tra variabili e stimare comportamenti.'],
      ['quote','regressione','Le misure descrittive aiutano a interpretare le stime e a controllarne il perimetro.'],
      ['regressione','pratica','Le simulazioni fanno scegliere e interpretare modelli e metriche dentro una consegna.'],
      ['metriche','pratica','Il formulario collega ogni metrica al denominatore e al caso d’uso.']
    ]
  },
  cyber: {
    nodes: {
      principi: ['Obiettivi e design',[1,0],[1,2]],
      reti: ['Reti e segmentazione',[0,1],[0,9,10]],
      rischio: ['Rischio e privacy',[1,1],[7,11]],
      fiducia: ['Crittografia e identità',[2,1],[3,4]],
      difesa: ['Difesa e risposta',[0,2],[5,6]],
      protocolli: ['Canali sicuri',[2,2],[8]],
      pratica: ['Laboratorio e orale',[1,3],[12,13]]
    },
    edges: [
      ['principi','reti','I confini di fiducia aiutano a progettare segmenti e flussi consentiti.'],
      ['principi','rischio','Gli obiettivi di riservatezza, integrità e disponibilità definiscono gli impatti da valutare.'],
      ['principi','fiducia','Il minimo privilegio e la mediazione degli accessi orientano identità e autorizzazioni.'],
      ['reti','difesa','La segmentazione definisce punti di osservazione, filtraggio e contenimento.'],
      ['rischio','difesa','Priorità e impatto guidano prevenzione, rilevazione, risposta e ripristino.'],
      ['fiducia','protocolli','Chiavi, certificati e credenziali sostengono le garanzie dei protocolli.'],
      ['rischio','protocolli','I requisiti del servizio determinano quali dati e tratti del collegamento proteggere.'],
      ['difesa','pratica','Le prove difensive verificano i controlli e la qualità delle evidenze.'],
      ['protocolli','pratica','Il laboratorio fa ricostruire le garanzie effettive di ogni collegamento.']
    ]
  },
  si: {
    nodes: {
      processi: ['Processi e requisiti',[1,0],[1,2,3]],
      dati: ['Modelli e integrità',[0,1],[4,6]],
      uml: ['Modellazione UML',[1,2],[11]],
      web: ['Reti e Web',[2,1],[12]],
      query: ['Algebra e SQL',[0,2],[5,7,8]],
      dbms: ['DBMS e analisi dati',[0,3],[9,10]],
      formati: ['HTML, CSS e XML',[2,2],[13,14,15]],
      applicazioni: ['Applicazioni e MVC',[1,3],[16]]
    },
    edges: [
      ['processi','dati','Dai requisiti e dal modello concettuale si ricavano schema relazionale e vincoli.'],
      ['processi','uml','Obiettivi e flussi si descrivono anche con attori, casi d’uso, classi e sequenze.'],
      ['processi','web','I requisiti del servizio aiutano a definire come client e server comunicano.'],
      ['dati','query','Lo schema definisce le relazioni su cui operano algebra e interrogazioni SQL.'],
      ['query','dbms','Il DBMS traduce le interrogazioni in piani fisici e gestisce transazioni e accessi.'],
      ['web','formati','Il Web trasporta risorse che il client interpreta, presenta o scambia in formati strutturati.'],
      ['uml','applicazioni','Ruoli e interazioni modellati aiutano a distribuire le responsabilità nell’applicazione.'],
      ['dbms','applicazioni','L’applicazione coordina accesso ai dati, regole del dominio e transazioni.'],
      ['formati','applicazioni','Moduli e pagine sono il punto di contatto con controller e viste.']
    ]
  }
};
