import {
    FilesetResolver,
    HandLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm";

const webcam = document.getElementById("webcam");
const kanvas = document.getElementById("kanvas");

const ctx = kanvas.getContext("2d");

let handLandmarker;
let lastVideoTime = -1;


// ==============================
// INISIALISASI HAND LANDMARKER
// ==============================

async function initializeHandLandmarker() {

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

                delegate: "CPU"
            },

            runningMode: "VIDEO",

            numHands: 2,

            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
        }
    );

    console.log("Hand Landmarker siap");

    startCamera();
}


// ==============================
// AKSES KAMERA
// ==============================

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        webcam.srcObject = stream;

        webcam.addEventListener("loadeddata", () => {
            resizeCanvas();
            detectHands();
        });

    } catch (error) {

        console.error(
            "Tidak dapat mengakses kamera:",
            error
        );

    }
}


// ==============================
// UKURAN CANVAS
// ==============================

function resizeCanvas() {

    kanvas.width = webcam.videoWidth;
    kanvas.height = webcam.videoHeight;

}


// ==============================
// DETEKSI TANGAN
// ==============================

async function detectHands() {

    if (!handLandmarker) {
        requestAnimationFrame(detectHands);
        return;
    }

    if (webcam.readyState < 2) {
        requestAnimationFrame(detectHands);
        return;
    }

    if (webcam.currentTime !== lastVideoTime) {

        lastVideoTime = webcam.currentTime;

        const timestamp = performance.now();

        const result =
            handLandmarker.detectForVideo(
                webcam,
                timestamp
            );

        drawHands(result);
    }

    requestAnimationFrame(detectHands);
}


// ==============================
// GAMBAR LANDMARK
// ==============================

function drawHands(result) {

    ctx.clearRect(
        0,
        0,
        kanvas.width,
        kanvas.height
    );

    if (!result.landmarks) {
        return;
    }

    for (const landmarks of result.landmarks) {

        for (const point of landmarks) {

            const x =
                point.x * kanvas.width;

            const y =
                point.y * kanvas.height;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


// ==============================
// MULAI
// ==============================

initializeHandLandmarker();