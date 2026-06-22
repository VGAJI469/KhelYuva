// Supabase configuration
const SUPABASE_URL = 'https://qoxghmulgcwatgojxjue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFveGdobXVsZ2N3YXRnb2p4anVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Njc4NDQsImV4cCI6MjA3MzU0Mzg0NH0.LZGArp0vazN4PY3WSEHWCwgkbrbYxpFcOsf1_Pkm2Fo';

// Initialize Supabase client safely (CDN may not load in certain network environments)
let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        const { createClient } = supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase CDN not loaded. Running in demo/offline mode.');
    }
} catch (err) {
    console.error('Supabase initialization failed:', err);
}

// Authentication helper functions
class AuthManager {
    constructor() {
        this.user = null;
        this.session = null;
        this.init();
    }

    async init() {
        // If Supabase didn't load, fall back to demo mode
        if (!supabaseClient) {
            console.warn('AuthManager: Supabase unavailable, operating in demo mode.');
            this.showAuthPage();
            return;
        }
        try {
            // Check for existing session
            const { data: { session } } = await supabaseClient.auth.getSession();
            this.session = session;
            this.user = session?.user || null;
            
            console.log('Auth manager initialized, user:', this.user ? 'logged in' : 'not logged in');
            
            // Listen for auth changes
            supabaseClient.auth.onAuthStateChange((event, session) => {
                this.session = session;
                this.user = session?.user || null;
                this.onAuthStateChange(event, session);
            });
            
            // Show appropriate page based on auth state
            if (this.user) {
                this.showMainApp();
            } else {
                this.showAuthPage();
            }
        } catch (error) {
            console.error('Error initializing auth manager:', error);
            this.showAuthPage();
        }
    }

    onAuthStateChange(event, session) {
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', session.user);
            this.showMainApp();
            // Update user info in the header
            if (session.user) {
                const userEmailEl = document.getElementById('userEmail');
                if (userEmailEl) {
                    userEmailEl.textContent = session.user.email;
                }
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            this.showAuthPage();
        }
    }

    async signUp(email, password, userData = {}) {
        if (!supabaseClient) return { data: null, error: new Error('Supabase not available') };
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        }
    }

    async signIn(email, password) {
        if (!supabaseClient) return { data: null, error: new Error('Supabase not available') };
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }
    }

    async signOut() {
        if (!supabaseClient) { this.showAuthPage(); return; }
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async saveWorkoutData(exercise, reps, sets, date = new Date(), scores = null) {
        if (!supabaseClient) return { error: 'Supabase not available' };
        if (!this.user) return { error: 'User not authenticated' };

        try {
            const { data, error } = await supabaseClient
                .from('workouts')
                .insert([
                    {
                        user_id: this.user.id,
                        exercise: exercise,
                        reps: reps,
                        sets: sets,
                        date: date.toISOString(),
                        scores: scores
                    }
                ]);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Save workout error:', error);
            return { data: null, error };
        }
    }

    async saveAssessmentData(sport, assessmentData, finalScores, date = new Date()) {
        if (!supabaseClient) return { error: 'Supabase not available' };
        if (!this.user) return { error: 'User not authenticated' };

        try {
            const { data, error } = await supabaseClient
                .from('assessments')
                .insert([
                    {
                        user_id: this.user.id,
                        sport: sport,
                        assessment_data: assessmentData,
                        final_scores: finalScores,
                        date: date.toISOString()
                    }
                ]);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Save assessment error:', error);
            return { data: null, error };
        }
    }

    async getWorkoutHistory() {
        if (!supabaseClient) return { data: [], error: 'Supabase not available' };
        if (!this.user) return { data: [], error: 'User not authenticated' };

        try {
            const { data, error } = await supabaseClient
                .from('workouts')
                .select('*')
                .eq('user_id', this.user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Get workout history error:', error);
            return { data: [], error };
        }
    }

    // showAuthPage / showMainApp use the real page system from khelyuva.html
    // khelyuva.html uses .page / .page.active CSS pattern with showPage() function
    showAuthPage() {
        // Try the SPA page system first
        if (typeof showPage === 'function') {
            showPage('auth');
        } else {
            // Fallback: directly manipulate page divs
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const authPage = document.getElementById('auth');
            if (authPage) authPage.classList.add('active');
        }
    }

    showMainApp() {
        if (typeof showPage === 'function') {
            showPage('landing');
        } else {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const landingPage = document.getElementById('landing');
            if (landingPage) landingPage.classList.add('active');
        }
    }

    isAuthenticated() {
        return this.user !== null;
    }

    getCurrentUser() {
        return this.user;
    }
}

// Global auth manager instance
window.authManager = new AuthManager();
