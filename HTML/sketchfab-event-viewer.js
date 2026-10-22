(function() {
	"use strict";

	var statusEl = document.getElementById("sketchfabEditorStatus");
	var iframe = document.getElementById("sketchfabEditorFrame");
	var prevButton = document.getElementById("sketchfabEditorPrevAnnotation");
	var nextButton = document.getElementById("sketchfabEditorNextAnnotation");
	var params = new URLSearchParams(window.location.search);
	var modelId = params.get("model");
	var initialAnnotation = params.get("annotation");
	var initialCustomCamera = parseCameraParam(params.get("camera"));
	var parentOrigin = getParentOrigin();
	var client = null;
	var api = null;
	var annotations = [];
	var currentAnnotationIndex = null;
	var suppressNextCameraCapture = false;

	setStatus("Loading Sketchfab model...");

	if (!modelId || !/^[A-Za-z0-9]+$/.test(modelId)) {
		setStatus("Invalid Sketchfab model ID.");
		notifyParent("sketchfab-editor-scene-error", { message: "Invalid Sketchfab model ID." });
		return;
	}

	iframe.src = "https://sketchfab.com/models/" + modelId + "/embed?camera=0&annotation_tooltip_visible=1&annotations_visible=1";
	client = new Sketchfab(iframe);
	client.init(modelId, {
		success: function onSuccess(viewerApi) {
			api = viewerApi;
			api.start();
			api.addEventListener("viewerready", handleViewerReady);
			api.addEventListener("annotationSelect", handleAnnotationSelect);
			api.addEventListener("camerastart", handleCameraStart);
			api.addEventListener("camerastop", handleCameraStop);
		},
		error: function onError() {
			setStatus("Unable to load the Sketchfab model.");
			notifyParent("sketchfab-editor-scene-error", { message: "Unable to load the Sketchfab model." });
		}
	});

	window.addEventListener("message", function(event) {
		if (parentOrigin !== "*" && event.origin !== parentOrigin) {
			return;
		}

		var data = event.data || {};
		if (data.type === "sketchfab-editor-goto-annotation") {
			gotoAnnotationBySavedValue(data.annotation);
			return;
		}

		if (data.type === "sketchfab-editor-goto-custom-camera") {
			gotoCustomCamera(data.camera);
		}
	});

	prevButton.addEventListener("click", function() {
		navigateRelative(-1);
	});
	nextButton.addEventListener("click", function() {
		navigateRelative(1);
	});

	function handleViewerReady() {
		api.getAnnotationList(function(err, annotationList) {
			if (err) {
				setStatus("Unable to read Sketchfab annotations.");
				notifyParent("sketchfab-editor-scene-error", { message: "Unable to read Sketchfab annotations." });
				return;
			}

			annotations = annotationList || [];
			setStatus("Model loaded.", "ready");
			notifyParent("sketchfab-editor-scene-ready", {
				annotationCount: annotations.length,
				currentAnnotation: initialAnnotation || ""
			});

			if (initialAnnotation) {
				gotoAnnotationBySavedValue(initialAnnotation);
			} else if (initialCustomCamera) {
				gotoCustomCamera(initialCustomCamera);
			}
		});
	}

	function handleAnnotationSelect(index) {
		if (typeof index !== "number" || index < 0) {
			return;
		}

		suppressNextCameraCapture = true;
		currentAnnotationIndex = index;
		var annotationValue = String(index + 1);
		var annotationTitle = annotations[index] && annotations[index].name ? annotations[index].name : "";
		notifyParent("sketchfab-editor-annotation-changed", {
			annotation: annotationValue,
			annotationTitle: annotationTitle
		});
	}

	function gotoAnnotationBySavedValue(savedValue) {
		if (!api || !savedValue) {
			return;
		}

		var annotationIndex = parseInt(savedValue, 10) - 1;
		if (isNaN(annotationIndex) || annotationIndex < 0 || annotationIndex >= annotations.length) {
			return;
		}

		suppressNextCameraCapture = true;
		api.gotoAnnotation(annotationIndex, {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
			if (!err) {
				currentAnnotationIndex = index;
			}
		});
	}

	function navigateRelative(step) {
		if (!api || annotations.length === 0) {
			return;
		}

		var currentIndex = typeof currentAnnotationIndex === "number" ? currentAnnotationIndex : 0;
		var nextIndex = currentIndex + step;
		if (nextIndex < 0) {
			nextIndex = annotations.length - 1;
		}
		if (nextIndex >= annotations.length) {
			nextIndex = 0;
		}

		suppressNextCameraCapture = true;
		api.gotoAnnotation(nextIndex, {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
			if (!err) {
				currentAnnotationIndex = index;
				var annotationTitle = annotations[index] && annotations[index].name ? annotations[index].name : "";
				notifyParent("sketchfab-editor-annotation-changed", {
					annotation: String(index + 1),
					annotationTitle: annotationTitle
				});
			}
		});
	}

	function gotoCustomCamera(camera) {
		if (!api || !camera) {
			return;
		}

		suppressNextCameraCapture = true;
		api.setCameraLookAt(camera.position, camera.target, 1.0, function(err) {
			if (!err) {
				currentAnnotationIndex = null;
				if (typeof camera.fov === "number") {
					api.setFov(camera.fov, function() {});
				}
			}
		});
	}

	function handleCameraStart() {
		// no-op
	}

	function handleCameraStop() {
		if (suppressNextCameraCapture) {
			suppressNextCameraCapture = false;
			return;
		}

		captureCurrentCamera();
	}

	function captureCurrentCamera() {
		if (!api) {
			return;
		}

		api.getCameraLookAt(function(err, camera) {
			if (err || !camera) {
				return;
			}

			api.getFov(function(fovErr, fov) {
				if (fovErr) {
					return;
				}

				currentAnnotationIndex = null;
				notifyParent("sketchfab-editor-custom-camera-changed", {
					camera: {
						position: camera.position,
						target: camera.target,
						fov: fov
					}
				});
			});
		});
	}

	function parseCameraParam(cameraParam) {
		if (!cameraParam) {
			return null;
		}

		try {
			return JSON.parse(cameraParam);
		} catch (error) {
			return null;
		}
	}

	function setStatus(message, state) {
		if (!statusEl) return;
		statusEl.textContent = message;
		statusEl.dataset.state = state || "";
	}

	function notifyParent(type, payload) {
		if (!window.parent || window.parent === window) return;
		window.parent.postMessage(Object.assign({ type: type }, payload || {}), parentOrigin);
	}

	function getParentOrigin() {
		if (!document.referrer) {
			return "*";
		}

		try {
			return new URL(document.referrer).origin;
		} catch (error) {
			return "*";
		}
	}
})();
