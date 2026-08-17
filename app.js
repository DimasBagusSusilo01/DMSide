const webcam = document.getElementById("webcam");
const kanvas = document.getElementById("kanvas");

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video : true,
        audio : false
    });
    webcam.srcObject = stream;
}
startCamera()