# 🌱 EcoStep - Personal Carbon Footprint Tracker

A modern, responsive web application that helps users track their carbon footprint through an interactive quiz and provides personalized eco-friendly tips.

## 🌟 Features

### 🎯 Interactive Quiz
- **5 comprehensive questions** covering transportation, plastic usage, food waste, electricity consumption, and recycling habits
- **Smart scoring system** that calculates environmental impact
- **Smooth animations** and transitions between questions
- **Keyboard navigation support** (Arrow keys, Enter, number keys)

### 📊 Dynamic Results
- **Animated score display** with progress bars and counters
- **Tree visualization** showing environmental impact
- **Personalized feedback** based on quiz results
- **Four result categories**: Eco Champion, Green Warrior, Getting Started, Time for Change

### 💡 Eco-Friendly Tips
- **6 actionable tips** with visual icons and impact measurements
- **Hover animations** and interactive cards
- **Tree savings calculator** for each tip
- **Professional design** with eco-themed colors

### 📱 Responsive Design
- **Mobile-first approach** with breakpoints for all devices
- **Tablet and desktop optimized** layouts
- **Touch-friendly** interface elements
- **Accessible navigation** with proper ARIA labels

## 🎨 Design Features

### Color Palette
- **Primary Green**: #38a169 (Forest Green)
- **Light Green**: #68d391 (Spring Green)
- **Background**: #f7fafc (Light Gray)
- **Text**: #2d3748 (Dark Gray)
- **Accent**: #e6fffa (Mint)

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Responsive font sizes** that scale with screen size
- **Clear hierarchy** with proper heading structure

### Icons
- **Font Awesome 6.4.0** for consistent iconography
- **Semantic icons** that match content context
- **Hover effects** and color transitions

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Installation
1. **Download** or clone the project files
2. **Extract** to your desired directory
3. **Open** `index.html` in your web browser

### Running with Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
EcoStep Website/
├── index.html          # Main HTML structure
├── style.css          # CSS styling and responsive design
├── script.js          # JavaScript functionality and animations
└── README.md          # Project documentation
```

## 🔧 Technical Implementation

### HTML Structure
- **Semantic HTML5** elements for better accessibility
- **Proper heading hierarchy** (h1, h2, h3)
- **ARIA labels** for screen readers
- **Meta tags** for SEO and mobile optimization

### CSS Features
- **CSS Grid** and **Flexbox** for modern layouts
- **CSS Custom Properties** for consistent theming
- **Media queries** for responsive breakpoints
- **CSS animations** and transitions
- **No external frameworks** - pure CSS implementation

### JavaScript Functionality
- **ES6+ features** with proper browser support
- **Event-driven architecture** for user interactions
- **Local storage** for quiz state management
- **Performance optimized** with debounced scroll events
- **Error handling** with user-friendly notifications

## 🎮 User Interaction

### Quiz Navigation
- **Click** options to select answers
- **Next/Previous** buttons for navigation
- **Keyboard shortcuts**:
  - `Arrow Right` or `Enter`: Next question
  - `Arrow Left`: Previous question
  - `1-4`: Select option by number

### Animations
- **Fade-in effects** when scrolling into view
- **Smooth scrolling** between sections
- **Counter animations** for score display
- **Progress bar** animations
- **Hover effects** on interactive elements

## 🌍 Environmental Impact Calculator

### Scoring System
Each quiz answer is assigned points (0-3):
- **0 points**: Most eco-friendly choice
- **1 point**: Good environmental choice
- **2 points**: Moderate environmental impact
- **3 points**: High environmental impact

### Result Categories
- **0-3 points**: Eco Champion 🌟
- **4-7 points**: Green Warrior 🌱
- **8-11 points**: Getting Started 🌿
- **12-15 points**: Time for Change 🌍

### Tree Visualization
Results show equivalent tree impact:
- **Eco Champion**: 8-10 trees
- **Green Warrior**: 5-7 trees
- **Getting Started**: 2-4 trees
- **Time for Change**: 1 tree

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
Base: 320px+          /* Mobile phones */
Tablet: 768px+        /* Tablets */
Desktop: 1024px+      /* Desktop screens */
Large: 1200px+        /* Large screens */
```

## ♿ Accessibility Features

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** for better UX
- **Color contrast** meets WCAG guidelines
- **Semantic HTML** structure
- **Alt text** for images (when added)

## 🔮 Future Enhancements

### Potential Features
- **Data persistence** with localStorage
- **Social sharing** of results
- **More quiz questions** for detailed analysis
- **Carbon offset calculator** with real data
- **Progress tracking** over time
- **Gamification** with badges and achievements

### Technical Improvements
- **Service Worker** for offline functionality
- **Progressive Web App** features
- **Advanced animations** with CSS/JS libraries
- **Real-time data** integration
- **Multi-language support**

## 🤝 Contributing

This project is built with beginner-friendly, clean code. Feel free to:
- **Add new quiz questions**
- **Improve animations**
- **Enhance accessibility**
- **Add new eco tips**
- **Optimize performance**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

### Images
- **Hero background**: [Unsplash](https://unsplash.com/photos/forest-trees-photography-4hlHqiJkkjk)
- **Additional images**: [Pexels](https://pexels.com)

### Icons
- **Font Awesome**: [fontawesome.com](https://fontawesome.com)

### Inspiration
- **Environmental awareness** and **sustainable living** practices
- **Modern web design** trends and **user experience** principles

---

**Built with 💚 for the planet** | **EcoStep 2024**

*Making the world greener, one step at a time.*
