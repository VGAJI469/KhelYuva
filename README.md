# KhelYuva - AI-Powered Sports Talent Discovery Platform

<div align="center">

![KhelYuva Logo](logo.png)

**Democratizing Sports Talent Discovery with AI**

[Live Demo](#) • [Documentation](#setup-guide) • [Issues](https://github.com/VGAJI469/KhelYuva/issues)

</div>

---

## 🎯 About KhelYuva

KhelYuva is an innovative AI-powered platform that revolutionizes sports talent discovery by leveraging computer vision and pose detection technology. It enables athletes and coaches to:

- **Assess Sports Performance**: Evaluate athletic abilities through intelligent testing
- **Track Exercise Form**: Real-time pose detection for proper movement tracking
- **Count Repetitions**: Automated rep counting using AI vision analysis
- **Monitor Progress**: Store and analyze workout data over time
- **Discover Talent**: Identify and nurture sports talent through data-driven insights

The platform uses **MediaPipe** for advanced pose detection and **Supabase** for secure data management and authentication.

---

## ✨ Key Features

### 🎮 AI-Powered Pose Detection

- Real-time body pose estimation using MediaPipe
- Support for multiple exercise types:
  - Push-ups
  - Squats
  - Bicep Curls
  - Jumping Jacks
- Automatic rep counting with form validation
- Real-time visual feedback with pose landmarks

### 📊 Sports Assessment System

- Comprehensive athletic ability evaluation
- Multi-sport assessment templates
- Detailed performance metrics and scoring
- Progress tracking and analytics dashboard

### 👥 User Management

- Secure authentication via Supabase
- User profiles and workout history
- Role-based access (Athletes, Coaches)
- Personal progress tracking

### 📈 Data Management

- Cloud-based data storage (Supabase)
- Workout history and results archiving
- Assessment data persistence
- Data export capabilities

### 🎨 Modern UI/UX

- Responsive web design (Mobile + Desktop)
- Clean, modern interface with Tailwind CSS
- Interactive dashboard for coaches
- Real-time camera feed processing

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser with webcam support (Chrome, Firefox, Edge, Safari)
- Stable internet connection
- Supabase account (for data persistence)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/VGAJI469/KhelYuva.git
cd KhelYuva
```

2. **Configure Supabase**
   - Follow the detailed setup guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Update `supabase-config.js` with your credentials:

   ```javascript
   const SUPABASE_URL = "YOUR_SUPABASE_URL";
   const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
   ```

3. **Open in Browser**
   - Open `khelyuva.html` directly in your browser, or
   - Serve with a local web server:

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server
   ```

   - Navigate to `http://localhost:8000`

4. **Grant Camera Permissions**
   - Allow camera access when prompted by the browser
   - The app requires webcam access for pose detection

---

## 📁 Project Structure

```
KhelYuva/
├── khelyuva.html                    # Main application interface
├── coach-dashboard.html              # Coach dashboard for managing athletes
├── khelyuva.js                      # Core app navigation & logic
├── khelyuva-pose-detection.js       # AI pose detection engine
├── khelyuva-dashboard.js            # Dashboard functionality
├── khelyuva-data-storage.js         # Data persistence layer
├── sports-assessment.js             # Assessment scoring system
├── supabase-config.js               # Supabase configuration
├── script.js                        # Additional utilities
├── styles.css                       # Custom styling
├── logo.png                         # Brand logo
├── SUPABASE_SETUP.md                # Database setup guide
└── README.md                        # This file
```

---

## 🔧 Configuration

### Supabase Setup

KhelYuva uses Supabase for:

- **Authentication**: User sign-up and login
- **Database**: Storing workouts and assessment data
- **Real-time Updates**: Live data synchronization

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for complete setup instructions.

### Database Schema

**Workouts Table**

```sql
- id: Primary key
- user_id: User reference
- exercise: Exercise type (push-up, squat, etc.)
- reps: Number of repetitions
- sets: Number of sets
- date: Timestamp
- scores: Performance metrics (JSON)
```

**Assessments Table**

```sql
- id: Primary key
- user_id: User reference
- sport: Sport being assessed
- assessment_data: Detailed assessment metrics (JSON)
- final_scores: Final evaluation scores (JSON)
- date: Timestamp
```

---

## 🎯 How to Use

### 1. **For Athletes**

1. Sign up or log in
2. Select an exercise from the workout menu
3. Position yourself in front of the camera
4. Follow on-screen instructions
5. App will automatically count reps and track form
6. View results and save to profile

### 2. **For Coaches**

1. Access the coach dashboard
2. View athlete profiles and progress
3. Run sports assessments
4. Track team performance metrics
5. Generate performance reports

### 3. **Exercise Tracking**

- **Push-ups**: Recognize up/down motion
- **Squats**: Detect knee bend and hip movement
- **Bicep Curls**: Track arm curl motion
- **Jumping Jacks**: Count full-body coordination movements

---

## 🧠 Technology Stack

| Layer              | Technology                                |
| ------------------ | ----------------------------------------- |
| **Frontend**       | HTML5, CSS3, JavaScript (Vanilla)         |
| **UI Framework**   | Tailwind CSS                              |
| **AI/ML**          | MediaPipe (Pose Detection)                |
| **Backend**        | Supabase (PostgreSQL)                     |
| **Authentication** | Supabase Auth                             |
| **Hosting**        | (Ready for Netlify, Vercel, GitHub Pages) |

### Key Libraries

- **MediaPipe**: Real-time pose estimation
- **Tailwind CSS**: Responsive styling
- **Font Awesome**: Icon library
- **Supabase JS**: Database & auth client

---

## 📊 Features Deep Dive

### Pose Detection Engine

- Detects 33 body landmarks in real-time
- Calculates joint angles and distances
- Validates exercise form based on biomechanics
- Assigns form scores (0-100)

### Rep Counting Algorithm

- Tracks state transitions (up/down, bent/straight)
- Implements cooldown to prevent double-counting
- Validates full range of motion
- Provides real-time feedback

### Scoring System

- **Form Score**: Quality of exercise execution (0-100)
- **Speed Score**: Exercise cadence and tempo (0-100)
- **Consistency Score**: Stability and control (0-100)
- **Overall Score**: Composite assessment (0-100)

---

## 🔐 Security

- **Authentication**: Supabase handles secure user authentication
- **Data Privacy**: Row-Level Security (RLS) policies enforce user data isolation
- **API Keys**: Public key used for client-side operations only
- **CORS**: Configured for secure cross-origin requests
- **Best Practices**: Never commit credentials; use environment variables in production

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md#security-notes) for security guidelines.

---

## 🚀 Deployment

### Deploy to Netlify

```bash
# Connect repository to Netlify
# Netlify will auto-detect and deploy
# Then update Supabase Site URL and Redirect URLs
```

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to GitHub Pages

```bash
# Push to gh-pages branch
git subtree push --prefix . origin gh-pages
```

---

## 🐛 Troubleshooting

### Camera Not Working

- Check browser camera permissions
- Ensure HTTPS (or localhost) for camera access
- Grant camera access when prompted

### Pose Detection Not Accurate

- Ensure good lighting
- Position yourself 3-6 feet from camera
- Wear contrasting clothing
- Ensure full body is visible

### Database Connection Issues

- Verify Supabase URL and API key are correct
- Check internet connection
- Ensure firewall isn't blocking requests
- Check Supabase project status

### Authentication Problems

- Clear browser cache and cookies
- Verify Supabase credentials
- Check email spam folder for verification links
- Ensure redirect URLs match in Supabase settings

---

## 📈 Performance Optimization

- **Lazy Loading**: Images and scripts load on demand
- **Efficient Pose Detection**: Optimized MediaPipe models
- **Data Caching**: Workout history cached locally
- **Responsive Design**: Minimal layout shifts

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source. Please check the license file for details.

---

## 💬 Support

For issues, questions, or suggestions:

- Open an issue on [GitHub Issues](https://github.com/VGAJI469/KhelYuva/issues)
- Check [SUPABASE_SETUP.md](SUPABASE_SETUP.md#troubleshooting) for common problems

---

## 🙏 Acknowledgments

- **MediaPipe** for powerful pose detection technology
- **Supabase** for backend services
- **Tailwind CSS** for modern styling
- **Font Awesome** for icons

---

## 📞 Contact

For inquiries, reach out via GitHub or visit the project repository.

---

**Built with ❤️ for sports talent discovery**
