# Active Paths

## Main App

- `SMBVT_2.0.html`: main login/home page
- `toolNew.html`: active narrative builder
- `lib/demo-introNew.js`: active home/login client script
- `lib/demo-narraMapsNew.ui.js`: builder UI/client helpers
- `lib/demo-narraMapsNew.wikidata.js`: builder Wikidata/Wikipedia bootstrap
- `lib/demo-narraMapsNew.persistence.js`: builder persistence/publish layer
- `lib/demo-narraMapsNew.events.js`: builder event form/save-load layer
- `lib/demo-narraMapsNew.js`: builder main residual glue/utility layer

## Active Builder APIs

- `PHP/initNarrative.php`: unified builder bootstrap
- `PHP/session.php`: home session check
- `PHP/conn2.php`: username/password login
- `PHP/insertDb.php`: single object save
- `PHP/saveObjectsBatch.php`: batch save for bootstrap objects
- `PHP/deleteDb.php`: single object delete
- `PHP/narrationTitle.php`: narrative title read/update
- `PHP/uploadImage.php`: entity image upload
- `PHP/uploadEventImage.php`: event/cover image upload
- `PHP/saveTempJsonPreviewStorymap.php`: temp JSON for preview
- `PHP/publishAndTriplifyNarration.php`: publish old visualizations + OWL/triplify pipeline
- `PHP/downloadOwl.php`: check OWL presence
- `PHP/deleteNarration.php`: delete full narrative
- `PHP/sessionClose.php`: logout

## Active Shared PHP Helpers

- `PHP/PgConn.php`: DB bootstrap
- `PHP/api_helpers.php`: shared API helpers

## Visualizations

### New Vertical Storymap

- `verticalstorymap3D/index.php`
- `verticalstorymap3D/previewStorymap.php`
- `verticalstorymap3D/visualizeOrizontalStorymapIndex.js`
- `verticalstorymap3D/storymap.2.5.js`
- `verticalstorymap3D/globeminimap.js`

### Other Vertical Variants Kept

- `verticalstorymap3D/indexClaudio.php`
- `verticalstorymap3D/violtwin.php`
- `verticalstorymap3D/visualizeOrizontalStorymapNewCon3DClaudio.js`
- `verticalstorymap3D/visualizeOrizontalStorymapVioltwin.js`

### Old Horizontal Storymap / Timeline

- generated output: `storymaps/[USER]/N[ID]/index.html`
- generated data: `storymaps/[USER]/N[ID]/slide.json`
- runtime lib: `storymaps/lib/visualization.js`
- shared frontend libs used by published stories:
  - `lib/storymap.js`
  - `lib/timeline-min.js`

## Demo Kept

- `demo.html`
- `toolDemo.html`
- `lib/demo-intro-userDemo.js`
- `lib/demo-narraMaps3-userDemo.js`
- `PHP/sessionDemo.php`

## Legacy Files Still Kept Because Referenced

These are not part of the main active builder flow, but are still referenced by demo pages, old tools, or old publish/preview variants:

- `lib/demo-intro.js`
- `lib/demo-intro-2.js`
- `lib/demo-narra.js`
- `lib/demo-narraMaps.js`
- `lib/demo-narraMaps3.js`
- `lib/demo-narraMaps3Nuovo.js`
- `lib/demo-narraMaps32.js`
- `lib/demo-narraMaps4.js`
- `lib/demo-narraVecchio.js`
- `PHP/narra-jsGetNarration.php`
- `PHP/startQueries.php`
- `PHP/publishMap.php`
- `PHP/triplify.php`
- `PHP/A1forTriplify.php`
- `PHP/previewStorymapPolygons.php`
- `PHP/deletTempJson.php`

## Admin / Utility Pages Kept

- `PHP/assignNarrativeTo.php`
- `PHP/seeUsersNarratives.php`
- `PHP/countData.php`
- `PHP/getEventsFromTable.php`

## Notes

- Files removed so far were either backup files (`*.back`) or clearly disconnected test scripts.
- Before removing any remaining legacy file, first remove all references to it from demo/old tool entrypoints.
