// Sports Assessment System
class SportsAssessment {
    constructor() {
        this.currentSport = null;
        this.currentExerciseIndex = 0;
        this.exercises = [];
        this.assessmentData = [];
        this.timer = null;
        this.startTime = null;
        this.isAssessmentActive = false;
        
        // Scoring parameters
        this.scoringWeights = {
            form: 0.4,      // 40% - Technical execution
            stability: 0.3,  // 30% - Balance and control
            duration: 0.2,   // 20% - Time held/executed
            stamina: 0.1     // 10% - Endurance factor
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.defineSports();
    }
    
    initializeElements() {
        // Sport selection elements
        this.sportSelection = document.getElementById('sport-selection');
        this.assessmentMode = document.getElementById('assessment-mode');
        this.resultsScreen = document.getElementById('results-screen');
        
        // Assessment elements
        this.selectedSportName = document.getElementById('selectedSportName');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.currentExerciseName = document.getElementById('currentExerciseName');
        this.exerciseDescription = document.getElementById('exerciseDescription');
        this.exerciseInstructions = document.getElementById('exerciseInstructions');
        
        // Scoring elements
        this.formScore = document.getElementById('formScore');
        this.formValue = document.getElementById('formValue');
        this.stabilityScore = document.getElementById('stabilityScore');
        this.stabilityValue = document.getElementById('stabilityValue');
        this.durationScore = document.getElementById('durationScore');
        this.durationValue = document.getElementById('durationValue');
        this.overallScore = document.getElementById('overallScore');
        this.overallValue = document.getElementById('overallValue');
        
        // Timer elements
        this.timerText = document.getElementById('timerText');
        this.formFeedback = document.getElementById('formFeedback');
        
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.nextExerciseBtn = document.getElementById('nextExerciseBtn');
        
        // Results elements
        this.finalScoreText = document.getElementById('finalScoreText');
        this.scoreBreakdown = document.getElementById('scoreBreakdown');
        this.performanceFeedback = document.getElementById('performanceFeedback');
        this.recommendations = document.getElementById('recommendations');
        
        // Action buttons
        this.retakeAssessment = document.getElementById('retakeAssessment');
        this.viewHistory = document.getElementById('viewHistory');
        this.selectNewSport = document.getElementById('selectNewSport');
    }
    
    setupEventListeners() {
        // Sport selection
        document.querySelectorAll('.sport-card').forEach(card => {
            card.addEventListener('click', () => this.selectSport(card.dataset.sport));
        });
        
        // Assessment controls
        this.startBtn.addEventListener('click', () => this.startAssessment());
        this.stopBtn.addEventListener('click', () => this.stopAssessment());
        this.nextExerciseBtn.addEventListener('click', () => this.nextExercise());
        
        // Results actions
        this.retakeAssessment.addEventListener('click', () => this.retakeAssessment());
        this.viewHistory.addEventListener('click', () => this.viewHistory());
        this.selectNewSport.addEventListener('click', () => this.selectNewSport());
    }
    
    defineSports() {
        this.sports = {
            gymnastics: {
                name: 'Gymnastics',
                exercises: [
                    {
                        name: 'Handstand Hold',
                        description: 'Hold a handstand position for 30 seconds',
                        duration: 30,
                        instructions: [
                            'Position yourself in front of the camera',
                            'Kick up into a handstand against a wall',
                            'Keep your body straight and aligned',
                            'Hold the position for the full duration'
                        ],
                        scoring: {
                            form: {
                                criteria: ['straight_line', 'aligned_shoulders', 'pointed_toes'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['minimal_wobble', 'consistent_position'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    },
                    {
                        name: 'Bridge Hold',
                        description: 'Hold a bridge position for 20 seconds',
                        duration: 20,
                        instructions: [
                            'Lie on your back with knees bent',
                            'Place hands by your ears',
                            'Push up into a bridge position',
                            'Keep your body in a straight line'
                        ],
                        scoring: {
                            form: {
                                criteria: ['straight_line', 'open_shoulders', 'aligned_hips'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['steady_position', 'no_sagging'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    },
                    {
                        name: 'Plank Hold',
                        description: 'Hold a plank position for 45 seconds',
                        duration: 45,
                        instructions: [
                            'Start in push-up position',
                            'Lower to forearms',
                            'Keep body straight from head to heels',
                            'Engage your core throughout'
                        ],
                        scoring: {
                            form: {
                                criteria: ['straight_line', 'engaged_core', 'aligned_shoulders'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['minimal_movement', 'consistent_height'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    },
                    {
                        name: 'L-Sit Hold',
                        description: 'Hold an L-sit position for 15 seconds',
                        duration: 15,
                        instructions: [
                            'Sit on the floor with legs extended',
                            'Place hands beside your hips',
                            'Lift your body off the ground',
                            'Keep legs straight and parallel to ground'
                        ],
                        scoring: {
                            form: {
                                criteria: ['straight_legs', 'lifted_hips', 'straight_arms'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['steady_position', 'no_swaying'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    },
                    {
                        name: 'Wall Walk',
                        description: 'Perform 5 wall walks',
                        duration: 60,
                        instructions: [
                            'Start in plank position facing wall',
                            'Walk feet up the wall while walking hands closer',
                            'Get as close to the wall as possible',
                            'Walk back down to starting position'
                        ],
                        scoring: {
                            form: {
                                criteria: ['controlled_movement', 'straight_line', 'smooth_transition'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['balanced_movement', 'no_falling'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    }
                ]
            },
            yoga: {
                name: 'Yoga',
                exercises: [
                    {
                        name: 'Tree Pose',
                        description: 'Hold tree pose for 30 seconds on each side',
                        duration: 60,
                        instructions: [
                            'Stand on one leg',
                            'Place other foot on inner thigh',
                            'Bring hands to prayer position',
                            'Focus on a fixed point for balance'
                        ],
                        scoring: {
                            form: {
                                criteria: ['straight_spine', 'aligned_hips', 'relaxed_shoulders'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['minimal_wobble', 'steady_breathing'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    },
                    {
                        name: 'Warrior III',
                        description: 'Hold warrior III pose for 20 seconds on each side',
                        duration: 40,
                        instructions: [
                            'Stand on one leg',
                            'Hinge forward at hips',
                            'Extend other leg behind you',
                            'Keep body in straight line'
                        ],
                        scoring: {
                            form: {
                                criteria: ['straight_line', 'parallel_legs', 'engaged_core'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            },
                            stability: {
                                criteria: ['balanced_position', 'controlled_breathing'],
                                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
                            }
                        }
                    }
                ]
            }
        };
    }
    
    selectSport(sportKey) {
        this.currentSport = sportKey;
        this.exercises = this.sports[sportKey].exercises;
        this.currentExerciseIndex = 0;
        
        this.selectedSportName.textContent = `${this.sports[sportKey].name} Assessment`;
        this.sportSelection.style.display = 'none';
        this.assessmentMode.style.display = 'block';
        
        this.loadCurrentExercise();
    }
    
    loadCurrentExercise() {
        const exercise = this.exercises[this.currentExerciseIndex];
        this.currentExerciseName.textContent = exercise.name;
        this.exerciseDescription.textContent = exercise.description;
        
        // Update instructions
        this.exerciseInstructions.innerHTML = '';
        exercise.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            this.exerciseInstructions.appendChild(li);
        });
        
        // Update progress
        const progress = ((this.currentExerciseIndex + 1) / this.exercises.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `Exercise ${this.currentExerciseIndex + 1} of ${this.exercises.length}`;
        
        // Reset scores
        this.resetScores();
    }
    
    resetScores() {
        this.updateScore('form', 0);
        this.updateScore('stability', 0);
        this.updateScore('duration', 0);
        this.updateScore('overall', 0);
    }
    
    startAssessment() {
        this.isAssessmentActive = true;
        this.startTime = Date.now();
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        
        // Start timer
        this.startTimer();
        
        // Start pose detection and scoring
        this.startPoseDetection();
        
        this.updateStatus('Assessment in progress...');
    }
    
    stopAssessment() {
        this.isAssessmentActive = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        // Stop timer
        this.stopTimer();
        
        // Save current exercise data
        this.saveExerciseData();
        
        this.updateStatus('Assessment stopped');
    }
    
    nextExercise() {
        this.saveExerciseData();
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex < this.exercises.length) {
            this.loadCurrentExercise();
            this.nextExerciseBtn.disabled = true;
        } else {
            this.completeAssessment();
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.isAssessmentActive) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                this.timerText.textContent = this.formatTime(elapsed);
                
                // Update duration score
                const exercise = this.exercises[this.currentExerciseIndex];
                const durationScore = Math.min(100, (elapsed / exercise.duration) * 100);
                this.updateScore('duration', durationScore);
                
                // Auto-advance if duration reached
                if (elapsed >= exercise.duration) {
                    this.nextExercise();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    startPoseDetection() {
        // This would integrate with the existing pose detection system
        // For now, we'll simulate real-time scoring
        this.simulateRealTimeScoring();
    }
    
    simulateRealTimeScoring() {
        if (!this.isAssessmentActive) return;
        
        // Simulate form and stability scoring based on pose detection
        const formScore = Math.random() * 40 + 60; // 60-100 range
        const stabilityScore = Math.random() * 30 + 70; // 70-100 range
        
        this.updateScore('form', formScore);
        this.updateScore('stability', stabilityScore);
        
        // Update overall score
        const overallScore = this.calculateOverallScore();
        this.updateScore('overall', overallScore);
        
        // Provide form feedback
        this.updateFormFeedback(formScore, stabilityScore);
        
        // Continue simulation
        setTimeout(() => this.simulateRealTimeScoring(), 500);
    }
    
    updateScore(type, score) {
        const clampedScore = Math.max(0, Math.min(100, score));
        
        switch(type) {
            case 'form':
                this.formScore.style.width = `${clampedScore}%`;
                this.formValue.textContent = `${Math.round(clampedScore)}/100`;
                break;
            case 'stability':
                this.stabilityScore.style.width = `${clampedScore}%`;
                this.stabilityValue.textContent = `${Math.round(clampedScore)}/100`;
                break;
            case 'duration':
                this.durationScore.style.width = `${clampedScore}%`;
                this.durationValue.textContent = `${Math.round(clampedScore)}/100`;
                break;
            case 'overall':
                this.overallScore.style.width = `${clampedScore}%`;
                this.overallValue.textContent = `${Math.round(clampedScore)}/100`;
                break;
        }
    }
    
    calculateOverallScore() {
        const form = parseFloat(this.formValue.textContent.split('/')[0]);
        const stability = parseFloat(this.stabilityValue.textContent.split('/')[0]);
        const duration = parseFloat(this.durationValue.textContent.split('/')[0]);
        
        return (form * this.scoringWeights.form) + 
               (stability * this.scoringWeights.stability) + 
               (duration * this.scoringWeights.duration);
    }
    
    updateFormFeedback(formScore, stabilityScore) {
        let feedback = '';
        let className = 'good';
        
        if (formScore < 50) {
            feedback = 'Focus on maintaining proper form';
            className = 'error';
        } else if (formScore < 70) {
            feedback = 'Good form, try to improve alignment';
            className = 'warning';
        } else if (stabilityScore < 60) {
            feedback = 'Great form! Work on stability';
            className = 'warning';
        } else {
            feedback = 'Excellent form and stability!';
            className = 'good';
        }
        
        this.formFeedback.textContent = feedback;
        this.formFeedback.className = `form-feedback show ${className}`;
    }
    
    saveExerciseData() {
        const exercise = this.exercises[this.currentExerciseIndex];
        const form = parseFloat(this.formValue.textContent.split('/')[0]);
        const stability = parseFloat(this.stabilityValue.textContent.split('/')[0]);
        const duration = parseFloat(this.durationValue.textContent.split('/')[0]);
        const overall = parseFloat(this.overallValue.textContent.split('/')[0]);
        
        this.assessmentData.push({
            exercise: exercise.name,
            form: form,
            stability: stability,
            duration: duration,
            overall: overall,
            timestamp: new Date()
        });
    }
    
    completeAssessment() {
        this.assessmentMode.style.display = 'none';
        this.resultsScreen.style.display = 'block';
        
        // Calculate final scores
        const finalScores = this.calculateFinalScores();
        this.displayResults(finalScores);
        
        // Save to database
        this.saveAssessmentToDatabase(finalScores);
    }
    
    calculateFinalScores() {
        const totalExercises = this.assessmentData.length;
        let totalForm = 0, totalStability = 0, totalDuration = 0, totalOverall = 0;
        
        this.assessmentData.forEach(data => {
            totalForm += data.form;
            totalStability += data.stability;
            totalDuration += data.duration;
            totalOverall += data.overall;
        });
        
        return {
            form: Math.round(totalForm / totalExercises),
            stability: Math.round(totalStability / totalExercises),
            duration: Math.round(totalDuration / totalExercises),
            overall: Math.round(totalOverall / totalExercises)
        };
    }
    
    displayResults(scores) {
        this.finalScoreText.textContent = `Your overall score: ${scores.overall}/100`;
        
        // Score breakdown
        this.scoreBreakdown.innerHTML = `
            <div class="score-item">
                <span>Form: ${scores.form}/100</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${scores.form}%"></div>
                </div>
            </div>
            <div class="score-item">
                <span>Stability: ${scores.stability}/100</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${scores.stability}%"></div>
                </div>
            </div>
            <div class="score-item">
                <span>Duration: ${scores.duration}/100</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${scores.duration}%"></div>
                </div>
            </div>
        `;
        
        // Performance feedback
        this.generatePerformanceFeedback(scores);
        
        // Recommendations
        this.generateRecommendations(scores);
    }
    
    generatePerformanceFeedback(scores) {
        let feedback = '';
        
        if (scores.overall >= 90) {
            feedback = 'Outstanding performance! You demonstrate excellent technique and control.';
        } else if (scores.overall >= 80) {
            feedback = 'Great job! You show strong fundamentals with room for minor improvements.';
        } else if (scores.overall >= 70) {
            feedback = 'Good performance! Focus on consistency and form refinement.';
        } else if (scores.overall >= 60) {
            feedback = 'Decent effort! Work on technique and stability for better results.';
        } else {
            feedback = 'Keep practicing! Focus on basic form and building strength.';
        }
        
        this.performanceFeedback.innerHTML = `<p>${feedback}</p>`;
    }
    
    generateRecommendations(scores) {
        let recommendations = [];
        
        if (scores.form < 70) {
            recommendations.push('Practice basic form exercises to improve technique');
        }
        if (scores.stability < 70) {
            recommendations.push('Work on balance and core strength exercises');
        }
        if (scores.duration < 70) {
            recommendations.push('Build endurance with longer holds and repetitions');
        }
        if (scores.overall >= 80) {
            recommendations.push('Consider advancing to more challenging exercises');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Continue your current training routine');
        }
        
        this.recommendations.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    }
    
    async saveAssessmentToDatabase(scores) {
        if (window.authManager && window.authManager.isAuthenticated()) {
            try {
                const { error } = await window.authManager.saveAssessmentData(
                    this.currentSport,
                    this.assessmentData,
                    scores,
                    new Date()
                );
                
                if (error) {
                    console.error('Failed to save assessment:', error);
                } else {
                    console.log('Assessment saved successfully');
                }
            } catch (error) {
                console.error('Error saving assessment:', error);
            }
        }
    }
    
    retakeAssessment() {
        this.assessmentData = [];
        this.currentExerciseIndex = 0;
        this.resultsScreen.style.display = 'none';
        this.assessmentMode.style.display = 'block';
        this.loadCurrentExercise();
    }
    
    viewHistory() {
        // This would show historical assessment data
        console.log('View history functionality');
    }
    
    selectNewSport() {
        this.assessmentData = [];
        this.currentExerciseIndex = 0;
        this.resultsScreen.style.display = 'none';
        this.sportSelection.style.display = 'block';
    }
    
    updateStatus(message) {
        // Update status display if needed
        console.log(message);
    }
}

// Initialize the sports assessment system
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth manager to be ready
    const initSportsAssessment = () => {
        if (window.authManager) {
            window.sportsAssessment = new SportsAssessment();
        } else {
            setTimeout(initSportsAssessment, 100);
        }
    };
    initSportsAssessment();
});
