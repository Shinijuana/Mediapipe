const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

// 📌 Imposta la fotocamera, preferibilmente posteriore, fallback alla selfie
async function startCamera() {
    let constraints = {
        video: {
            width: { exact: window.innerWidth },
            height: { exact: window.innerHeight },
            facingMode: { exact: "environment" } // Preferisce la posteriore
        }
    };

    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            adjustCanvasSize();
        };
        handleZoom(stream);
    } catch (err) {
        console.error("Errore accesso webcam, uso la fotocamera frontale:", err);

        // Fallback alla fotocamera frontale se quella posteriore non funziona
        constraints.video.facingMode = "user"; // Fotocamera frontale
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            adjustCanvasSize();
        };
        handleZoom(stream); // Gestisce lo zoom anche con la fotocamera frontale
    }
}

// 📌 Impedisce lo zoom automatico
function handleZoom(stream) {
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.zoom) {
        // Forza zoom 1x per evitare ingrandimento
        track.applyConstraints({ advanced: [{ zoom: 1.0 }] })
            .then(() => {
                console.log('Zoom impostato a 1x');
            })
            .catch(err => {
                console.error('Impossibile impostare lo zoom:', err);
            });
    }
}

// 📌 Adatta il canvas alle dimensioni dello schermo
function adjustCanvasSize() {
    canvasElement.width = videoElement.videoWidth || window.innerWidth;
    canvasElement.height = videoElement.videoHeight || window.innerHeight;
}

// 📌 Configura MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 📌 Usa il video come input per MediaPipe
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: window.innerWidth,
    height: window.innerHeight
});
camera.start();

// 📌 Disegna le mani in modo allineato
hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', radius: .5 }); // Punti più piccoli
        }
    }
});

// 📌 Avvia la fotocamera
startCamera();
