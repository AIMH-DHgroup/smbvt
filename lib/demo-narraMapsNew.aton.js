"use strict";

var narraAtonEditor = (function() {
	var state = {
		initialized: false,
		active: false,
		loadedSceneId: "",
		currentPovId: "",
		currentCustomCamera: null,
		lastTypedModelId: ""
	};

	function init() {
		if (state.initialized) {
			return;
		}

		$(window).on("message", handleViewerMessage);
		$(document).on("click", "#load-aton-model", function() {
			loadCurrentModel();
		});
		$(document).on("input", "#id-text", handleModelIdInputChange);
		state.initialized = true;
	}

	function setFormType(formType) {
		init();
		state.active = normalizeEventFormType(formType) === "Aton";

		$("#aton-editor-group").toggle(state.active);
		$("#number-text").prop("readonly", state.active);

		if (state.active) {
			hideViewpointField();
			if (!$("#number-text").val().trim()) {
				setStatus("Insert a model ID, then load the ATON scene.");
			}
		} else {
			hideViewer();
			setStatus("");
			state.loadedSceneId = "";
			state.currentPovId = "";
			state.currentCustomCamera = null;
			state.lastTypedModelId = "";
		}
	}

	function reset() {
		if (!state.initialized) {
			return;
		}

		state.loadedSceneId = "";
		state.currentPovId = "";
		state.currentCustomCamera = null;
		state.lastTypedModelId = "";
		$("#number-text").prop("readonly", false);
		hideViewpointField();
		hideViewer();
		setStatus("Insert a model ID, then load the ATON scene.");
	}

	function loadFromEvent(event) {
		if (!event || normalizeEventFormType(event.formType) !== "Aton") {
			return;
		}

		setFormType("Aton");
		state.currentPovId = event.annotationNumber3DModel || "";
		state.currentCustomCamera = event.annotationNumber3DModelCustom || null;
		state.lastTypedModelId = event.Atonid || "";

		if (event.Atonid) {
			loadModel(event.Atonid, event.annotationNumber3DModel || "", true);
		} else {
			setStatus("Insert a model ID, then load the ATON scene.");
		}
	}

	function loadCurrentModel() {
		loadModel($("#id-text").val().trim(), $("#number-text").val().trim(), false);
	}

	function loadModel(modelId, selectedPov, allowLegacyId) {
		if (!state.active) {
			return;
		}

		var normalizedSceneId = normalizeSceneId(modelId, allowLegacyId);
		if (!normalizedSceneId) {
			$("#id-text").addClass("has-error-sketch");
			setStatus("Insert a valid ATON model ID in the format owner/scene-id before loading the scene.");
			hideViewer();
			return;
		}

		state.loadedSceneId = normalizedSceneId;
		state.currentPovId = selectedPov || "";
		if (selectedPov) {
			state.currentCustomCamera = null;
		}
		state.lastTypedModelId = modelId;
		$("#id-text").removeClass("has-error-sketch");
		hideViewpointField();
		setStatus("Loading ATON scene...");

		var viewerUrl = "HTML/aton-event-viewer.html?sid=" + encodeURIComponent(normalizedSceneId);
		if (selectedPov) {
			viewerUrl += "&pov=" + encodeURIComponent(selectedPov);
		}

		$("#aton-editor-frame").attr("src", viewerUrl);
		$("#aton-editor-frame-wrap").show();
	}

	function handleModelIdInputChange() {
		if (!state.active) {
			return;
		}

		var currentValue = $("#id-text").val().trim();
		$("#id-text").removeClass("has-error-sketch");

		if (currentValue === state.lastTypedModelId) {
			return;
		}

		state.loadedSceneId = "";
		state.currentPovId = "";
		state.currentCustomCamera = null;
		state.lastTypedModelId = currentValue;
		$("#number-text").val("");
		hideViewpointField();
		hideViewer();

		if (currentValue) {
			setStatus("Model ID changed. Load the ATON scene to choose a viewpoint.");
		} else {
			setStatus("Insert a model ID, then load the ATON scene.");
		}
	}

	function handleViewerMessage(event) {
		var messageEvent = event.originalEvent || event;
		if (!state.active || messageEvent.origin !== window.location.origin) {
			return;
		}

		var data = messageEvent.data;
		if (!data || typeof data !== "object") {
			return;
		}

		if (data.type === "aton-editor-scene-ready") {
			showViewpointField();
			setStatus("Scene loaded. Navigate the model to choose a viewpoint.");
			var selectedPovId = $("#number-text").val().trim();
			if (selectedPovId) {
				sendViewerToPov(selectedPovId);
				setTimeout(function() {
					sendViewerToPov(selectedPovId);
				}, 700);
				setTimeout(function() {
					sendViewerToPov(selectedPovId);
				}, 1500);
			} else if (state.currentCustomCamera) {
				sendViewerToCustomCamera(state.currentCustomCamera);
			} else if (data.currentPovId) {
				applySelectedPov(data.currentPovId, true);
			}
		} else if (data.type === "aton-editor-pov-changed") {
			if (data.povId) {
				applySelectedPov(data.povId, true);
			} else {
				setStatus("The scene moved, but the current viewpoint could not be resolved.");
			}
		} else if (data.type === "aton-editor-custom-camera-changed") {
			applyCustomCamera(data.camera);
		} else if (data.type === "aton-editor-scene-error") {
			setStatus(data.message || "Unable to load the ATON scene.");
			hideViewer();
		}
	}

	function applySelectedPov(povId, fromViewer) {
		state.currentPovId = povId;
		state.currentCustomCamera = null;
		$("#number-text").removeClass("has-error-sketch");
		$("#number-text").val(povId);
		showViewpointField();
		setStatus((fromViewer ? "Selected viewpoint" : "Current viewpoint") + ": " + povId);
	}

	function applyCustomCamera(camera) {
		if (!camera) {
			return;
		}

		state.currentPovId = "";
		state.currentCustomCamera = camera;
		$("#number-text").removeClass("has-error-sketch");
		$("#number-text").val("");
		showViewpointField();
		setStatus("Selected free camera position.");
	}

	function normalizeSceneId(modelId, allowLegacyId) {
		var value = (modelId || "").trim();
		if (!value) {
			return "";
		}

		if (/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(value)) {
			return value;
		}

		if (allowLegacyId && /^[A-Za-z0-9_-]+$/.test(value)) {
			return "vhlab/" + value;
		}

		return "";
	}

	function hideViewer() {
		$("#aton-editor-frame-wrap").hide();
		$("#aton-editor-frame").attr("src", "about:blank");
	}

	function sendViewerToPov(povId) {
		var iframe = document.getElementById("aton-editor-frame");
		if (!iframe || !iframe.contentWindow || !povId) {
			return;
		}

		iframe.contentWindow.postMessage({
			type: "aton-editor-goto-pov",
			pov: povId
		}, window.location.origin);
	}

	function sendViewerToCustomCamera(camera) {
		var iframe = document.getElementById("aton-editor-frame");
		if (!iframe || !iframe.contentWindow || !camera) {
			return;
		}

		iframe.contentWindow.postMessage({
			type: "aton-editor-goto-custom-camera",
			camera: camera
		}, window.location.origin);
	}

	function showViewpointField() {
		$("#number-group").hide();
	}

	function hideViewpointField() {
		$("#number-group").hide();
	}

	function setStatus(message) {
		$("#aton-editor-status").text(message || "");
	}

	return {
		init: init,
		setFormType: setFormType,
		reset: reset,
		loadFromEvent: loadFromEvent,
		loadCurrentModel: loadCurrentModel,
		normalizeSceneId: normalizeSceneId,
		getSelectionData: function() {
			return {
				annotationNumber3DModel: state.currentPovId || $("#number-text").val().trim(),
				annotationNumber3DModelCustom: state.currentCustomCamera
			};
		}
	};
})();
