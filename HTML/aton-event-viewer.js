import '../verticalstorymap3D/aton-proxy.php/src/ATON.js';

const ATON_PROXY_BASE_URL = new URL('../verticalstorymap3D/aton-proxy.php', window.location.href).href;
const statusEl = document.getElementById('atonEditorStatus');
const prevPovButton = document.getElementById('atonEditorPrevPov');
const homePovButton = document.getElementById('atonEditorHomePov');
const nextPovButton = document.getElementById('atonEditorNextPov');
const params = new URLSearchParams(window.location.search);
const sid = params.get('sid');
const parentOrigin = getParentOrigin();
let isSceneReady = false;
let pendingPOV = params.get('pov');
let currentPovId = pendingPOV || 'home';
let viewpointIds = [];
let lastRequestedPovId = pendingPOV || 'home';
let pendingCustomCamera = null;
let lastRequestedSelectionType = pendingPOV ? 'viewpoint' : '';
let freeCameraCaptureTimer = null;
let suppressFreeCameraCapture = false;

setStatus('Loading ATON scene...');

ATON.setBaseURL(ATON_PROXY_BASE_URL);
ATON.setPathCollection(`${ATON_PROXY_BASE_URL}/collections/`);

await import('../verticalstorymap3D/aton-proxy.php/hathor/main.js');

if (window.HATHOR?.UI?.modalSceneDescription) {
	window.HATHOR.UI.modalSceneDescription = () => {};
}

if (!sid || !/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(sid)) {
	setStatus('Invalid ATON scene ID.');
	notifyParent('aton-editor-scene-error', { sid, message: 'Invalid ATON scene ID.' });
} else {
	window.HATHOR.setSceneToLoad(sid);
	window.HATHOR.run();
}

window.addEventListener('message', (event) => {
	if (parentOrigin !== '*' && event.origin !== parentOrigin) {
		return;
	}

	const data = event.data || {};
	if (data.type === 'aton-editor-goto-pov') {
		pendingPOV = data.pov;
		pendingCustomCamera = null;
		requestPOVWhenAvailable(pendingPOV);
		return;
	}

	if (data.type === 'aton-editor-goto-custom-camera') {
		pendingCustomCamera = data.camera || null;
		pendingPOV = null;
		requestCustomCameraWhenAvailable(pendingCustomCamera);
	}
});

if (document.readyState === 'complete') {
	setTimeout(() => {
		moveHathorPanelsToRight();
		registerAtonHandlers();
	}, 0);
} else {
	window.addEventListener('load', () => {
		setTimeout(() => {
			moveHathorPanelsToRight();
			registerAtonHandlers();
		}, 0);
	});
}

function registerAtonHandlers() {
	bindEditorControls();

	ATON.on('SceneJSONLoaded', () => {
		handleSceneJsonReady();
	});

	ATON.on('AllNodeRequestsCompleted', (isFirstLoad) => {
		if (!isFirstLoad) {
			return;
		}

		handleSceneAssetsReady();
	});

	ATON.on('POVTransitionCompleted', (pov) => {
		suppressFreeCameraCapture = false;
		if (lastRequestedSelectionType === 'custom') {
			broadcastCustomCameraToParent(getCurrentCameraData());
			return;
		}

		const povId = resolvePOVId(pov) || lastRequestedPovId || 'home';
		broadcastCurrentPOVToParent(povId);
	});

	ATON.on('NavInteraction', (isActive) => {
		handleNavInteraction(isActive);
	});

	if (ATON.SceneHub?.currData) {
		handleSceneJsonReady();
	}
}

function handleSceneJsonReady() {
	if (isSceneReady) return;

	isSceneReady = true;
	viewpointIds = getSceneViewpointIds();
	setStatus('Scene loaded.', 'ready');
	moveHathorPanelsToRight();
	hideNativeAtonControls();
	hideStartupPanels();
	attachNativeHomeButtonListener();

	notifyParent('aton-editor-scene-ready', {
		sid,
		viewpoints: viewpointIds,
		currentPovId: currentPovId
	});
}

function handleSceneAssetsReady() {
	if (!pendingPOV) {
		if (pendingCustomCamera) {
			requestCustomCameraWhenAvailable(pendingCustomCamera);
		}
		return;
	}

	requestPOVWhenAvailable(pendingPOV);
	setTimeout(() => {
		requestPOVWhenAvailable(pendingPOV);
	}, 500);
	setTimeout(() => {
		requestPOVWhenAvailable(pendingPOV);
	}, 1200);
	setTimeout(() => {
		requestPOVWhenAvailable(pendingPOV);
	}, 2200);

	if (pendingCustomCamera) {
		requestCustomCameraWhenAvailable(pendingCustomCamera);
	}
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

function hideNativeAtonControls() {
	if (window.HATHOR?.UI?._elPOVprev) {
		window.HATHOR.UI._elPOVprev.style.display = 'none';
	}

	if (window.HATHOR?.UI?._elPOVnext) {
		window.HATHOR.UI._elPOVnext.style.display = 'none';
	}

	if (window.HATHOR?.UI?._elHome) {
		window.HATHOR.UI._elHome.style.display = 'none';
	}
}

function hideStartupPanels() {
	const panel = window.HATHOR?.UI?._elSidePanel;
	if (panel) {
		panel.classList.remove('show');
		panel.style.display = 'none';
	}

	const fsCover = document.getElementById('fscover');
	if (fsCover) {
		fsCover.style.display = 'none';
	}
}

function requestPOV(povId) {
	if (!povId) return;
	lastRequestedSelectionType = 'viewpoint';
	suppressFreeCameraCapture = true;
	lastRequestedPovId = povId;

	if (!isSceneReady) {
		pendingPOV = povId;
		currentPovId = povId;
		return;
	}

	if (povId === 'home') {
		currentPovId = 'home';
		ATON.Nav.requestHomePOV(1.0);
		return;
	}

	if (!ATON.Nav.getPOV(povId)) {
		setStatus(`ATON viewpoint not found: ${povId}`);
		notifyParent('aton-editor-scene-error', { sid, message: `ATON viewpoint not found: ${povId}` });
		return;
	}

	currentPovId = povId;
	ATON.Nav.requestPOVbyID(povId, 1.0);
}

function requestCustomCamera(cameraData) {
	if (!cameraData) return;
	lastRequestedSelectionType = 'custom';
	suppressFreeCameraCapture = true;

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

function requestPOVWhenAvailable(povId, remainingAttempts) {
	if (!povId) {
		return;
	}

	const attemptsLeft = remainingAttempts === undefined ? 20 : remainingAttempts;
	if (!isSceneReady) {
		pendingPOV = povId;
		return;
	}

	if (povId === 'home') {
		setTimeout(() => {
			requestPOV('home');
		}, 0);
		return;
	}

	if (ATON.Nav.getPOV(povId)) {
		requestPOV(povId);
		return;
	}

	if (attemptsLeft <= 0) {
		setStatus(`ATON viewpoint not found: ${povId}`);
		notifyParent('aton-editor-scene-error', { sid, message: `ATON viewpoint not found: ${povId}` });
		return;
	}

	setTimeout(() => {
		requestPOVWhenAvailable(povId, attemptsLeft - 1);
	}, 250);
}

function requestCustomCameraWhenAvailable(cameraData, remainingAttempts) {
	if (!cameraData) {
		return;
	}

	const attemptsLeft = remainingAttempts === undefined ? 20 : remainingAttempts;
	if (!isSceneReady) {
		pendingCustomCamera = cameraData;
		return;
	}

	if (attemptsLeft <= 0) {
		requestCustomCamera(cameraData);
		return;
	}

	setTimeout(() => {
		requestCustomCamera(cameraData);
	}, 250);
}

function bindEditorControls() {
	prevPovButton?.addEventListener('click', () => {
		navigateRelative(-1);
	});

	homePovButton?.addEventListener('click', () => {
		requestPOV('home');
	});

	nextPovButton?.addEventListener('click', () => {
		navigateRelative(1);
	});
}

function navigateRelative(step) {
	if (!isSceneReady || viewpointIds.length === 0) {
		return;
	}

	let currentIndex = viewpointIds.indexOf(currentPovId);
	if (currentIndex === -1) {
		currentIndex = step > 0 ? -1 : 0;
	}

	let nextIndex = currentIndex + step;
	if (nextIndex < 0) {
		nextIndex = viewpointIds.length - 1;
	}
	if (nextIndex >= viewpointIds.length) {
		nextIndex = 0;
	}

	requestPOV(viewpointIds[nextIndex]);
}

function attachNativeHomeButtonListener() {
	const homeButton = window.HATHOR?.UI?._elHome;
	if (!homeButton || homeButton.dataset.atonEditorBound === 'true') {
		return;
	}

	homeButton.addEventListener('click', () => {
		lastRequestedSelectionType = 'viewpoint';
		lastRequestedPovId = 'home';
		currentPovId = 'home';
		broadcastCurrentPOVToParent('home');
	});
	homeButton.dataset.atonEditorBound = 'true';
}

function getSceneViewpointIds() {
	return Object.keys(ATON.SceneHub?.currData?.viewpoints || {});
}

function resolvePOVId(pov) {
	if (typeof pov === 'string') {
		return pov;
	}

	if (pov && typeof pov.id === 'string') {
		return pov.id;
	}

	const viewpoints = ATON.SceneHub?.currData?.viewpoints || {};
	for (const viewpointId of Object.keys(viewpoints)) {
		const candidate = viewpoints[viewpointId];
		if (candidate === pov) {
			return viewpointId;
		}

		if (samePOV(candidate, pov)) {
			return viewpointId;
		}
	}

	return '';
}

function samePOV(left, right) {
	if (!left || !right) {
		return false;
	}

	return sameNumericArray(left.position, right.position) &&
		sameNumericArray(left.target, right.target) &&
		Number(left.fov) === Number(right.fov);
}

function sameNumericArray(left, right) {
	if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
		return false;
	}

	for (let i = 0; i < left.length; i += 1) {
		if (Math.abs(Number(left[i]) - Number(right[i])) > 0.0001) {
			return false;
		}
	}

	return true;
}

function handleNavInteraction(isActive) {
	if (isActive) {
		if (freeCameraCaptureTimer) {
			clearTimeout(freeCameraCaptureTimer);
			freeCameraCaptureTimer = null;
		}
		return;
	}

	if (suppressFreeCameraCapture) {
		return;
	}

	freeCameraCaptureTimer = setTimeout(() => {
		captureFreeCameraIfNeeded();
	}, 180);
}

function captureFreeCameraIfNeeded() {
	freeCameraCaptureTimer = null;
	if (suppressFreeCameraCapture || !isSceneReady) {
		return;
	}

	const matchedPovId = resolveCurrentCameraToKnownViewpoint();
	if (matchedPovId) {
		broadcastCurrentPOVToParent(matchedPovId);
		return;
	}

	broadcastCustomCameraToParent(getCurrentCameraData());
}

function resolveCurrentCameraToKnownViewpoint() {
	const currentCamera = getCurrentCameraData();
	if (!currentCamera) {
		return '';
	}

	if (ATON.Nav.homePOV && samePOV(serializePov(ATON.Nav.homePOV), currentCamera)) {
		return 'home';
	}

	const viewpoints = ATON.SceneHub?.currData?.viewpoints || {};
	for (const viewpointId of Object.keys(viewpoints)) {
		if (samePOV(viewpoints[viewpointId], currentCamera)) {
			return viewpointId;
		}
	}

	return '';
}

function getCurrentCameraData() {
	const pov = ATON.Nav.copyCurrentPOV();
	if (!pov) {
		return null;
	}

	return serializePov(pov);
}

function serializePov(pov) {
	return {
		position: [Number(pov.pos.x), Number(pov.pos.y), Number(pov.pos.z)],
		target: [Number(pov.target.x), Number(pov.target.y), Number(pov.target.z)],
		fov: Number(pov.fov || ATON.Nav.getFOV())
	};
}

function arrayToVector3(values) {
	return new THREE.Vector3(Number(values[0]), Number(values[1]), Number(values[2]));
}

function setStatus(message, state) {
	if (!statusEl) return;

	statusEl.textContent = message;
	statusEl.dataset.state = state || '';
}

function notifyParent(type, payload) {
	if (!window.parent || window.parent === window) return;

	window.parent.postMessage({ type, ...payload }, parentOrigin);
}

function broadcastCurrentPOVToParent(povId) {
	lastRequestedSelectionType = 'viewpoint';
	currentPovId = povId || 'home';
	notifyParent('aton-editor-pov-changed', { sid, povId: currentPovId });
}

function broadcastCustomCameraToParent(camera) {
	lastRequestedSelectionType = 'custom';
	currentPovId = '';
	notifyParent('aton-editor-custom-camera-changed', { sid, camera });
}

function getParentOrigin() {
	if (!document.referrer) {
		return '*';
	}

	try {
		return new URL(document.referrer).origin;
	} catch (error) {
		return '*';
	}
}
