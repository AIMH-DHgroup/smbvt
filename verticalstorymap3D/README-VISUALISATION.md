# Vertical Storymap 3D

Questa cartella contiene la visualizzazione verticale/orizzontale della storymap 3D.

Il punto di ingresso principale e':

```text
index.php
```

La logica principale di costruzione della pagina e':

```text
visualizeOrizontalStorymapIndex.js
```

## URL Di Esempio

```text
/verticalstorymap3D/?user=adminNarra.1&id=N3261
```

Con questi parametri la pagina carica il JSON:

```text
../storymaps/adminNarra.1/N3261/slide.json
```

Se e' presente `preview=1`, invece carica:

```text
../TempJson/{user}-{id}-slide.json
```

## Struttura Generale

`index.php` prepara l'HTML base:

- contenitore mappa/modello: `.storymap-map`
- contenitore testo/eventi: `.storymap-story`
- slide iniziale `scene1`
- frecce principali `#arrowUp` e `#arrowDown`
- frecce custom `.storymap-scroll-top1` e `.storymap-scroll-down1`
- inclusione di `storymap.2.5.js`
- inclusione di `visualizeOrizontalStorymapIndex.js`

`visualizeOrizontalStorymapIndex.js`:

- legge `user`, `id`, `start`, `preview` dalla query string
- carica il JSON della narrazione
- ordina gli eventi per `position`
- crea dinamicamente le sezioni HTML degli eventi
- crea la configurazione `scenes` per `storymap.2.5.js`
- inizializza la storymap
- gestisce il cambio slide/evento
- mostra/nasconde mappa, modelli 3D, immagini di background e controlli

## Tipi Di Evento Supportati

Il JavaScript distingue gli eventi in base ai campi presenti nel JSON.

### Evento Geografico

Un evento con coordinate o geometrie viene mostrato sulla mappa Leaflet.

La scena associata viene salvata in `scenes["sceneX"]` con:

```js
{
  lat: ...,
  lng: ...,
  zoom: ...,
  name: ...,
  layers: [...]
}
```

### Evento Sketchfab

Un evento Sketchfab usa il campo:

```json
"sketchfabid": "..."
```

Il viewer viene creato con un iframe Sketchfab e comandato tramite la Sketchfab Viewer API:

```js
api.gotoAnnotation(...)
api.showAnnotation(...)
api.showAnnotationTooltip(...)
```

Il campo:

```json
"annotationNumber3DModel": "1"
```

viene interpretato come numero di annotazione Sketchfab. Nel codice viene convertito in indice zero-based:

```js
parseInt(annotationNumber3DModel) - 1
```

Se l'evento Sketchfab non usa un'annotazione ma una camera libera salvata dal builder, puo' essere presente invece:

```json
"annotationNumber3DModelCustom": {
  "position": [1.2, 0.5, -0.7],
  "target": [0.0, 0.3, 0.0],
  "fov": 45
}
```

In questo caso la visualizzazione usa `setCameraLookAt(...)` e `setFov(...)` invece di `gotoAnnotation(...)`.

### Evento ATON

Un evento ATON usa il campo:

```json
"Atonid": "..."
```

Il viewer non punta direttamente all'iframe ufficiale ATON, ma al viewer locale:

```text
aton-viewer.html
```

Esempio generato:

```text
aton-viewer.html?sid=vhlab/sid-ac9lddw5w&pov=pov-nuhqoxjyy
```

Oppure, se l'evento usa una camera libera:

```text
aton-viewer.html?sid=vhlab/sid-ac9lddw5w&camera={...url-encoded...}
```

Il campo:

```json
"annotationNumber3DModel": "pov-nuhqoxjyy"
```

per ATON non e' un numero: e' l'ID del viewpoint ATON.

Se l'evento non usa un viewpoint nominato ma una camera libera salvata dal builder, puo' essere presente invece:

```json
"annotationNumber3DModelCustom": {
  "position": [0.0135, 63.4992, 0.5434],
  "target": [-0.0679, 63.8048, 3.0431],
  "fov": 61
}
```

Formati accettati per `Atonid`:

```json
"Atonid": "sid-ac9lddw5w"
```

```json
"Atonid": "vhlab/sid-ac9lddw5w"
```

```json
"Atonid": "https://aton.ispc.cnr.it/s/vhlab/sid-ac9lddw5w"
```

Se viene indicato solo l'ID finale, la visualizzazione assume come default `vhlab/id`.

### Evento Slide Con Background

Se l'evento non e' mappa, Sketchfab o ATON, viene trattato come slide testuale/visuale con immagine di background.

Campo usato:

```json
"backgroundImg": "..."
```

Se non presente, viene usata l'immagine di default:

```text
../images/slideBlack.png
```

## Navigazione Tra Eventi

La navigazione e' gestita da `storymap.2.5.js`, in particolare dalle frecce:

```text
.storymap-scroll-down1
.storymap-scroll-top1
#arrowDown
#arrowUp
```

Quando si cambia evento:

- viene aggiornata la sezione visibile
- viene mostrato/nascosto il modello 3D corretto
- viene nascosta la mappa quando l'evento e' 3D
- viene mostrata la mappa quando l'evento e' geografico
- per Sketchfab viene chiamata la Viewer API
- per ATON viene inviato un comando `postMessage` al viewer locale

Per Sketchfab, se l'evento ha `annotationNumber3DModelCustom`, la camera viene posizionata con:

```js
api.setCameraLookAt(position, target, 1.0, ...)
api.setFov(fov, ...)
```

Se invece ha `annotationNumber3DModel`, viene usato il flusso classico:

```js
api.gotoAnnotation(...)
```

Il comando inviato ad ATON e':

```js
iframe.contentWindow.postMessage({
  type: "aton-goto-pov",
  pov: viewpoint
}, "*");
```

Oppure, per una camera custom:

```js
iframe.contentWindow.postMessage({
  type: "aton-goto-custom-camera",
  camera: customCamera
}, "*");
```

## Funzioni ATON Nel File Principale

### `getAtonSID(atonId)`

Normalizza il valore di `Atonid`.

Accetta:

- URL completo ATON
- `utente/id`
- solo `id`

Se riceve solo `id`, la visualizzazione lo normalizza in `vhlab/id`.

### `getModelDomId(modelId)`

Crea un ID HTML sicuro sostituendo caratteri non validi, per esempio `/`, con `_`.

Serve per evitare problemi quando `Atonid` contiene `utente/id` o un URL completo.

### `sendAtonViewpoint(section)`

Individua l'iframe ATON associato alla sezione e manda il comando per spostare il viewer:

- al viewpoint indicato se e' presente `annotationNumber3DModel`
- alla camera custom se e' presente `annotationNumber3DModelCustom`

## Campi JSON Importanti

Per Sketchfab:

```json
{
  "sketchfabid": "60523828541544d3aee54268eccc770f",
  "annotationNumber3DModel": "2"
}
```

Oppure, con camera libera:

```json
{
  "sketchfabid": "60523828541544d3aee54268eccc770f",
  "annotationNumber3DModelCustom": {
    "position": [1.2, 0.5, -0.7],
    "target": [0.0, 0.3, 0.0],
    "fov": 45
  }
}
```

Per ATON:

```json
{
  "Atonid": "dronchi/20260421-4db7283caa53",
  "annotationNumber3DModel": "home"
}
```

Oppure:

```json
{
  "Atonid": "20260421-4db7283caa53",
  "annotationNumber3DModel": "home"
}
```

Oppure, con camera libera:

```json
{
  "Atonid": "vhlab/sid-ac9lddw5w",
  "annotationNumber3DModelCustom": {
    "position": [0.0135, 63.4992, 0.5434],
    "target": [-0.0679, 63.8048, 3.0431],
    "fov": 61
  }
}
```

## Note Operative

- Per ATON, `annotationNumber3DModel` deve contenere un ID viewpoint, non un numero.
- In alternativa, per ATON puo' essere presente `annotationNumber3DModelCustom` con una camera completa.
- Per Sketchfab, `annotationNumber3DModel` resta un numero di annotazione.
- In alternativa, per Sketchfab puo' essere presente `annotationNumber3DModelCustom` con una camera completa.
- La navigazione ATON non usa l'iframe ufficiale remoto, ma il viewer locale `aton-viewer.html`.
- Il viewer ATON locale e' documentato separatamente in `README-ATON-VIEWER.md`.
