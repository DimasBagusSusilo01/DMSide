import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

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

    resizeCanvas();

    detectHands();
}

function resizeCanvas() {

    if (!video.videoWidth || !video.videoHeight) {
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
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

    // TES CANVAS
    ctx.fillStyle = "#ff0000";

    ctx.beginPath();

    ctx.arc(
        100,
        100,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();


    if (!results.landmarks?.length) {

        output.textContent =
            "Tidak ada tangan";

        return;
    }


    const landmarks =
        results.landmarks[0];


    for (const point of landmarks) {

        const x =
            point.x * canvas.width;

        const y =
            point.y * canvas.height;


        ctx.beginPath();

        ctx.fillStyle =
            "#00ff88";

        ctx.arc(
            x,
            y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    const index =
        landmarks[8];


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


// =====================================
// MOBILE NAVIGATION
// =====================================

const mobileButtons =
    document.querySelectorAll(
        ".mobile-nav-button"
    );

const toolbox =
    document.getElementById(
        "toolboxPanel"
    );

const inspector =
    document.querySelector(
        ".inspector-panel"
    );

const centerArea =
    document.querySelector(
        ".center-area"
    );


mobileButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            mobileButtons.forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );

            button.classList.add(
                "active"
            );

            const panel =
                button.dataset.panel;


            if (window.innerWidth > 700) {
                return;
            }


            // BLOCKS

            if (panel === "blocks") {

                toolbox.style.display =
                    "block";

                centerArea.style.display =
                    "none";

                inspector.style.display =
                    "none";

            }


            // PREVIEW

            if (panel === "preview") {

                toolbox.style.display =
                    "none";

                centerArea.style.display =
                    "flex";

                inspector.style.display =
                    "none";

            }


            // SETTINGS

            if (panel === "inspector") {

                toolbox.style.display =
                    "none";

                centerArea.style.display =
                    "none";

                inspector.style.display =
                    "block";

                inspector.style.height =
                    "100%";

            }

        }
    );

});