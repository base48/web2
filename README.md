# Base48 - Brněnský hackerspace

[![Website](https://img.shields.io/website?down_color=green&down_message=online&up_color=brightgreen&up_message=online&url=https%3A//baseb48.cz)](https://base48.cz)
[![License](https://img.shields.io/badge/license-copyleft-blue.svg)](https://github.com/Thebys/base48/blob/main/README.md#credits)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/responsive-mobile%20friendly-brightgreen)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
[![No Build](https://img.shields.io/badge/build-not%20required-success)](https://github.com/Thebys/base48)
[![Accessibility](https://img.shields.io/badge/a11y-accessible-brightgreen)](https://www.w3.org/WAI/WCAG21/quickref/)

🔧 **Modern responsive website for Base48 hackerspace in Brno, Czech Republic**

![Base48 Hackerspace](img/og/base48_og_01.webp)

## 🌟 About

Base48 is a community-driven hackerspace and maker workshop located in Brno, Czech Republic. This website serves as the digital front door to our physical space, showcasing our facilities, community, and mission to provide a collaborative environment for DIY projects, electronics, 3D printing, and knowledge sharing.

## ✨ Features

### 🎨 Design & UX
- **Retro-futuristic aesthetic** with CRT monitor frames and pixel art elements
- **Responsive design** that works seamlessly on desktop, tablet, and mobile
- **Dark/Light theme toggle** for optimal viewing experience
- **Smooth animations** and hover effects for enhanced interactivity
- **Accessibility-focused** with proper ARIA labels and semantic HTML
- **One hand usable** all actions are reachable single-handedly

### 🖼️ Interactive Elements
- **Interactive visual features** that make people remember our website
- **Animated satellite sprite** with clickable Easter egg explaining the "48" origin
- **Interactive photo galleries** with lightbox functionality
- **CRT-style frame displays** showcasing different areas of the hackerspace
- **Smooth scrolling navigation** between sections
- **Status indicator** showing current Base48 location status
- **Hamburger menu** for mobile navigation

### 📱 Modern Web Technologies
- **CSS Grid & Flexbox** for responsive layouts
- **CSS Custom Properties** for consistent theming
- **Vanilla JavaScript** for lightweight interactivity
- **WebP images** for optimized loading

## 🛠️ Technology Stack

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript** - Lightweight, dependency-free interactions
- **WebP Images** - Modern image format for optimal performance
- **Font Awesome** - Icon library for consistent iconography
- **No Build** - Or advanced optimisation for sake of transparency
- **Hosting (server) directives** - Not included in this repository

## 📁 Project Structure

```
├── index.html             # Main HTML file
├── api/                   # Cached HA API JSON responses
│   ├── base_status.json    # Base status indicator provided by HA.
├── css/                   # Stylesheets
│   ├── main.css            # Main CSS imports
│   ├── variables.css       # CSS custom properties
│   ├── base.css            # Base styles and resets
│   ├── layout.css          # Layout and grid systems
│   ├── components.css      # Reusable component styles
│   ├── responsive.css      # Media queries and responsive design
│   ├── animations.css      # CSS animations and transitions
│   ├── buttons.css         # Button component styles
│   ├── lightbox.css        # Image lightbox functionality
│   ├── crt-effect.css      # Retro CRT monitor effects
│   ├── satellite.css       # Animated satellite sprite
│   ├── fonts.css           # Font declarations
│   └── utilities.css       # Utility classes
├── js/                    # JavaScript files
│   ├── main.js             # Main JavaScript functionality
│   └── calendar.js         # Upcoming events from the public Nextcloud calendar
├── img/                   # Images and assets
│   ├── logo/               # Base48 logos
│   ├── gallery/            # Photo gallery images
│   ├── screen/             # CRT screen content images
│   ├── frame/              # CRT frame images
│   └── og/                 # Open Graph images
└── vendor/                # Third-party assets
    ├── fa/                 # Font Awesome icons
    └── ical/               # ical.js 2.2.1 (MPL-2.0), iCalendar parsing for calendar.js
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- Local web server (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thebys/base48.git
   cd base48
   ```

2. **Open in browser**
   Open `index.html` directly.


### Responsive Design
- Mobile-first approach
- Flexible grid systems
- Adaptive typography and spacing
- Touch-friendly interactive elements

### Performance Optimizations
- Optimized WebP images with fallbacks
- Efficient CSS organization
- Minimal JavaScript footprint
- Lazy loading for gallery images

## 🤝 Contributing

We welcome contributions to improve the website! Please:

1. Submit a pull request

### Development Guidelines
- Follow existing code style and organization
- Maintain accessibility standards
- Test responsive design on multiple devices
- Optimize images before adding to the repository
- Document any new features or changes

## 📄 Credits

[![GitHub contributors](https://img.shields.io/github/contributors/Thebys/base48?color=brightgreen)](https://github.com/Thebys/base48/graphs/contributors)
[![GitHub last commit](https://img.shields.io/github/last-commit/Thebys/base48)](https://github.com/Thebys/base48/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/Thebys/base48?style=social)](https://github.com/Thebys/base48/stargazers)

©left Base48, z.s. Some rights reserved.

---

**Made with ❤️ by the Base48 community**

*prepared by Tomáš "Thebys" Biheler* 