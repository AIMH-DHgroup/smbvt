# Viewer ATON Locale

Questa documentazione descrive il viewer ATON personalizzato usato dalla storymap.

File principali:

```text
aton-viewer.html
aton-viewer.js
aton-proxy.php
```

## Perche' Esiste Un Viewer Locale

L'iframe ufficiale ATON, per esempio:

```text
https://aton.ispc.cnr.it/s/vhlab/sid-ac9lddw5w
```

mostra correttamente la scena, ma non puo' essere comandato direttamente dalla pagina della storymap per via della Same-Origin Policy del browser.

In particolare, dalla storymap non si puo' fare in modo affidabile:

```js
iframe.contentWindow.ATON.Nav.requestPOVbyID(...)
```

Per questo e' stato creato un viewer locale che carica il framework ATON e accetta comandi tramite `postMessage`.

## Flusso Di Caricamento

La storymap crea un iframe verso il viewer locale:

```text
aton-viewer.html?sid=vhlab/sid-ac9lddw5w&pov=pov-nuhqoxjyy
```

Parametri supportati:

- `sid`: scena ATON da caricare, nel formato `utente/id`
- `pov`: viewpoint iniziale opzionale
- `camera`: camera custom opzionale serializzata come JSON URL-encoded

Esempio:

```text
aton-viewer.html?sid=dronchi/20260421-4db7283caa53&pov=home
```

Esempio con camera custom:

```text
aton-viewer.html?sid=vhlab/sid-ac9lddw5w&camera=%7B%22position%22%3A%5B0.1%2C63.4%2C0.5%5D%2C%22target%22%3A%5B-0.06%2C63.8%2C3.0%5D%2C%22fov%22%3A61%7D
```

## `aton-viewer.html`

Questo file prepara la pagina del viewer.

Include:

- Bootstrap ATON
- CSS ATON
- CSS Hathor
- container richiesti da Hathor
- script `aton-viewer.js`

Container importanti:

```html
<div id="sideToolbar" class="aton-toolbar-left hathor-main-toolbar"></div>
<div id="bottomToolbar" class="hathor-bottom-toolbar"></div>
<div id="tasks"></div>
<div id="task-descr"></div>
<div id="userToolbar"></div>
```

La toolbar ufficiale Hathor viene spostata a destra via CSS:

```css
#sideToolbar {
    left: auto !important;
    right: 4px !important;
}
```

In modalita' telefono viene nascosta:

```css
@media (max-width: 575px) {
    #sideToolbar {
        display: none !important;
    }
}
```

## `aton-viewer.js`

Questo file contiene la logica del viewer.

### Base URL ATON Locale

ATON viene configurato per passare dal proxy locale:

```js
const ATON_PROXY_BASE_URL = new URL('aton-proxy.php', window.location.href).href;

ATON.setBaseURL(ATON_PROXY_BASE_URL);
ATON.setPathCollection(`${ATON_PROXY_BASE_URL}/collections/`);
```

Questo fa in modo che chiamate e asset vengano richiesti a URL locali come:

```text
aton-proxy.php/api/v2/scenes/...
aton-proxy.php/collections/...
aton-proxy.php/src/...
aton-proxy.php/hathor/...
```

### Caricamento Di Hathor

Il viewer usa la UI ufficiale Hathor:

```js
await import('./aton-proxy.php/hathor/main.js');
```

Poi imposta la scena:

```js
window.HATHOR.setSceneToLoad(sid);
window.HATHOR.run();
```

### Comando Dei Viewpoint E Della Camera

Il viewer ascolta messaggi dalla storymap:

```js
window.addEventListener('message', (event) => {
    const data = event.data || {};

    if (data.type !== 'aton-goto-pov') return;

    pendingPOV = data.pov;
    requestPOV(pendingPOV);
});
```

Il comando atteso e':

```js
{
  type: "aton-goto-pov",
  pov: "pov-nuhqoxjyy"
}
```

Oppure, per una camera libera:

```js
{
  type: "aton-goto-custom-camera",
  camera: {
    position: [0.0135, 63.4992, 0.5434],
    target: [-0.0679, 63.8048, 3.0431],
    fov: 61
  }
}
```

Per spostare la camera viene usato:

```js
ATON.Nav.requestPOVbyID(povId, 1.0);
```

Per il viewpoint home:

```js
ATON.Nav.requestHomePOV(1.0);
```

Per una camera custom il viewer costruisce un `ATON.POV()` e chiama:

```js
ATON.Nav.requestPOV(pov, 1.0);
```

### Pannelli A Destra

Hathor crea alcuni pannelli come `offcanvas-start`. Il viewer li sposta a destra:

```js
function moveHathorPanelsToRight() {
    const panel = window.HATHOR?.UI?._elSidePanel;
    if (!panel) return;

    panel.classList.remove('offcanvas-start');
    panel.classList.add('offcanvas-end');

    window.HATHOR.UI._sidepanel?.dispose?.();
    window.HATHOR.UI._sidepanel = new bootstrap.Offcanvas(panel);
}
```

ATON.UI ha gia' il proprio side panel a destra, quindi annotazioni e descrizioni semantic vengono mostrate sul lato destro.

Nel viewer usato dalla storymap viene anche disattivato il popup automatico con la descrizione iniziale della scena:

```js
window.HATHOR.UI.modalSceneDescription = () => {};
```

### Bottoni Viewpoint Hathor Nascosti

Hathor aggiunge bottoni in basso per navigare tra viewpoint. Nel viewer della storymap vengono nascosti per non interferire con le frecce custom:

```js
function hideHathorPOVButtons() {
    if (window.HATHOR?.UI?._elPOVprev) {
        window.HATHOR.UI._elPOVprev.style.display = 'none';
    }

    if (window.HATHOR?.UI?._elPOVnext) {
        window.HATHOR.UI._elPOVnext.style.display = 'none';
    }
}
```

## `aton-proxy.php`

Il proxy serve per evitare problemi CORS.

ATON non espone sempre header CORS per moduli JavaScript, modelli 3D e asset. Il browser bloccherebbe import e fetch diretti da `https://aton.ispc.cnr.it`.

Il proxy permette solo alcune cartelle ATON:

```php
$allowedPrefixes = [
    'api/v2/',
    'collections/',
    'dist/',
    'hathor/',
    'res/',
    'src/',
    'vendors/',
];
```

Esempi di URL proxati:

```text
aton-proxy.php/src/ATON.js
aton-proxy.php/hathor/main.js
aton-proxy.php/api/v2/scenes/vhlab/sid-ac9lddw5w
aton-proxy.php/collections/vhlab/models/tomba/tomba.gltf
```

## JSON Scena ATON

La scena ATON viene recuperata tramite API:

```text
/api/v2/scenes/{utente}/{id}
```

Esempio:

```text
aton-proxy.php/api/v2/scenes/vhlab/sid-ac9lddw5w
```

Nel JSON scena sono presenti:

- modello 3D: `scenegraph.nodes[*].urls`
- viewpoints: `viewpoints`
- annotazioni/semantica: `semanticgraph.nodes`
- descrizioni semantiche: `semanticgraph.nodes[*].description`

## Viewpoint ATON

Un viewpoint ATON ha una struttura simile:

```json
"pov-nuhqoxjyy": {
  "position": [0.0135, 63.4992, 0.5434],
  "target": [-0.0679, 63.8048, 3.0431],
  "fov": 61
}
```

Nella narrazione, per ATON, il campo:

```json
"annotationNumber3DModel": "pov-nuhqoxjyy"
```

deve contenere l'ID del viewpoint.

Per tornare alla vista home:

```json
"annotationNumber3DModel": "home"
```

## Esempi Di Configurazione JSON

Con SID completo:

```json
{
  "Atonid": "dronchi/20260421-4db7283caa53",
  "annotationNumber3DModel": "home"
}
```

Con solo ID finale, risolto automaticamente:

```json
{
  "Atonid": "20260421-4db7283caa53",
  "annotationNumber3DModel": "home"
}
```

Con URL completo:

```json
{
  "Atonid": "https://aton.ispc.cnr.it/s/dronchi/20260421-4db7283caa53",
  "annotationNumber3DModel": "home"
}
```

## Comunicazione Storymap -> Viewer

La storymap non controlla ATON direttamente. Invia un messaggio all'iframe:

```js
iframe.contentWindow.postMessage({
  type: "aton-goto-pov",
  pov: viewpoint
}, "*");
```

Il viewer riceve il messaggio e chiama le API ATON locali:

```js
ATON.Nav.requestPOVbyID(povId, 1.0);
```

## Note Di Manutenzione

- Se si vuole cambiare il comportamento del viewer ATON, modificare `aton-viewer.js`.
- Se si vuole cambiare aspetto/posizione di toolbar e pannelli, modificare il CSS in `aton-viewer.html`.
- Se ATON aggiunge nuove cartelle da caricare, aggiungerle a `$allowedPrefixes` in `aton-proxy.php`.
- Se un asset non carica, controllare prima che il suo path passi dal proxy.
- Se un viewpoint non funziona, verificare che il suo ID esista nel campo `viewpoints` del JSON scena ATON.
