import './aton-proxy.php/src/ATON.js';

const ATON_PROXY_BASE_URL = new URL('aton-proxy.php', window.location.href).href;
const statusEl = document.getElementById('atonStatus');
const params = new URLSearchParams(window.location.search);
const sid = params.get('sid');
let isSceneReady = false;
let pendingPOV = params.get('pov');
let pendingCustomCamera = parseCameraParam(params.get('camera'));

setStatus('Caricamento scena ATON...');

ATON.setBaseURL(ATON_PROXY_BASE_URL);
ATON.setPathCollection(`${ATON_PROXY_BASE_URL}/collections/`);

await import('./aton-proxy.php/hathor/main.js');

if (window.HATHOR?.UI?.modalSceneDescription) {
	window.HATHOR.UI.modalSceneDescription = () => {};
}

if (!sid || !/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(sid)) {
    setStatus('SID ATON non valido. Usa sid=user/scene-id.');
} else {
    window.HATHOR.setSceneToLoad(sid);
    window.HATHOR.run();
}

window.addEventListener('message', (event) => {
    const data = event.data || {};

    if (data.type === 'aton-goto-pov') {
        pendingPOV = data.pov;
        pendingCustomCamera = null;
        requestPOV(pendingPOV);
        return;
    }

    if (data.type === 'aton-goto-custom-camera') {
        pendingCustomCamera = data.camera || null;
        pendingPOV = null;
        requestCustomCamera(pendingCustomCamera);
    }
});

if (document.readyState === 'complete') {
    setTimeout(() => {
        moveHathorPanelsToRight();
        hideHathorPOVButtons();
        registerAtonHandlers();
    }, 0);
} else {
    window.addEventListener('load', () => {
        setTimeout(() => {
            moveHathorPanelsToRight();
            hideHathorPOVButtons();
            registerAtonHandlers();
        }, 0);
    });
}

function registerAtonHandlers() {
    ATON.on('SceneJSONLoaded', () => {
        handleSceneReady();
    });

    ATON.on('POVTransitionCompleted', (pov) => {
        notifyParent('aton-pov-completed', { sid, pov });
    });

    if (ATON.SceneHub?.currData) handleSceneReady();
}

function handleSceneReady() {
    if (isSceneReady) return;

    isSceneReady = true;
    setStatus('Scena caricata.', 'ready');

    moveHathorPanelsToRight();
    hideHathorPOVButtons();

    if (pendingPOV) requestPOV(pendingPOV);
    if (pendingCustomCamera) requestCustomCamera(pendingCustomCamera);

    notifyParent('aton-ready', { sid });
}

function moveHathorPanelsToRight() {
    const panel = window.HATHOR?.UI?._elSidePanel;
    if (!panel) return;

    panel.classList.remove('offcanvas-start');
    panel.classList.add('offcanvas-end');

    if (panel.dataset.storymapPlacement === 'right') return;

    window.HATHOR.UI._sidepanel?.dispose?.();
    window.HATHOR.UI._sidepanel = new bootstrap.Offcanvas(panel);
    panel.dataset.storymapPlacement = 'right';
}

function hideHathorPOVButtons() {
    if (window.HATHOR?.UI?._elPOVprev) {
        window.HATHOR.UI._elPOVprev.style.display = 'none';
    }

    if (window.HATHOR?.UI?._elPOVnext) {
        window.HATHOR.UI._elPOVnext.style.display = 'none';
    }
}

function requestPOV(povId) {
    if (!povId) return;

    if (!isSceneReady) {
        pendingPOV = povId;
        return;
    }

    if (povId === 'home') {
        ATON.Nav.requestHomePOV(1.0);
        return;
    }

    if (!ATON.Nav.getPOV(povId)) {
        setStatus(`Viewpoint ATON non trovato: ${povId}`);
        notifyParent('aton-pov-error', { sid, pov: povId });
        return;
    }

    ATON.Nav.requestPOVbyID(povId, 1.0);
}

function requestCustomCamera(cameraData) {
    if (!cameraData) return;

    if (!isSceneReady) {
        pendingCustomCamera = cameraData;
        return;
    }

    const pov = new ATON.POV();
    pov.setPosition(arrayToVector3(cameraData.position));
    pov.setTarget(arrayToVector3(cameraData.target));
    pov.setFOV(Number(cameraData.fov || ATON.Nav.getFOV()));
    ATON.Nav.requestPOV(pov, 1.0);
}

function parseCameraParam(cameraParam) {
    if (!cameraParam) return null;

    try {
        return JSON.parse(cameraParam);
    } catch (error) {
        return null;
    }
}

function arrayToVector3(values) {
    if (!Array.isArray(values) || values.length < 3) {
        return new THREE.Vector3();
    }

    return new THREE.Vector3(Number(values[0]), Number(values[1]), Number(values[2]));
}

function setStatus(message, state) {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.dataset.state = state || '';
}

function notifyParent(type, payload) {
    if (!window.parent || window.parent === window) return;

    window.parent.postMessage({ type, ...payload }, '*');
}
