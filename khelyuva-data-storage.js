// KhelYuva Data Storage System
class KhelYuvaDataStorage {
    constructor() {
        this.storageKey = 'khelyuva_user_data';
        this.userData = this.loadUserData();
        this.currentSession = null;
    }

    loadUserData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {
                sessions: [],
                totalSessions: 0,
                totalReps: 0,
                averageScore: 0,
                bestScores: {},
                exerciseStats: {},
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading user data:', error);
            return this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            sessions: [],
            totalSessions: 0,
            totalReps: 0,
            averageScore: 0,
            bestScores: {},
            exerciseStats: {},
            lastUpdated: new Date().toISOString()
        };
    }

    saveUserData() {
        try {
            this.userData.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    startSession(exercise) {
        this.currentSession = {
            id: Date.now().toString(),
            exercise: exercise,
            startTime: new Date().toISOString(),
            reps: 0,
            formScores: [],
            stabilityScores: [],
            overallScores: [],
            endTime: null,
            duration: 0
        };
    }

    endSession() {
        if (this.currentSession) {
            this.currentSession.endTime = new Date().toISOString();
            this.currentSession.duration = new Date(this.currentSession.endTime) - new Date(this.currentSession.startTime);
            
            // Calculate averages
            this.currentSession.averageFormScore = this.calculateAverage(this.currentSession.formScores);
            this.currentSession.averageStabilityScore = this.calculateAverage(this.currentSession.stabilityScores);
            this.currentSession.averageOverallScore = this.calculateAverage(this.currentSession.overallScores);
            
            // Add to user data
            this.userData.sessions.push(this.currentSession);
            this.updateUserStats();
            this.saveUserData();
            
            const session = this.currentSession;
            this.currentSession = null;
            return session;
        }
        return null;
    }

    addRepData(formScore, stabilityScore, overallScore) {
        if (this.currentSession) {
            this.currentSession.reps++;
            this.currentSession.formScores.push(formScore);
            this.currentSession.stabilityScores.push(stabilityScore);
            this.currentSession.overallScores.push(overallScore);
        }
    }

    calculateAverage(scores) {
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    updateUserStats() {
        this.userData.totalSessions = this.userData.sessions.length;
        this.userData.totalReps = this.userData.sessions.reduce((sum, session) => sum + session.reps, 0);
        
        // Calculate average score
        const allScores = this.userData.sessions.flatMap(session => session.overallScores);
        this.userData.averageScore = this.calculateAverage(allScores);
        
        // Update best scores for each exercise
        this.userData.sessions.forEach(session => {
            const exercise = session.exercise;
            if (!this.userData.bestScores[exercise] || session.averageOverallScore > this.userData.bestScores[exercise]) {
                this.userData.bestScores[exercise] = session.averageOverallScore;
            }
        });
        
        // Update exercise statistics
        this.userData.exerciseStats = this.calculateExerciseStats();
    }

    calculateExerciseStats() {
        const stats = {};
        const exercises = [...new Set(this.userData.sessions.map(session => session.exercise))];
        
        exercises.forEach(exercise => {
            const exerciseSessions = this.userData.sessions.filter(session => session.exercise === exercise);
            const totalReps = exerciseSessions.reduce((sum, session) => sum + session.reps, 0);
            const averageScore = this.calculateAverage(exerciseSessions.flatMap(session => session.overallScores));
            const bestScore = Math.max(...exerciseSessions.map(session => session.averageOverallScore));
            
            stats[exercise] = {
                sessions: exerciseSessions.length,
                totalReps: totalReps,
                averageScore: averageScore,
                bestScore: bestScore,
                lastSession: exerciseSessions[exerciseSessions.length - 1]?.startTime
            };
        });
        
        return stats;
    }

    getRecentSessions(limit = 10) {
        return this.userData.sessions
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
            .slice(0, limit);
    }

    getTopPerformances(limit = 5) {
        return this.userData.sessions
            .sort((a, b) => b.averageOverallScore - a.averageOverallScore)
            .slice(0, limit);
    }

    getExerciseDistribution() {
        const distribution = {};
        this.userData.sessions.forEach(session => {
            distribution[session.exercise] = (distribution[session.exercise] || 0) + 1;
        });
        return distribution;
    }

    getWeeklyProgress() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return this.userData.sessions
            .filter(session => new Date(session.startTime) >= weekAgo)
            .map(session => ({
                date: session.startTime.split('T')[0],
                reps: session.reps,
                score: session.averageOverallScore,
                exercise: session.exercise
            }));
    }

    getDashboardData() {
        const recentSessions = this.getRecentSessions(5);
        const topPerformances = this.getTopPerformances(3);
        const exerciseDistribution = this.getExerciseDistribution();
        const weeklyProgress = this.getWeeklyProgress();
        
        return {
            totalSessions: this.userData.totalSessions,
            totalReps: this.userData.totalReps,
            averageScore: this.userData.averageScore,
            recentSessions: recentSessions,
            topPerformances: topPerformances,
            exerciseDistribution: exerciseDistribution,
            weeklyProgress: weeklyProgress,
            exerciseStats: this.userData.exerciseStats,
            bestScores: this.userData.bestScores
        };
    }

    clearAllData() {
        this.userData = this.getDefaultData();
        this.saveUserData();
    }

    exportData() {
        return JSON.stringify(this.userData, null, 2);
    }

    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.userData = { ...this.getDefaultData(), ...importedData };
            this.saveUserData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Global data storage instance
window.khelYuvaDataStorage = new KhelYuvaDataStorage();
