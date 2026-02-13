// KhelYuva Dashboard with Real Data
class KhelYuvaDashboard {
    constructor() {
        this.dataStorage = window.khelYuvaDataStorage;
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
    }

    loadDashboardData() {
        if (!this.dataStorage) {
            console.error('Data storage not available');
            return;
        }

        const data = this.dataStorage.getDashboardData();
        this.updateStatsOverview(data);
        this.updateTopPerformances(data.topPerformances);
        this.updateRecentSessions(data.recentSessions);
        this.updateExerciseDistribution(data.exerciseDistribution);
        this.updateWeeklyProgress(data.weeklyProgress);
        this.updateExerciseStats(data.exerciseStats);
    }

    updateStatsOverview(data) {
        // Update main stats
        this.updateStatCard('total-sessions', data.totalSessions);
        this.updateStatCard('total-reps', data.totalReps);
        this.updateStatCard('average-score', Math.round(data.averageScore));
        this.updateStatCard('accuracy-rate', this.calculateAccuracyRate(data));
    }

    updateStatCard(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = this.formatNumber(value);
        }
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    calculateAccuracyRate(data) {
        if (data.totalSessions === 0) return 0;
        const goodSessions = data.recentSessions.filter(session => session.averageOverallScore >= 70).length;
        return Math.round((goodSessions / data.recentSessions.length) * 100);
    }

    updateTopPerformances(performances) {
        const container = document.getElementById('top-performances');
        if (!container) return;

        if (performances.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-chart-line text-4xl mb-4"></i>
                    <p>No performance data yet</p>
                    <p class="text-sm">Start exercising to see your top performances!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = performances.map((session, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span class="text-sm font-bold text-blue-600">${index + 1}</span>
                    </div>
                    <div>
                        <div class="font-semibold">${this.formatExerciseName(session.exercise)}</div>
                        <div class="text-sm text-gray-600">${session.reps} reps • ${this.formatDate(session.startTime)}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-blue-600">${session.averageOverallScore}/100</div>
                    <div class="text-sm text-gray-600">Overall Score</div>
                </div>
            </div>
        `).join('');
    }

    updateRecentSessions(sessions) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-history text-2xl mb-2"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="flex items-center text-sm">
                <i class="fas fa-dumbbell text-blue-600 mr-3"></i>
                <span>${this.formatExerciseName(session.exercise)} - ${session.reps} reps</span>
                <span class="text-gray-500 ml-auto">${this.formatTimeAgo(session.startTime)}</span>
            </div>
        `).join('');
    }

    updateExerciseDistribution(distribution) {
        const container = document.getElementById('exercise-distribution');
        if (!container) return;

        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-chart-pie text-2xl mb-2"></i>
                    <p>No exercise data yet</p>
                </div>
            `;
            return;
        }

        const exercises = Object.entries(distribution).map(([exercise, count]) => ({
            name: this.formatExerciseName(exercise),
            count: count,
            percentage: Math.round((count / total) * 100)
        }));

        container.innerHTML = exercises.map(exercise => `
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">${exercise.name}</span>
                <div class="flex items-center">
                    <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${exercise.percentage}%"></div>
                    </div>
                    <span class="text-sm font-semibold">${exercise.percentage}%</span>
                </div>
            </div>
        `).join('');
    }

    updateWeeklyProgress(progress) {
        const container = document.getElementById('weekly-progress');
        if (!container) return;

        if (progress.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-calendar text-2xl mb-2"></i>
                    <p>No weekly data yet</p>
                </div>
            `;
            return;
        }

        // Group by date
        const dailyData = {};
        progress.forEach(item => {
            if (!dailyData[item.date]) {
                dailyData[item.date] = { reps: 0, sessions: 0, avgScore: 0 };
            }
            dailyData[item.date].reps += item.reps;
            dailyData[item.date].sessions += 1;
            dailyData[item.date].avgScore += item.score;
        });

        // Calculate averages
        Object.keys(dailyData).forEach(date => {
            dailyData[date].avgScore = Math.round(dailyData[date].avgScore / dailyData[date].sessions);
        });

        const maxReps = Math.max(...Object.values(dailyData).map(d => d.reps));
        
        container.innerHTML = Object.entries(dailyData).map(([date, data]) => `
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">${this.formatDate(date)}</span>
                <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div class="bg-green-600 h-2 rounded-full" style="width: ${(data.reps / maxReps) * 100}%"></div>
                    </div>
                    <span class="text-sm font-semibold">${data.reps} reps</span>
                </div>
            </div>
        `).join('');
    }

    updateExerciseStats(stats) {
        const container = document.getElementById('exercise-stats');
        if (!container) return;

        if (Object.keys(stats).length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-trophy text-2xl mb-2"></i>
                    <p>No exercise statistics yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = Object.entries(stats).map(([exercise, stat]) => `
            <div class="bg-gray-50 rounded-lg p-4 mb-3">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold">${this.formatExerciseName(exercise)}</h4>
                    <span class="text-sm text-gray-600">${stat.sessions} sessions</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Total Reps:</span>
                        <span class="font-semibold">${stat.totalReps}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Best Score:</span>
                        <span class="font-semibold text-green-600">${stat.bestScore}/100</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Average:</span>
                        <span class="font-semibold">${stat.averageScore}/100</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Last:</span>
                        <span class="font-semibold">${this.formatTimeAgo(stat.lastSession)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatExerciseName(exercise) {
        const names = {
            'pushups': 'Push-ups',
            'squats': 'Squats',
            'bicep-curls': 'Bicep Curls',
            'jumping-jacks': 'Jumping Jacks'
        };
        return names[exercise] || exercise;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return this.formatDate(dateString);
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }

        // Clear data button
        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
            this.dataStorage.clearAllData();
            this.loadDashboardData();
            alert('All data has been cleared.');
        }
    }

    refreshDashboard() {
        this.loadDashboardData();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard page
    if (document.getElementById('dashboard')) {
        window.khelYuvaDashboard = new KhelYuvaDashboard();
    }
});
