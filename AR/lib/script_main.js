function showAlert(id, message, level, time=1000) {

	let $alert = "<div class='alert alert-" + level + " fade show " + id + "' role='alert'>" +
		"<span>" + message + "</span>" +
		"</div>";

	$("#alert-placeholder").empty().append($alert);

	let thisAlert = $("." + id);

    thisAlert.css({
		"display": "block",
		"opacity": 1
	});

	thisAlert.delay(time).fadeOut("fast", function () {
		$(this).remove();
	});

}

function uploadModel(thisModel) {

    thisModel.addEventListener("change", async function(){

		let thisButtonModel = document.getElementById('upload-model');

		if ($(thisModel).prop('files')[0] !== undefined) {

			let fileType = $(thisModel).prop('files')[0].name;
			let validModelTypes = [".glb", ".zip"];

			// if file is not an image
			if (!validModelTypes.includes(fileType.slice(-4))) {

				$(thisButtonModel).empty();
				$(thisButtonModel).text("Upload model");
				$(thisModel).val("");

				showAlert('image-type-error', 'Please select a valid model (.glb).', 'warning', 1300);

			// if file is larger than 2 mb
			} else if ($(thisModel).prop('files')[0].size > 40000000) {

				$(thisButtonModel).empty();
				$(thisButtonModel).text("Upload model");
				$(thisModel).val("");

				showAlert('model-size-error', 'Please select a smaller model (Max 40 MB).', 'warning', 1300);

			} else {

				// file ok
				let modelName = $(thisModel).prop('files')[0].name;
				$(thisButtonModel).empty();
				$(thisButtonModel).text("Upload model: " + modelName);

				console.log('Uploading model...');

				const formData = new FormData();
				formData.append('file', $(thisModel).prop('files')[0], modelName);
				const response = await fetch('./PHP/upload3DModel.php', {
					method: 'POST',
					body: formData
				});
				const modelResult = await response.json();
				if (modelResult.status === 'error') {
					showAlert('model-error', modelResult.message, 'danger', 1600);
					console.error(modelResult.message);
				} else {
					console.log(modelResult.message);
					showAlert('model-success', modelResult.message, 'success', 1300);
				}

			}

		} else {
			$(thisButtonModel).empty();
			$(thisButtonModel).text("Upload model");
		}

	});
}

async function checkModels () {
	try {

		const response = await fetch('./PHP/scanGLB.php');
		const glbFiles = await response.json();

		if (glbFiles.length > 0) {
			let select = document.getElementById('models-available');
			for (let i=0; i<glbFiles.length; i++) {
				let option = document.createElement('option');
				option.text = glbFiles[i];
				option.value = option.text;
				select.appendChild(option);
			}
		}

	} catch (error) {

		console.error('Error scanning .glb files:', error);

	}
}

window.onload = async function () {
    // add 'Upload model' listener
	let modelInput = document.getElementById('model-input');
    modelInput.addEventListener('click', function (){uploadModel(modelInput)});

	// append options to select
	await checkModels();

	$(document).ready(function () {
		// check if a model is selected
		let select = document.getElementById('models-available');

		select.addEventListener('change', function () {
			let selectedValue = select.value; // get model's name

			// prepare iframe when a model is set
			let ifrm = document.createElement('iframe');

			ifrm.setAttribute('src', 'index.html?model=' + selectedValue);
			ifrm.setAttribute('allow', 'autoplay; xr-spatial-tracking;');
			ifrm.setAttribute('xr-spatial-tracking', '');
			ifrm.setAttribute('execution-while-out-of-viewport', '');
			ifrm.setAttribute('execution-while-not-rendered', '');
			ifrm.setAttribute('web-share', '');
			ifrm.setAttribute('allowfullscreen', '');
			ifrm.setAttribute('mozallowfullscreen', 'true');
			ifrm.setAttribute('webkitallowfullscreen', 'true');
			ifrm.textContent = 'Your browser doesn\'t support iframes.';
			ifrm.style.cssText = 'position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none;' +
				'margin:0; padding:0; overflow:hidden; z-index:999999;';

			document.body.appendChild(ifrm);
			document.getElementById('alert-placeholder').style.display = 'none';
        	document.getElementById('form-model').style.display = 'none';
        	document.getElementById('model-div').style.display = 'none';
		});

	});
}