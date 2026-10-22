"use strict";

var narraSketchfabEditor = (function() {
	var state = {
		initialized: false,
		active: false,
		loadedModelId: "",
		currentAnnotation: "",
		currentCustomCamera: null,
		lastTypedModelId: ""
	};

	function init() {
		if (state.initialized) {
			return;
		}

		$(window).on("message", handleViewerMessage);
		$(document).on("click", "#load-sketchfab-model", function() {
			loadCurrentModel();
		});
		$(document).on("input", "#id-text", handleModelIdInputChange);
		state.initialized = true;
	}

	function setFormType(formType) {
		init();
		state.active = normalizeEventFormType(formType) === "sketchfab";

		$("#sketchfab-editor-group").toggle(state.active);

		if (state.active) {
			hideAnnotationField();
			if (!$("#number-text").val().trim()) {
				setStatus("Insert a model ID, then load the Sketchfab scene.");
			}
		} else {
			hideViewer();
			setStatus("");
			state.loadedModelId = "";
			state.currentAnnotation = "";
			state.currentCustomCamera = null;
			state.lastTypedModelId = "";
		}
	}

	function reset() {
		if (!state.initialized) {
			return;
		}

		state.loadedModelId = "";
		state.currentAnnotation = "";
		state.currentCustomCamera = null;
		state.lastTypedModelId = "";
		hideAnnotationField();
		hideViewer();
		setStatus("Insert a model ID, then load the Sketchfab scene.");
	}

	function loadFromEvent(event) {
		if (!event || normalizeEventFormType(event.formType) !== "sketchfab") {
			return;
		}

		setFormType("sketchfab");
		state.currentAnnotation = event.annotationNumber3DModel || "";
		state.currentCustomCamera = event.annotationNumber3DModelCustom || null;
		state.lastTypedModelId = event.sketchfabid || "";

		if (event.sketchfabid) {
			loadModel(event.sketchfabid, event.annotationNumber3DModel || "", event.annotationNumber3DModelCustom || null);
		} else {
			setStatus("Insert a model ID, then load the Sketchfab scene.");
		}
	}

	function loadCurrentModel() {
		loadModel($("#id-text").val().trim(), $("#number-text").val().trim(), state.currentCustomCamera);
	}

	function loadModel(modelId, selectedAnnotation, selectedCustomCamera) {
		if (!state.active) {
			return;
		}

		var normalizedModelId = normalizeModelId(modelId);
		if (!normalizedModelId) {
			$("#id-text").addClass("has-error-sketch");
			setStatus("Insert a valid Sketchfab model ID before loading the scene.");
			hideViewer();
			return;
		}

		state.loadedModelId = normalizedModelId;
		state.currentAnnotation = selectedAnnotation || "";
		state.currentCustomCamera = selectedCustomCamera || null;
		state.lastTypedModelId = modelId;
		$("#id-text").removeClass("has-error-sketch");
		hideAnnotationField();
		setStatus("Loading Sketchfab model...");

		var viewerUrl = "HTML/sketchfab-event-viewer.html?model=" + encodeURIComponent(normalizedModelId);
		if (selectedAnnotation) {
			viewerUrl += "&annotation=" + encodeURIComponent(selectedAnnotation);
		} else if (selectedCustomCamera) {
			viewerUrl += "&camera=" + encodeURIComponent(JSON.stringify(selectedCustomCamera));
		}

		$("#sketchfab-editor-frame").attr("src", viewerUrl);
		$("#sketchfab-editor-frame-wrap").show();
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

		state.loadedModelId = "";
		state.currentAnnotation = "";
		state.currentCustomCamera = null;
		state.lastTypedModelId = currentValue;
		$("#number-text").val("");
		hideAnnotationField();
		hideViewer();

		if (currentValue) {
			setStatus("Model ID changed. Load the Sketchfab scene to choose an annotation.");
		} else {
			setStatus("Insert a model ID, then load the Sketchfab scene.");
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

		if (data.type === "sketchfab-editor-scene-ready") {
			showAnnotationField();
			setStatus("Scene loaded. Choose an annotation or move the camera freely.");
			var selectedAnnotation = $("#number-text").val().trim();
			if (selectedAnnotation) {
				sendViewerToAnnotation(selectedAnnotation);
			} else if (state.currentCustomCamera) {
				sendViewerToCustomCamera(state.currentCustomCamera);
			} else if (data.currentAnnotation) {
				applySelectedAnnotation(data.currentAnnotation, true, data.annotationTitle);
			}
		} else if (data.type === "sketchfab-editor-annotation-changed") {
			if (data.annotation) {
				applySelectedAnnotation(data.annotation, true, data.annotationTitle);
			}
		} else if (data.type === "sketchfab-editor-custom-camera-changed") {
			applyCustomCamera(data.camera);
		} else if (data.type === "sketchfab-editor-scene-error") {
			setStatus(data.message || "Unable to load the Sketchfab model.");
			hideViewer();
		}
	}

	function applySelectedAnnotation(annotation, fromViewer, annotationTitle) {
		state.currentAnnotation = annotation;
		state.currentCustomCamera = null;
		$("#number-text").removeClass("has-error-sketch");
		$("#number-text").val(annotation);
		showAnnotationField();
		var status = (fromViewer ? "Selected annotation" : "Current annotation") + ": " + annotation;
		if (annotationTitle) {
			status += " (" + annotationTitle + ")";
		}
		setStatus(status);
	}

	function applyCustomCamera(camera) {
		if (!camera) {
			return;
		}

		state.currentAnnotation = "";
		state.currentCustomCamera = camera;
		$("#number-text").removeClass("has-error-sketch");
		$("#number-text").val("");
		showAnnotationField();
		setStatus("Selected free camera position.");
	}

	function normalizeModelId(modelId) {
		var value = (modelId || "").trim();
		if (!value) {
			return "";
		}

		if (/^[A-Za-z0-9]+$/.test(value)) {
			return value;
		}

		return "";
	}

	function hideViewer() {
		$("#sketchfab-editor-frame-wrap").hide();
		$("#sketchfab-editor-frame").attr("src", "about:blank");
	}

	function sendViewerToAnnotation(annotation) {
		var iframe = document.getElementById("sketchfab-editor-frame");
		if (!iframe || !iframe.contentWindow || !annotation) {
			return;
		}

		iframe.contentWindow.postMessage({
			type: "sketchfab-editor-goto-annotation",
			annotation: annotation
		}, window.location.origin);
	}

	function sendViewerToCustomCamera(camera) {
		var iframe = document.getElementById("sketchfab-editor-frame");
		if (!iframe || !iframe.contentWindow || !camera) {
			return;
		}

		iframe.contentWindow.postMessage({
			type: "sketchfab-editor-goto-custom-camera",
			camera: camera
		}, window.location.origin);
	}

	function showAnnotationField() {
		$("#number-group").hide();
	}

	function hideAnnotationField() {
		$("#number-group").hide();
	}

	function setStatus(message) {
		$("#sketchfab-editor-status").text(message || "");
	}

	return {
		init: init,
		setFormType: setFormType,
		reset: reset,
		loadFromEvent: loadFromEvent,
		loadCurrentModel: loadCurrentModel,
		getSelectionData: function() {
			return {
				annotationNumber3DModel: state.currentAnnotation || $("#number-text").val().trim(),
				annotationNumber3DModelCustom: state.currentCustomCamera
			};
		}
	};
})();
