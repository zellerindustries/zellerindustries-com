var c = Object.freeze({
    400: {
      title: 'Richiesta non valida',
      description: 'La richiesta non \xE8 corretta o non pu\xF2 essere elaborata dal server.',
    },
    401: {
      title: 'Non autorizzato',
      description: '\xC8 necessario accedere per visualizzare questa pagina.',
    },
    403: {
      title: 'Accesso negato',
      description: 'Non disponi dei permessi per accedere a questa risorsa.',
    },
    404: {
      title: 'Pagina non trovata',
      description:
        "La pagina richiesta non esiste, \xE8 stata rimossa o l'indirizzo non \xE8 corretto.",
    },
    408: {
      title: 'Tempo di attesa scaduto',
      description: 'La connessione ha impiopato troppo tempo. Riprova a caricare la pagina.',
    },
    429: {
      title: 'Troppe richieste',
      description: 'Hai inviato troppe richieste in poco tempo. Attendi qualche istante e riprova.',
    },
    500: {
      title: 'Errore del server',
      description:
        'Si \xE8 verificato un problema momentaneo sui nostri sistemi. Stiamo lavorando per risolverlo, riprova pi\xF9 tardi.',
    },
  }),
  d = '404';
(() => {
  'use strict';
  let o = window.location.search.match(/[?&]code=([^&]*)/),
    t = o ? o[1] : null,
    e = d;
  t &&
    (t.charCodeAt(0) === 53 ? (e = '500') : Object.prototype.hasOwnProperty.call(c, t) && (e = t));
  let i = c[e],
    r = document.getElementById('code-text'),
    a = document.getElementById('error-code'),
    n = document.getElementById('heading'),
    s = document.getElementById('description');
  (r && (r.textContent = e),
    n && (n.textContent = i.title),
    s && (s.textContent = i.description),
    a && a.setAttribute('aria-label', `Errore ${e}`),
    (document.title = `${e} - ${i.title}`));
})();
