
class PoseDetector {
    constructor(videoElement, canvasElement) {
        this.videoWidth = 200;
        this.videoHeight = 200;
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width=this.videoWidth;
        this.canvas.height=this.videoHeight;
        this.model = null;
        this.fpsInterval = 1000 / 100;
        this.then = Date.now();
        this.startTime = this.then;
        this.frameCount = 0;
        this.poses = [];  
        this.requiredvisibilityScore = .1;

        
    }

    async setupCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: this.videoWidth,
                height: this.videoHeight,
            },
        });
        this.video.srcObject = stream;
        await this.video.play();

    }

    async loadModel() {
        await tf.ready();
        tf.setBackend("webgl");
        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
            // enableGpu: true,
        };
        this.model = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        );
        console.log('Model loaded...');
    }

    async detectPoseInRealTime() {
        // calculate elapsed time
        const now = Date.now();
        const elapsed = now - this.then;

        // if enough time has passed, detect pose and draw result
        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval);
            this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
            this.ctx.save();
            this.ctx.drawImage(this.video, 0, 0, this.videoWidth, this.videoHeight);
            this.ctx.restore();
            if (this.frameCount % 2 === 0) {
                this.poses = await this.model.estimatePoses(this.video, { flipHorizontal: false });
            }

            // Draw keypoints on canvas
            var calX = 1;
            var calY = 1;
            for (let i = 0; i < this.poses.length; i += 1) {
                const pose = this.poses[i];
                for (let j = 0; j < pose.keypoints.length; j += 1) {
                    const keypoint = pose.keypoints[j];
                    if (keypoint.score > this.requiredvisibilityScore) {
                        this.ctx.beginPath();
                        this.ctx.fillStyle = "cyan";
                        this.ctx.arc(keypoint.x * calX, keypoint.y * calY, 3, 0, 2 * Math.PI);
                        this.ctx.fill();
                        // console.log(keypoint.x)
                    }
                }
            }

            // Calculate and display FPS
            let sinceStart = now - this.startTime;
            let currentFps = Math.round((1000 * this.frameCount) / sinceStart * 100) / 100;
            this.ctx.fillStyle = 'cyan';
            this.ctx.font = '10px Arial';
            this.ctx.fillText('FPS: ' + currentFps, 10, 10);

            // Increment frame count
            this.frameCount++;
        }

        // Request the next animation frame
        requestAnimationFrame(this.detectPoseInRealTime.bind(this));
    }
    getPoses() {
        return this.poses;
    }
}

export default PoseDetector;