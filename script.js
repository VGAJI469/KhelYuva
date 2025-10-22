class ExerciseCounter {
    constructor() {
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('outputCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pose = null;
        this.camera = null;
        
        // Exercise tracking
        this.currentExercise = null;
        this.repCount = 0;
        this.setCount = 0;
        this.isCounting = false;
        this.exerciseState = 'ready'; // ready, up, down, complete
        
        // Pose landmarks
        this.landmarks = null;
        this.previousLandmarks = null;
        
        // Exercise-specific tracking
        this.squatState = 'standing';
        this.bicepCurlState = 'down';
        this.lastRepTime = 0;
        this.repCooldown = 1000; // 1 second cooldown between reps
        
        // Workout session tracking
        this.workoutStartTime = null;
        this.sessionData = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupAuthEventListeners();
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.exerciseBtns = document.querySelectorAll('.exercise-btn');
        this.currentExerciseName = document.getElementById('currentExerciseName');
        this.repCountDisplay = document.getElementById('repCount');
        this.setCountDisplay = document.getElementById('setCount');
        this.exerciseStatus = document.getElementById('exerciseStatus');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.resetBtn.addEventListener('click', () => this.resetCounters());
        
        this.exerciseBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectExercise(btn.dataset.exercise));
        });
    }
    
    setupAuthEventListeners() {
        console.log('Setting up auth event listeners');
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.handleLogin();
            });
        } else {
            console.error('Login form not found');
        }
        
        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Signup form submitted');
                this.handleSignup();
            });
        } else {
            console.error('Signup form not found');
        }
        
        // Form switching
        const showSignup = document.getElementById('showSignup');
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignupForm();
            });
        }
        
        const showLogin = document.getElementById('showLogin');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Attempting login for:', email);
        this.showAuthMessage('Signing in...', 'info');
        
        const { data, error } = await window.authManager.signIn(email, password);
        
        if (error) {
            console.error('Login error:', error);
            this.showAuthMessage(error.message, 'error');
        } else {
            console.log('Login successful:', data);
            this.showAuthMessage('Successfully signed in!', 'success');
            // Auth state change will handle showing the main app
        }
    }
    
    async handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showAuthMessage('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        this.showAuthMessage('Creating account...', 'info');
        
        const { data, error } = await window.authManager.signUp(email, password, {
            full_name: name
        });
        
        if (error) {
            this.showAuthMessage(error.message, 'error');
        } else {
            this.showAuthMessage('Account created! Please check your email to verify your account.', 'success');
        }
    }
    
    async handleLogout() {
        await window.authManager.signOut();
    }
    
    showLoginForm() {
        const login = document.getElementById('login-form');
        const signup = document.getElementById('signup-form');
        if (login) login.classList.remove('is-hidden');
        if (signup) signup.classList.add('is-hidden');
        this.clearAuthMessage();
    }
    
    showSignupForm() {
        const login = document.getElementById('login-form');
        const signup = document.getElementById('signup-form');
        if (login) login.classList.add('is-hidden');
        if (signup) signup.classList.remove('is-hidden');
        this.clearAuthMessage();
    }
    
    showAuthMessage(message, type) {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
    }
    
    clearAuthMessage() {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = '';
        messageEl.className = 'auth-message';
    }
    
    updateUserInfo() {
        const user = window.authManager.getCurrentUser();
        if (user) {
            document.getElementById('userEmail').textContent = user.email;
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
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.updateStatus('Camera started - Select an exercise to begin');
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.updateStatus('Error starting camera. Please check permissions.');
        }
    }
    
    stopCamera() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus('Camera stopped');
        
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
    
    selectExercise(exercise) {
        this.currentExercise = exercise;
        this.exerciseBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-exercise="${exercise}"]`).classList.add('active');
        
        this.currentExerciseName.textContent = exercise === 'squats' ? 'Squats' : 'Bicep Curls';
        this.updateStatus('Exercise selected - Start performing the movement');
        
        // Reset exercise-specific states
        this.squatState = 'standing';
        this.bicepCurlState = 'down';
    }
    
    detectExercise() {
        if (!this.currentExercise || !this.landmarks) return;
        
        const currentTime = Date.now();
        
        switch (this.currentExercise) {
            case 'squats':
                this.detectSquats(currentTime);
                break;
            case 'bicep-curls':
                this.detectBicepCurls(currentTime);
                break;
        }
    }
    
    detectSquats(currentTime) {
        // Key points for squat detection
        const leftHip = this.landmarks[23];
        const rightHip = this.landmarks[24];
        const leftKnee = this.landmarks[25];
        const rightKnee = this.landmarks[26];
        const leftAnkle = this.landmarks[27];
        const rightAnkle = this.landmarks[28];
        
        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return;
        
        // Calculate average hip and knee positions
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
        const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
        
        // Calculate knee angles
        const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
        const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
        
        // Squat detection logic
        if (this.squatState === 'standing' && avgKneeAngle < 120) {
            this.squatState = 'down';
            this.updateStatus('Going down...');
        } else if (this.squatState === 'down' && avgKneeAngle > 150) {
            this.squatState = 'standing';
            this.completeRep(currentTime);
            this.updateStatus('Rep completed!');
        }
    }
    
    detectBicepCurls(currentTime) {
        // Key points for bicep curl detection
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
        
        // Bicep curl detection logic
        if (this.bicepCurlState === 'down' && avgElbowAngle < 90) {
            this.bicepCurlState = 'up';
            this.updateStatus('Curl up...');
        } else if (this.bicepCurlState === 'up' && avgElbowAngle > 150) {
            this.bicepCurlState = 'down';
            this.completeRep(currentTime);
            this.updateStatus('Rep completed!');
        }
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
        this.updateCounters();
        
        // Auto-increment sets every 10 reps
        if (this.repCount % 10 === 0) {
            this.setCount++;
        }
        
        // Save workout data to session
        this.sessionData.push({
            exercise: this.currentExercise,
            reps: this.repCount,
            sets: this.setCount,
            timestamp: new Date()
        });
        
        // Save to Supabase if user is authenticated
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.saveWorkoutToDatabase();
        }
    }
    
    async saveWorkoutToDatabase() {
        if (!this.currentExercise || this.repCount === 0) return;
        
        try {
            const { error } = await window.authManager.saveWorkoutData(
                this.currentExercise,
                this.repCount,
                this.setCount
            );
            
            if (error) {
                console.error('Failed to save workout data:', error);
            } else {
                console.log('Workout data saved successfully');
            }
        } catch (error) {
            console.error('Error saving workout data:', error);
        }
    }
    
    updateCounters() {
        this.repCountDisplay.textContent = this.repCount;
        this.setCountDisplay.textContent = this.setCount;
    }
    
    updateStatus(message) {
        this.exerciseStatus.textContent = message;
        this.exerciseStatus.className = 'status-text';
        
        if (message.includes('Going down') || message.includes('Curl up')) {
            this.exerciseStatus.classList.add('detecting');
        } else if (message.includes('completed')) {
            this.exerciseStatus.classList.add('counting');
        }
    }
    
    resetCounters() {
        this.repCount = 0;
        this.setCount = 0;
        this.updateCounters();
        this.updateStatus('Counters reset - Ready to start');
        
        // Reset exercise states
        this.squatState = 'standing';
        this.bicepCurlState = 'down';
    }
}

// POSE_CONNECTIONS constant for drawing pose
const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14],
    [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24],
    [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
    [27, 31], [28, 32]
];

// Initialize the exercise counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing exercise counter');
    
    // Always initialize the exercise counter for authentication handling
    const exerciseCounter = new ExerciseCounter();
    window.exerciseCounter = exerciseCounter;
    
    // Wait for auth manager to initialize
    setTimeout(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            exerciseCounter.updateUserInfo();
        }
    }, 100);
});
