const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

// 📌 Imposta la fotocamera posteriore su mobile
const constraints = {
    video: {
        facingMode: "environment", // Fotocamera posteriore
        width: { ideal: 640 },
        height: { ideal: 480 }
    }
};

// 📌 Attiva la videocamera
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            adjustCanvasSize();
        };
    })
    .catch((err) => console.error("Errore accesso webcam:", err));

// 📌 Adatta il canvas alle dimensioni del video
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

// 📌 Usa la webcam come input per MediaPipe
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();

// 📌 Disegna le mani rilevate
hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', radius: 4 });
        }
    }
});
