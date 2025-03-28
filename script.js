const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

// 📌 Imposta la fotocamera posteriore su mobile
async function startCamera() {
    const constraints = {
        video: {
            facingMode: "environment", // Forza la fotocamera posteriore
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            adjustCanvasSize();
        };
    } catch (err) {
        console.error("Errore accesso webcam:", err);
    }
}

// 📌 Adatta il canvas alla dimensione del video
function adjustCanvasSize() {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
}

// 📌 Configura MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 📌 Analizza i frame della webcam con MediaPipe
hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', radius: 2 }); // 🔹 Ridotti i punti
        }
    }
});

// 📌 Avvia la webcam e MediaPipe
startCamera();
