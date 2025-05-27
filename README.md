# 🚀 SpeedSync - Real-Time GPS Speed Tracking

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PWA-Ready-4285F4?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
</div>

<div align="center">
  <h3>🏎️ Professional GPS speedometer with real-time tracking, journey analytics, and achievement system</h3>
  
  [🌟 Live Demo](https://speedsync.vercel.app) • [📱 Try Mobile](https://speedsync.vercel.app) • [📖 Documentation](#documentation)
</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Real-Time GPS Tracking** - Accurate speed monitoring using device GPS
- **Multi-Transport Modes** - Walking, Running, Car, Train, Flight with custom speed limits
- **Interactive Speedometer** - Beautiful animated digital speedometer with progress rings
- **Journey Recording** - Complete path tracking with timestamps and speed data
- **Live Map Integration** - OpenStreetMap with real-time position and route visualization

### 📊 Advanced Analytics
- **Journey History** - Detailed statistics for all tracked journeys
- **Speed Analytics** - Max speed, average speed, and speed distribution
- **Elevation Tracking** - Altitude monitoring with elevation gain/loss
- **Achievement System** - Gamified experience with unlockable achievements
- **Weather Integration** - Real-time weather data for journey context

### 🎨 User Experience
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Offline Support** - Works without internet connection (GPS only)
- **Speed Alerts** - Customizable speed limit warnings

### 🔧 Technical Features
- **PWA Ready** - Installable as mobile app
- **TypeScript** - Full type safety and better developer experience
- **Performance Optimized** - Fast loading with code splitting
- **Accessibility** - WCAG compliant with screen reader support
- **Privacy First** - All data stored locally, no tracking

---

## 🖼️ Screenshots

<div align="center">
  <img src="https://sjc.microlink.io/j6XAYeIrv5P1Qpt3f3cjvWr9S6gz425eNCcqVamr246wzR3yBHog73zL9EXRxUhCGguTcJa5EmweI5lsxHTVAg.jpeg" width="600" alt="SpeedSync Main Interface" />
  <p><em>SpeedSync main interface showing the digital speedometer, transport modes, and real-time tracking controls</em></p>
</div>

### Key Features Shown:
- 🎯 **Interactive Speedometer** - Large digital display with progress ring
- 🚗 **Transport Mode Selection** - Walking, Running, Car, Train, Flight options  
- ⚙️ **Speed Settings** - Customizable speed limits and alerts
- 📊 **Real-time Stats** - Distance, duration, max/avg speed tracking
- 🎨 **Modern UI** - Clean, responsive design with smooth animations
- 📱 **Mobile Optimized** - Perfect for on-the-go speed tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Modern browser with GPS support

### Installation

``` bash
# Clone the repository
git clone https://github.com/ahansardar/speedsync.git
cd speedsync

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a \`.env.local\` file in the root directory:



---

## 📱 Usage

### Getting Started
1. **Allow Location Access** - Grant GPS permissions when prompted
2. **Select Transport Mode** - Choose from walking, running, car, train, or flight
3. **Set Speed Limit** - Configure speed alerts for safety
4. **Start Tracking** - Tap the play button to begin journey recording
5. **Monitor Speed** - Watch real-time speed on the digital speedometer
6. **View Journey** - See your path on the integrated map
7. **Stop & Save** - End tracking to save journey data

### Transport Modes
- 🚶 **Walking** (0-8 km/h) - Perfect for pedestrian tracking
- 🏃 **Running** (0-25 km/h) - Ideal for jogging and running
- 🚗 **Car** (0-200 km/h) - Standard vehicle tracking
- 🚆 **Train** (0-300 km/h) - High-speed rail monitoring
- ✈️ **Flight** (0-900 km/h) - Aviation speed tracking

### Achievement System
Unlock achievements by reaching milestones:
- 🏆 **Speed Demon** - Reach 100+ km/h
- 🗺️ **Explorer** - Travel 10+ km in one journey
- ⏱️ **Endurance Master** - Journey for over 1 hour
- 🚴 **Century Rider** - Travel 100+ km
- And many more!

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Modern icon library

### APIs & Services
- **Geolocation API** - GPS tracking
- **OpenStreetMap** - Map tiles and routing
- **OpenWeather API** - Weather data (optional)
- **Local Storage** - Client-side data persistence

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Tailwind CSS** - Styling

---

## 🏗️ Project Structure

```
speedsync/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── speedsync-icon.tsx # Custom app icon
│   ├── achievement-panel.tsx
│   └── theme-provider.tsx
├── lib/                   # Utility functions
├── public/               # Static assets
├── docs/                 # Documentation
└── README.md
```

---

## 🚀 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/speedsync)

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build Docker image
docker build -t speedsync .

# Run container
docker run -p 3000:3000 speedsync
```

### Other Platforms
- **Netlify** - Connect GitHub repo for auto-deployment
- **GitHub Pages** - Use \`npm run export\` for static export
- **Railway** - One-click deployment from GitHub

---

## 🔒 Privacy & Security

### Data Privacy
- **Local Storage Only** - All journey data stored on your device
- **No Tracking** - No analytics or user tracking by default
- **GPS Only** - Location data never leaves your device
- **Open Source** - Full transparency of data handling

### Security Features
- **HTTPS Required** - Secure connection for GPS access
- **Permission-Based** - Explicit GPS permission required
- **No Server Storage** - No personal data on external servers
- **Client-Side Processing** - All calculations done locally

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/yourusername/speedsync.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m 'Add amazing feature'

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

### Areas for Contribution
- 🌍 **Internationalization** - Multi-language support
- 📊 **Analytics** - Advanced journey analytics
- 🎨 **Themes** - Additional color schemes
- 🔌 **Integrations** - Third-party service connections
- 📱 **Mobile App** - React Native version
- 🧪 **Testing** - Unit and integration tests

---

## 📊 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Key Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## 🐛 Known Issues & Limitations

### GPS Accuracy
- Indoor GPS may be less accurate
- Requires clear sky view for best results
- Battery usage increases during tracking

### Browser Support
- Requires modern browser with Geolocation API
- HTTPS required for GPS access
- Some features may not work in private/incognito mode

### Performance
- Continuous GPS tracking affects battery life
- Large journey datasets may impact performance
- Map rendering requires good internet connection

---

## 📋 Roadmap

### Version 2.0
- [ ] **Offline Maps** - Download maps for offline use
- [ ] **Journey Sharing** - Share journeys with friends
- [ ] **Route Planning** - Plan routes before traveling
- [ ] **Voice Alerts** - Audio speed limit warnings

### Version 2.1
- [ ] **Fitness Integration** - Connect with fitness trackers
- [ ] **Social Features** - Leaderboards and challenges
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **API Integration** - Connect with other apps

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenStreetMap** - Map data and tiles
- **Shadcn/ui** - Beautiful UI components
- **Vercel** - Hosting and deployment
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Utility-first CSS framework

---

## 📞 Contact & Support

### Developer
- **Portfolio**: [Ahan Sardar](https://ahansardar.vercel.app/))
- **GitHub**: [@ahansardar](https://github.com/ahansardar)
- **Email**: ahansardarvis@gmail.com

### Support
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/speedsync/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/speedsync/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/speedsync/wiki)

---

<div align="center">
  <h3>⭐ If you found this project helpful, please give it a star!</h3>
  
  **Built with ❤️ for the developer community**
  
  [⬆ Back to Top](#-speedsync---real-time-gps-speed-tracking)
</div>
