const audioElement = document.getElementById('audio');
const canvas = document.getElementById('vis');
const visOption = document.getElementById('options');

const cWidth = canvas.width;
const cHeight = canvas.height;

audioElement.addEventListener('play', () => {
	const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	const analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = 0.85;
	const track = audioCtx.createMediaElementSource(audioElement);
	track.connect(analyser);
	analyser.connect(audioCtx.destination);
	if (visOption.value == 'wave') analyser.fftSize = 4096;
	else if (visOption.value == 'bar') analyser.fftSize = 256;
	let bufferLength = analyser.frequencyBinCount;
	let dataArray = new Uint8Array(bufferLength);
	
	const canvasCtx = canvas.getContext('2d');
	canvasCtx.clearRect(0, 0, cWidth, cHeight);
	
	function draw() {
		let drawVisual = requestAnimationFrame(draw);
		canvasCtx.clearRect(0, 0, cWidth, cHeight);

		if (visOption.value == 'wave') {
			analyser.getByteTimeDomainData(dataArray);
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = '#eee';
			canvasCtx.beginPath();
			let sliceWidth = cWidth * 1.0 / bufferLength;
			let x = 0;
		
			for (let i = 0; i < bufferLength; i++) {
				let v = dataArray[i] / 128.0;
				let y = v * cHeight/2;
				if (i === 0) canvasCtx.moveTo(x, y);
				else canvasCtx.lineTo(x, y);
		
				x += sliceWidth;
			}
		
			canvasCtx.lineTo(canvas.width, canvas.height/2);
			canvasCtx.stroke();
		}

		else if (visOption.value == 'bar') {
			analyser.getByteFrequencyData(dataArray);
			let barWidth = (cWidth / bufferLength);
			let barHeight;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				barHeight = (dataArray[i] / 100) * (cHeight * 0.75);
				canvasCtx.fillStyle = `rgb(${barHeight / 2.5}, 100, ${barHeight+50})`;
				canvasCtx.fillRect(x, cHeight - barHeight / 2, barWidth, barHeight);

				x += barWidth + 1;
			}
		}
	}
	
	draw();
});

document.addEventListener('change', (e) => {
	let file = e.target.files[0];
	//audioElement.src = file.name;
	audioElement.src = window.URL.createObjectURL(file);
});