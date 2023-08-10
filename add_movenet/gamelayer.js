import PoseDetector from "./movenetLayer.js"

async function runPoseDetection(poseDetector) {
    await poseDetector.setupCamera();
    await poseDetector.loadModel();
    poseDetector.detectPoseInRealTime();
}
// Initialize the PoseDetector class
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('CameraOutcanvas');
const poseDetector = new PoseDetector(videoElement, canvasElement);
await runPoseDetection(poseDetector);
// await poseDetector.setupCamera();
// await poseDetector.loadModel();
// poseDetector.detectPoseInRealTime();

// for (let i = 0; i < 100; i += 1) {
// const currentPoses = poseDetector.getPoses();
// console.log(currentPoses);
// }
setTimeout(async () => {
    for (let i = 0; i < 100; i += 1) {
        const currentPoses = poseDetector.getPoses();
        console.log(currentPoses);
        await new Promise((resolve) => requestAnimationFrame(resolve)); // Wait for the next animation frame
    }
}, 10000); 