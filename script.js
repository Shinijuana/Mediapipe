const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

// 📌 Imposta la fotocamera posteriore con fallback
async function startCamera() {
    let constraints = {
        video: {
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
            facingMode: { ideal: "user" } // Usa la fotocamera frontale, in caso di errore imposta la posteriore
        }
    };

    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            adjustCanvasSize();
            handleOrientationChange(); // Gestisci l'orientamento al caricamento
        };
    } catch (err) {
        console.error("Errore accesso webcam:", err);
    }
}

// 📌 Gestione della rotazione del video
function handleOrientationChange() {
    if (window.innerHeight > window.innerWidth) {
        videoElement.style.transform = 'scaleX(-1)'; // Ruota in modalità verticale
    } else {
        videoElement.style.transform = ''; // Disabilita la rotazione in modalità orizzontale
    }
}

// 📌 Adatta il canvas alle dimensioni del video
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
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', radius: 2 }); 
        }
    }
});

// 📌 Avvia la fotocamera
startCamera();

// 📌 Rileva cambiamenti di orientamento (verticale/orizzontale)
window.addEventListener('resize', handleOrientationChange);
