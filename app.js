const {
    HandLandmarker,
    FilesetResolver
} = globalThis;

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const button = document.getElementById("startCamera");
const output = document.getElementById("output");

let handLandmarker;
let lastVideoTime = -1;

async function createHandTracker() {

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

                delegate: "GPU"
            },

            runningMode: "VIDEO",

            numHands: 1,

            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
        }
    );

    console.log("MediaPipe siap!");
}

async function startCamera() {

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 1280,
            height: 720
        },
        audio: false
    });

    video.srcObject = stream;

    await video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    detectHands();
}

function detectHands() {

    if (video.currentTime !== lastVideoTime) {

        lastVideoTime = video.currentTime;

        const results =
            handLandmarker.detectForVideo(
                video,
                performance.now()
            );

        drawHands(results);
    }

    requestAnimationFrame(detectHands);
}

function drawHands(results) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (!results.landmarks?.length) {
        output.textContent = "Tidak ada tangan";
        return;
    }

    const landmarks = results.landmarks[0];

    for (const point of landmarks) {

        const x = point.x * canvas.width;
        const y = point.y * canvas.height;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    const index = landmarks[8];

    output.textContent =
`Index Finger

X: ${index.x.toFixed(3)}
Y: ${index.y.toFixed(3)}
Z: ${index.z.toFixed(3)}`;
}

button.addEventListener("click", async () => {

    await createHandTracker();

    await startCamera();

});