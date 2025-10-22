// KhelYuva Pose Detection and Rep Counting System

class KhelYuvaPoseDetection {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.pose = null;
        this.camera = null;
        
        // Exercise tracking
        this.currentExercise = null;
        this.repCount = 0;
        this.isCounting = false;
        this.exerciseState = 'ready';
        
        // Pose landmarks
        this.landmarks = null;
        this.previousLandmarks = null;
        
        // Exercise-specific tracking
        this.pushupState = 'up';
        this.squatState = 'standing';
        this.bicepCurlState = 'down';
        this.jumpingJackState = 'standing';
        this.lastRepTime = 0;
        this.repCooldown = 1000; // 1 second cooldown between reps
        
        // Scoring
        this.formScore = 0;
        this.stabilityScore = 0;
        this.overallScore = 0;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('outputCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Control elements
        this.startCameraBtn = document.getElementById('startCamera');
        this.stopCameraBtn = document.getElementById('stopCamera');
        this.resetCountBtn = document.getElementById('resetCount');
        
        // Display elements
        this.repCountEl = document.getElementById('repCount');
        this.formScoreEl = document.getElementById('formScore');
        this.stabilityScoreEl = document.getElementById('stabilityScore');
        this.overallScoreEl = document.getElementById('overallScore');
        this.formFeedbackEl = document.getElementById('formFeedback');
        this.feedbackTextEl = document.getElementById('feedbackText');
        this.exerciseInstructionsEl = document.getElementById('exerciseInstructions');
        
        // Progress bars
        this.repProgressEl = document.getElementById('repProgress');
        this.formProgressEl = document.getElementById('formProgress');
        this.stabilityProgressEl = document.getElementById('stabilityProgress');
        this.overallProgressEl = document.getElementById('overallProgress');
        
        // Save workout elements
        this.saveWorkoutBtn = document.getElementById('saveWorkout');
        this.viewDashboardBtn = document.getElementById('viewDashboard');
        this.summaryRepsEl = document.getElementById('summaryReps');
        this.summaryFormScoreEl = document.getElementById('summaryFormScore');
        this.summaryOverallScoreEl = document.getElementById('summaryOverallScore');
    }
    
    setupEventListeners() {
        // Camera controls
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        this.resetCountBtn.addEventListener('click', () => this.resetCounters());
        
        // Exercise selection
        document.querySelectorAll('.exercise-option').forEach(btn => {
            btn.addEventListener('click', () => this.selectExercise(btn.dataset.exercise));
        });
        
        // Save workout
        if (this.saveWorkoutBtn) {
            this.saveWorkoutBtn.addEventListener('click', () => this.saveWorkout());
        }
        
        // View dashboard
        if (this.viewDashboardBtn) {
            this.viewDashboardBtn.addEventListener('click', () => this.viewDashboard());
        }
    }
    
    selectExercise(exercise) {
        // Update active exercise button
        document.querySelectorAll('.exercise-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        event.target.closest('.exercise-option').classList.add('ring-2', 'ring-blue-500');
        
        this.currentExercise = exercise;
        this.resetCounters();
        this.updateInstructions();
        this.updateFeedback('Select an exercise and start the camera', 'info');
        
        // Start new session
        if (window.khelYuvaDataStorage) {
            window.khelYuvaDataStorage.startSession(exercise);
        }
    }
    
    updateInstructions() {
        const instructions = {
            'pushups': [
                '• Start in plank position with hands shoulder-width apart',
                '• Lower your body until chest nearly touches the ground',
                '• Push back up to starting position',
                '• Keep your body straight throughout the movement'
            ],
            'squats': [
                '• Stand with feet shoulder-width apart',
                '• Lower your body by bending at the knees and hips',
                '• Go down until thighs are parallel to the ground',
                '• Return to standing position'
            ],
            'bicep-curls': [
                '• Stand with arms at your sides',
                '• Bend your elbows to bring hands toward shoulders',
                '• Lower arms back to starting position',
                '• Keep your back straight and core engaged'
            ],
            'jumping-jacks': [
                '• Start with feet together and arms at sides',
                '• Jump up spreading feet shoulder-width apart',
                '• Simultaneously raise arms overhead',
                '• Jump back to starting position'
            ]
        };
        
        if (this.currentExercise && instructions[this.currentExercise]) {
            this.exerciseInstructionsEl.innerHTML = instructions[this.currentExercise]
                .map(instruction => `<li>${instruction}</li>`).join('');
        }
    }
    
    async startCamera() {
        try {
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.pose.send({ image: this.video });
                },
                width: 640,
                height: 480
            });
            
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });
            
            this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.pose.onResults((results) => this.processPoseResults(results));
            
            await this.camera.start();
            
            this.startCameraBtn.disabled = true;
            this.stopCameraBtn.disabled = false;
            this.isCounting = true;
            
            this.updateFeedback('Camera started - Begin exercising!', 'success');
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.updateFeedback('Error starting camera. Please check permissions.', 'error');
        }
    }
    
    stopCamera() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        
        this.startCameraBtn.disabled = false;
        this.stopCameraBtn.disabled = true;
        this.isCounting = false;
        
        // End session and save data
        if (window.khelYuvaDataStorage) {
            const session = window.khelYuvaDataStorage.endSession();
            if (session) {
                this.updateFeedback(`Session completed! ${session.reps} reps with ${session.averageOverallScore}/100 average score`, 'success');
            }
        }
        
        this.updateFeedback('Camera stopped', 'info');
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    processPoseResults(results) {
        this.landmarks = results.poseLandmarks;
        
        if (this.landmarks) {
            this.drawPose(results);
            this.detectExercise();
        }
        
        this.previousLandmarks = this.landmarks;
    }
    
    drawPose(results) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        
        if (results.poseLandmarks) {
            this.drawConnectors(this.ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
            this.drawLandmarks(this.ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
        }
        
        this.ctx.restore();
    }
    
    drawConnectors(ctx, landmarks, connections, style) {
        const { color, lineWidth } = style;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        
        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            if (startPoint && endPoint) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
                ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
                ctx.stroke();
            }
        });
    }
    
    drawLandmarks(ctx, landmarks, style) {
        const { color, lineWidth, radius } = style;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;
        
        landmarks.forEach((landmark) => {
            if (landmark) {
                ctx.beginPath();
                ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }
    
    detectExercise() {
        if (!this.currentExercise || !this.landmarks || !this.isCounting) return;
        
        const currentTime = Date.now();
        
        switch (this.currentExercise) {
            case 'pushups':
                this.detectPushups(currentTime);
                break;
            case 'squats':
                this.detectSquats(currentTime);
                break;
            case 'bicep-curls':
                this.detectBicepCurls(currentTime);
                break;
            case 'jumping-jacks':
                this.detectJumpingJacks(currentTime);
                break;
        }
    }
    
    detectPushups(currentTime) {
        const leftShoulder = this.landmarks[11];
        const rightShoulder = this.landmarks[12];
        const leftElbow = this.landmarks[13];
        const rightElbow = this.landmarks[14];
        const leftWrist = this.landmarks[15];
        const rightWrist = this.landmarks[16];
        const leftHip = this.landmarks[23];
        const rightHip = this.landmarks[24];
        
        if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist || !leftHip || !rightHip) return;
        
        // Calculate elbow angles
        const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
        const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
        
        // Calculate body alignment
        const shoulderHipDistance = Math.abs(leftShoulder.y - leftHip.y);
        const bodyAlignment = shoulderHipDistance < 0.1 ? 100 : Math.max(0, 100 - (shoulderHipDistance * 1000));
        
        // Push-up detection logic
        if (this.pushupState === 'up' && avgElbowAngle < 90) {
            this.pushupState = 'down';
            this.updateFeedback('Going down...', 'info');
        } else if (this.pushupState === 'down' && avgElbowAngle > 150) {
            this.pushupState = 'up';
            this.completeRep(currentTime);
            this.updateFeedback('Great rep!', 'success');
        }
        
        // Update scores (ensure 0-100 range)
        this.formScore = Math.max(0, Math.min(100, Math.round(avgElbowAngle / 180 * 100)));
        this.stabilityScore = Math.max(0, Math.min(100, Math.round(bodyAlignment)));
        this.updateScores();
    }
    
    detectSquats(currentTime) {
        const leftHip = this.landmarks[23];
        const rightHip = this.landmarks[24];
        const leftKnee = this.landmarks[25];
        const rightKnee = this.landmarks[26];
        const leftAnkle = this.landmarks[27];
        const rightAnkle = this.landmarks[28];
        
        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return;
        
        // Calculate knee angles
        const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
        const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
        
        // Calculate stability
        const hipStability = Math.abs(leftHip.x - rightHip.x);
        const stability = Math.max(0, 100 - (hipStability * 1000));
        
        // Squat detection logic
        if (this.squatState === 'standing' && avgKneeAngle < 120) {
            this.squatState = 'down';
            this.updateFeedback('Going down...', 'info');
        } else if (this.squatState === 'down' && avgKneeAngle > 150) {
            this.squatState = 'standing';
            this.completeRep(currentTime);
            this.updateFeedback('Great squat!', 'success');
        }
        
        // Update scores (ensure 0-100 range)
        this.formScore = Math.max(0, Math.min(100, Math.round(avgKneeAngle / 180 * 100)));
        this.stabilityScore = Math.max(0, Math.min(100, Math.round(stability)));
        this.updateScores();
    }
    
    detectBicepCurls(currentTime) {
        const leftShoulder = this.landmarks[11];
        const rightShoulder = this.landmarks[12];
        const leftElbow = this.landmarks[13];
        const rightElbow = this.landmarks[14];
        const leftWrist = this.landmarks[15];
        const rightWrist = this.landmarks[16];
        
        if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) return;
        
        // Calculate elbow angles
        const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
        const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
        
        // Calculate symmetry
        const symmetry = Math.max(0, 100 - Math.abs(leftElbowAngle - rightElbowAngle));
        
        // Bicep curl detection logic
        if (this.bicepCurlState === 'down' && avgElbowAngle < 90) {
            this.bicepCurlState = 'up';
            this.updateFeedback('Curl up...', 'info');
        } else if (this.bicepCurlState === 'up' && avgElbowAngle > 150) {
            this.bicepCurlState = 'down';
            this.completeRep(currentTime);
            this.updateFeedback('Great curl!', 'success');
        }
        
        // Update scores (ensure 0-100 range)
        this.formScore = Math.max(0, Math.min(100, Math.round(avgElbowAngle / 180 * 100)));
        this.stabilityScore = Math.max(0, Math.min(100, Math.round(symmetry)));
        this.updateScores();
    }
    
    detectJumpingJacks(currentTime) {
        const leftWrist = this.landmarks[15];
        const rightWrist = this.landmarks[16];
        const leftAnkle = this.landmarks[27];
        const rightAnkle = this.landmarks[28];
        
        if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle) return;
        
        // Calculate arm and leg positions
        const armSpread = Math.abs(leftWrist.x - rightWrist.x);
        const legSpread = Math.abs(leftAnkle.x - rightAnkle.x);
        const armHeight = Math.min(leftWrist.y, rightWrist.y);
        
        // Jumping jack detection logic
        if (this.jumpingJackState === 'standing' && armSpread > 0.3 && armHeight < 0.3) {
            this.jumpingJackState = 'jumping';
            this.updateFeedback('Jumping...', 'info');
        } else if (this.jumpingJackState === 'jumping' && armSpread < 0.2 && armHeight > 0.4) {
            this.jumpingJackState = 'standing';
            this.completeRep(currentTime);
            this.updateFeedback('Great jumping jack!', 'success');
        }
        
        // Update scores (ensure 0-100 range)
        this.formScore = Math.max(0, Math.min(100, Math.round(armSpread * 200)));
        this.stabilityScore = Math.max(0, Math.min(100, Math.round(legSpread * 200)));
        this.updateScores();
    }
    
    calculateAngle(point1, point2, point3) {
        const vector1 = {
            x: point1.x - point2.x,
            y: point1.y - point2.y
        };
        const vector2 = {
            x: point3.x - point2.x,
            y: point3.y - point2.y
        };
        
        const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
        const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
        
        const cosAngle = dotProduct / (magnitude1 * magnitude2);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
        
        return (angle * 180) / Math.PI;
    }
    
    completeRep(currentTime) {
        if (currentTime - this.lastRepTime < this.repCooldown) return;
        
        this.repCount++;
        this.lastRepTime = currentTime;
        this.updateRepCount();
        
        // Save rep data to storage
        if (window.khelYuvaDataStorage) {
            window.khelYuvaDataStorage.addRepData(this.formScore, this.stabilityScore, this.overallScore);
        }
    }
    
    updateRepCount() {
        this.repCountEl.textContent = this.repCount;
        const progress = Math.min(100, (this.repCount / 20) * 100); // Assuming 20 reps as target
        this.repProgressEl.style.width = `${progress}%`;
    }
    
    updateScores() {
        // Ensure scores stay within 0-100 range
        this.formScore = Math.max(0, Math.min(100, this.formScore));
        this.stabilityScore = Math.max(0, Math.min(100, this.stabilityScore));
        
        // Update form score
        this.formScoreEl.textContent = `${this.formScore}/100`;
        this.formProgressEl.style.width = `${this.formScore}%`;
        
        // Update stability score
        this.stabilityScoreEl.textContent = `${this.stabilityScore}/100`;
        this.stabilityProgressEl.style.width = `${this.stabilityScore}%`;
        
        // Calculate overall score
        this.overallScore = Math.round((this.formScore + this.stabilityScore) / 2);
        this.overallScore = Math.max(0, Math.min(100, this.overallScore));
        this.overallScoreEl.textContent = `${this.overallScore}/100`;
        this.overallProgressEl.style.width = `${this.overallScore}%`;
        
        // Update summary
        this.updateSummary();
    }
    
    updateFeedback(message, type) {
        this.feedbackTextEl.textContent = message;
        this.formFeedbackEl.classList.remove('hidden');
        this.formFeedbackEl.className = `absolute top-4 left-4 right-4 p-3 rounded-lg text-sm ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'info' ? 'bg-blue-600' : 'bg-gray-600'
        } text-white`;
        
        // Hide feedback after 3 seconds
        setTimeout(() => {
            this.formFeedbackEl.classList.add('hidden');
        }, 3000);
    }
    
    resetCounters() {
        this.repCount = 0;
        this.formScore = 0;
        this.stabilityScore = 0;
        this.overallScore = 0;
        
        this.updateRepCount();
        this.updateScores();
        
        // Reset exercise states
        this.pushupState = 'up';
        this.squatState = 'standing';
        this.bicepCurlState = 'down';
        this.jumpingJackState = 'standing';
        
        // Disable save workout button
        if (this.saveWorkoutBtn) {
            this.saveWorkoutBtn.disabled = true;
        }
        
        this.updateFeedback('Counters reset - Ready to start!', 'info');
    }
    
    updateSummary() {
        if (this.summaryRepsEl) {
            this.summaryRepsEl.textContent = this.repCount;
        }
        if (this.summaryFormScoreEl) {
            this.summaryFormScoreEl.textContent = this.formScore;
        }
        if (this.summaryOverallScoreEl) {
            this.summaryOverallScoreEl.textContent = this.overallScore;
        }
        
        // Enable save workout button if there are reps
        if (this.saveWorkoutBtn && this.repCount > 0) {
            this.saveWorkoutBtn.disabled = false;
        }
    }
    
    saveWorkout() {
        if (!this.currentExercise || this.repCount === 0) {
            this.updateFeedback('No workout data to save!', 'error');
            return;
        }
        
        // End current session and save data
        if (window.khelYuvaDataStorage) {
            const session = window.khelYuvaDataStorage.endSession();
            if (session) {
                this.updateFeedback(`Workout saved! ${session.reps} reps with ${session.averageOverallScore}/100 average score`, 'success');
                
                // Disable save button after saving
                if (this.saveWorkoutBtn) {
                    this.saveWorkoutBtn.disabled = true;
                }
                
                // Show success message
                setTimeout(() => {
                    this.updateFeedback('Workout successfully saved to your dashboard!', 'success');
                }, 2000);
            }
        } else {
            this.updateFeedback('Error saving workout data', 'error');
        }
    }
    
    viewDashboard() {
        // Navigate to dashboard
        if (window.khelYuvaApp) {
            window.khelYuvaApp.showPage('dashboard');
        }
    }
}

// POSE_CONNECTIONS constant for drawing pose
const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14],
    [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24],
    [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
    [27, 31], [28, 32]
];

// Initialize pose detection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on athlete portal page
    if (document.getElementById('athlete-portal')) {
        window.khelYuvaPoseDetection = new KhelYuvaPoseDetection();
    }
});
