# AI Frogger - Design Specification

## Visual Design Philosophy

AI Frogger combines authentic 1980s arcade aesthetics with modern AI-enhanced gameplay features. The design maintains nostalgic charm while incorporating contemporary usability principles.

## Color Palette

### Primary Colors
- **Neon Green**: `#00ff00` - Primary UI elements, frog, safe paths
- **Electric Blue**: `#00ffff` - Water elements, AI hints, secondary accents
- **Warning Red**: `#ff0000` - Danger zones, game over states, critical alerts
- **Bright Yellow**: `#ffff00` - Score display, predictions, caution elements

### Secondary Colors
- **Dark Green**: `#004400` - Safe zones, grass textures, frog details
- **Deep Blue**: `#000066` - Water backgrounds, deep river sections
- **Charcoal**: `#333333` - Road surfaces, neutral backgrounds
- **Pure Black**: `#000000` - Primary background, text shadows

### Accent Colors
- **Orange**: `#ff8800` - Vehicle variety, connection warnings
- **Magenta**: `#ff00ff` - Vehicle variety, special effects
- **Light Blue**: `#87ceeb` - Vehicle windows, water highlights
- **Brown**: `#8b4513` - Log textures, natural elements

## Typography

### Primary Font
**Press Start 2P** - Google Fonts
- Authentic 8-bit arcade aesthetic
- Excellent readability at small sizes
- Consistent character spacing
- Nostalgic gaming appeal

### Font Hierarchy
```css
h1 (Game Title): 24px, #00ff00, text-shadow glow
h2 (Game Over): 20px, #ff0000, text-shadow glow
h3 (Section Headers): 10px, #00ffff
Body Text: 8-12px, #00ff00/#ffff00
UI Labels: 8px, #888888
```

### Text Effects
- **Glow Effect**: `text-shadow: 0 0 10px [color]`
- **Retro Spacing**: `letter-spacing: 1px`
- **No Anti-aliasing**: Crisp pixel-perfect rendering

## Layout Structure

### Game Container
```
┌─────────────────────────────────────┐
│              HEADER                 │
│         (Title & Scores)            │
├─────────────────────────────────────┤
│                                     │
│            GAME CANVAS              │
│             (800x600)               │
│                                     │
├─────────────────────────────────────┤
│             CONTROLS                │
│      (AI Panel | Game Buttons)     │
├─────────────────────────────────────┤
│           INSTRUCTIONS              │
│        (Control Reference)         │
└─────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop**: 1024px+ (Full layout)
- **Tablet**: 768-1023px (Scaled canvas)
- **Mobile**: <768px (Stacked layout)

## Game Canvas Design

### Grid System
- **Dimensions**: 800x600 pixels (20x15 grid)
- **Cell Size**: 40x40 pixels per grid unit
- **Coordinate System**: (0,0) top-left, (19,14) bottom-right

### Zone Visual Design

#### Goal Zone (Row 0)
- **Background**: Bright green `#006600`
- **Pattern**: "GOAL" text centered
- **Effect**: Subtle pulsing glow
- **Border**: Dotted green line

#### Water Zones (Rows 1-5)
- **Background**: Deep blue `#000066`
- **Pattern**: Animated ripple effects
- **Ripples**: Curved lines in `#0000aa`
- **Animation**: Gentle wave motion

#### Safe Zones (Rows 6, 12, 14)
- **Background**: Dark green `#004400`
- **Pattern**: Scattered grass texture
- **Grass**: Small vertical lines in `#006600`
- **Density**: Random 30% coverage

#### Road Zones (Rows 7-11)
- **Background**: Charcoal `#333333`
- **Pattern**: Yellow dashed center line
- **Line Style**: 10px dash, 10px gap
- **Width**: 2px stroke weight

### Grid Overlay
- **Lines**: Subtle `#444444` 1px strokes
- **Visibility**: Always visible for precise movement
- **Opacity**: 50% to avoid visual clutter

## Character Design

### Frog Sprite
```
Components:
├── Body: Oval, 36x30px, #00ff00
├── Belly: Oval, 24x20px, #66ff66 (lighter)
├── Eyes: Two circles, 12px diameter, #ffffff
├── Pupils: Two circles, 6px diameter, #000000
├── Eye Shine: Two dots, 2px diameter, #ffffff
├── Spots: Three circles, 6-8px diameter, #008800
├── Nostrils: Two dots, 2px diameter, #004400
└── Legs: Two ovals, 16x10px, #00ff00
```

### Animation States
- **Idle**: Static pose, subtle breathing
- **Leaping**: Scale 1.0→1.3→1.0, Y offset -15px
- **Rotation**: 0°, 90°, 180°, 270° based on direction
- **Duration**: 300ms with ease-out cubic timing

## Vehicle Design

### Car Sprite
```
Components:
├── Body: Rectangle, variable width x 32px
├── Windows: Rectangle, 80% width x 10px, #87ceeb
├── Wheels: Two circles, 8px diameter, #000000
├── Headlights: Rectangle, 6x20px, #ffffff
└── Color: Lane-specific (red, yellow, magenta, cyan, orange)
```

### Truck Sprite
```
Components:
├── Main Body: Rectangle, variable width x 32px
├── Cab: Rectangle, 30% width x 36px (darker shade)
├── Windows: Rectangle, 80% width x 10px, #87ceeb
├── Wheels: Two circles, 8px diameter, #000000
└── Headlights: Rectangle, 6x20px, #ffffff
```

## Water Platform Design

### Log Sprite
```
Components:
├── Body: Rectangle, variable width x 32px, #8b4513
├── Rings: Circles every 15px, #654321 stroke
├── Ends: Two circles, 16px diameter, #8b4513
└── Texture: Vertical grain lines
```

### Turtle Sprite
```
Components:
├── Shell: Oval, variable width x 32px, #228b22
├── Pattern: Diagonal cross lines, #006400
├── Head: Circle, 12px diameter, #32cd32
└── Position: Leading edge based on direction
```

## UI Component Design

### Buttons
```css
Base Style:
├── Background: #003300
├── Border: 2px solid #00ff00
├── Color: #00ff00
├── Padding: 8px 12px
├── Font: Press Start 2P, 8px
└── Border-radius: 3px

Hover State:
├── Background: #00ff00
├── Color: #000000
└── Box-shadow: 0 0 10px #00ff00

Active State:
└── Transform: scale(0.95)
```

### AI Panel
```css
Style:
├── Background: #001a00
├── Border: 2px solid #00aa00
├── Padding: 10px
├── Border-radius: 5px
└── Width: 200px

Status Colors:
├── Connected: #00ff00
├── Local Mode: #ffff00
├── Connection Lost: #ff8800
└── Error: #ff0000
```

### Score Display
```css
Layout:
├── Display: Flex, space-around
├── Gap: 30px between elements
├── Font-size: 12px
├── Color: #ffff00
└── Margin-top: 15px from title
```

## AI Assistance Visualization

### Safe Path Indicators
```css
Style:
├── Background: rgba(0, 255, 0, 0.3)
├── Border: 2px solid #00ff00
├── Animation: Gentle pulsing glow
└── Z-index: Above background, below sprites
```

### Danger Zone Warnings
```css
Style:
├── Background: rgba(255, 0, 0, 0.4)
├── Border: 2px solid #ff0000
├── Animation: Rapid pulsing (0.5s cycle)
└── Z-index: Above background, below sprites
```

### Prediction Trails
```css
Style:
├── Stroke: #ffff00
├── Width: 1px
├── Pattern: Dashed (3px dash, 3px gap)
└── Opacity: 0.8
```

## Animation Specifications

### Glow Effects
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 30px #00ff00; }
  50% { box-shadow: 0 0 50px #00ff00, 0 0 70px #00ff00; }
}
```

### Frog Leap Animation
```css
@keyframes frogLeap {
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.2) translateY(-10px); }
  100% { transform: scale(1) translateY(0); }
}
```

### Safe Path Glow
```css
@keyframes safePathGlow {
  0%, 100% { box-shadow: 0 0 10px #00ff00; }
  50% { box-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00; }
}
```

### Danger Pulse
```css
@keyframes dangerPulse {
  0%, 100% { box-shadow: 0 0 15px #ff0000; }
  50% { box-shadow: 0 0 25px #ff0000, 0 0 35px #ff0000; }
}
```

## Game Over Screen Design

### Modal Overlay
```css
Style:
├── Background: rgba(0, 0, 0, 0.9)
├── Position: Fixed, full viewport
├── Z-index: 1000
└── Display: Flex, centered content
```

### Content Panel
```css
Style:
├── Background: #001100
├── Border: 4px solid #00ff00
├── Padding: 30px
├── Border-radius: 10px
├── Box-shadow: 0 0 30px #00ff00
└── Text-align: Center
```

## Accessibility Considerations

### Color Contrast
- **Primary Text**: 7:1 contrast ratio minimum
- **Secondary Text**: 4.5:1 contrast ratio minimum
- **Interactive Elements**: Clear focus indicators

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Focus Indicators**: Visible outline on focused elements
- **Keyboard Shortcuts**: Arrow keys, spacebar, enter

### Visual Indicators
- **Status Changes**: Multiple feedback methods (color, text, animation)
- **Game State**: Clear visual distinction between states
- **Progress**: Visible score, lives, and level indicators

## Performance Optimization

### Rendering Efficiency
- **Canvas Layers**: Separate static and dynamic elements
- **Dirty Rectangle**: Only redraw changed areas when possible
- **Sprite Caching**: Pre-render complex sprites
- **Animation Throttling**: 60fps cap with requestAnimationFrame

### Memory Management
- **Object Pooling**: Reuse vehicle and log objects
- **Texture Optimization**: Minimize canvas operations
- **Event Cleanup**: Remove unused event listeners

## Browser Compatibility

### Supported Features
- **Canvas 2D**: Full support required
- **CSS3 Animations**: Keyframes and transitions
- **Flexbox**: Layout system
- **Fetch API**: Backend communication
- **ES6+**: Modern JavaScript features

### Fallbacks
- **Web Fonts**: System font fallback for Press Start 2P
- **Canvas**: Graceful degradation message if unsupported
- **Animations**: Reduced motion respect for accessibility

## Asset Requirements

### Images
- No external images required
- All graphics rendered via Canvas 2D API
- Scalable vector-style rendering

### Fonts
- **Primary**: Press Start 2P (Google Fonts CDN)
- **Fallback**: Monospace system fonts
- **Loading**: Font-display: swap for performance

### Audio (Future Enhancement)
- **Sound Effects**: 8-bit style beeps and boops
- **Background Music**: Retro chiptune loops
- **Format**: Web Audio API compatible

## Development Guidelines

### Code Organization
```
CSS Structure:
├── Reset & Base Styles
├── Layout Components
├── Game Canvas Styles
├── UI Component Styles
├── Animation Definitions
└── Responsive Breakpoints
```

### Naming Conventions
- **Classes**: kebab-case (e.g., `game-container`)
- **IDs**: camelCase (e.g., `gameCanvas`)
- **CSS Variables**: --kebab-case (e.g., `--primary-green`)

### Maintainability
- **Modular CSS**: Component-based organization
- **Consistent Spacing**: 8px base unit system
- **Color Variables**: Centralized color definitions
- **Documentation**: Inline comments for complex styles