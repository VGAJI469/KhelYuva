// KhelYuva - Main JavaScript File

// Navigation and Page Management
class KhelYuvaApp {
    constructor() {
        this.currentPage = 'landing';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
    }

    setupNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Close mobile menu if open
        this.closeMobileMenu();

        // Special handling for auth page
        if (pageName === 'auth') {
            // Reset to login tab when showing auth page
            const loginTab = document.getElementById('login-tab');
            const signupTab = document.getElementById('signup-tab');
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            
            if (loginTab && signupTab && loginForm && signupForm) {
                loginTab.classList.add('font-bold', 'text-orange-500', 'border-b-2', 'border-orange-500');
                loginTab.classList.remove('text-gray-500', 'border-b-2', 'border-transparent');
                signupTab.classList.add('text-gray-500', 'border-b-2', 'border-transparent');
                signupTab.classList.remove('font-bold', 'text-orange-500', 'border-b-2', 'border-orange-500');
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            }
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.add('hidden');
    }

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khelYuvaApp = new KhelYuvaApp();
});

// Global function for page navigation (used in HTML)
function showPage(pageName) {
    if (window.khelYuvaApp) {
        window.khelYuvaApp.showPage(pageName);
    }
}
