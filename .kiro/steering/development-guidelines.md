# AI Frogger - Development Guidelines

## Code Standards and Best Practices

This document outlines the development standards, coding conventions, and best practices for the AI Frogger project.

## JavaScript Coding Standards

### Code Style
- **Indentation**: 4 spaces (no tabs)
- **Line Length**: Maximum 120 characters
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes for HTML attributes
- **Naming**: camelCase for variables and functions, PascalCase for classes

### Function Organization
```javascript
// Good: Clear, descriptive function names
async function generateAdaptiveTraffic() {
    // Implementation
}

function calculateBestMove() {
    // Implementation
}

// Bad: Unclear, abbreviated names
function genTraf() {
    // Implementation
}
```

### Error Handling
```javascript
// Always use try-catch for async operations
async function connectToBackend() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log('Connection failed:', error.message);
        // Implement fallback behavior
    }
}
```

### Performance Considerations
- Use `requestAnimationFrame` for animations
- Minimize DOM queries by caching elements
- Implement object pooling for frequently created/destroyed objects
- Use efficient collision detection algorithms

## Python Backend Standards

### Code Style (PEP 8)
- **Indentation**: 4 spaces
- **Line Length**: Maximum 88 characters (Black formatter)
- **Naming**: snake_case for variables and functions, PascalCase for classes
- **Imports**: Grouped and sorted (standard library, third-party, local)

### API Design Principles
```python
# Consistent response format
def create_api_response(status, data=None, message=None):
    response = {"status": status}
    if data:
        response.update(data)
    if message:
        response["message"] = message
    return response

# Example usage
@app.route('/api/health')
def health_check():
    return jsonify(create_api_response(
        "success", 
        {"message": "AI Backend is running"}
    ))
```

### Error Handling
```python
# Comprehensive error handling
@app.route('/api/adaptive_traffic', methods=['POST'])
def adaptive_traffic():
    try:
        data = request.json
        if not data:
            return jsonify(create_api_response(
                "error", 
                message="No data provided"
            )), 400
        
        result = frogger_ai.generate_adaptive_traffic(data)
        return jsonify(result)
        
    except ValueError as e:
        return jsonify(create_api_response(
            "error", 
            message=f"Invalid data: {str(e)}"
        )), 400
    except Exception as e:
        return jsonify(create_api_response(
            "error", 
            message="Internal server error"
        )), 500
```

## Git Workflow

### Branch Naming
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-fix` - Emergency fixes

### Commit Messages
```
Format: type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Examples:
feat(ai): add predictive assistance system
fix(game): resolve frog animation timing issue
docs(api): update endpoint documentation
```

### Pull Request Guidelines
1. **Clear Title**: Descriptive summary of changes
2. **Description**: Detailed explanation of what and why
3. **Testing**: Evidence that changes work as expected
4. **Screenshots**: Visual changes should include before/after images
5. **Breaking Changes**: Clearly document any breaking changes

## Testing Strategy

### Frontend Testing
```javascript
// Unit tests for game logic
describe('Frog Movement', () => {
    test('should move frog to valid position', () => {
        const game = new AIFrogger();
        const initialX = game.frog.x;
        game.moveFrog(1, 0);
        expect(game.frog.x).toBe(initialX + 1);
    });
    
    test('should not move frog out of bounds', () => {
        const game = new AIFrogger();
        game.frog.x = 19; // Right edge
        game.moveFrog(1, 0);
        expect(game.frog.x).toBe(19); // Should not move
    });
});
```

### Backend Testing
```python
# Unit tests for AI logic
import unittest
from ai_backend import FroggerAI

class TestFroggerAI(unittest.TestCase):
    def setUp(self):
        self.ai = FroggerAI()
    
    def test_skill_level_classification(self):
        # Test beginner classification
        self.ai.player_metrics['reaction_times'] = [2.0, 2.5, 1.8]
        self.ai.player_metrics['success_rate'] = [0.3, 0.4, 0.2]
        self.ai._update_skill_level()
        self.assertEqual(self.ai.player_metrics['skill_level'], 'beginner')
```

### Integration Testing
- Test frontend-backend communication
- Verify API endpoint functionality
- Test error handling and fallback mechanisms
- Validate cross-browser compatibility

## Performance Guidelines

### Frontend Optimization
```javascript
// Efficient rendering loop
class GameRenderer {
    constructor() {
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
    }
    
    gameLoop(currentTime) {
        if (currentTime - this.lastFrameTime >= this.frameInterval) {
            this.update();
            this.render();
            this.lastFrameTime = currentTime;
        }
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
```

### Memory Management
```javascript
// Object pooling for vehicles
class VehiclePool {
    constructor(size = 50) {
        this.pool = [];
        this.active = [];
        
        // Pre-create objects
        for (let i = 0; i < size; i++) {
            this.pool.push(this.createVehicle());
        }
    }
    
    acquire() {
        return this.pool.pop() || this.createVehicle();
    }
    
    release(vehicle) {
        vehicle.reset();
        this.pool.push(vehicle);
    }
}
```

### Backend Performance
```python
# Efficient data processing
import numpy as np
from functools import lru_cache

class PerformanceOptimizer:
    @lru_cache(maxsize=128)
    def calculate_safety_score(self, x, y, obstacles_hash):
        """Cache expensive calculations"""
        # Implementation with numpy for vectorized operations
        return np.mean(safety_scores)
    
    def batch_process_requests(self, requests):
        """Process multiple requests efficiently"""
        return [self.process_single(req) for req in requests]
```

## Security Considerations

### Input Validation
```python
# Validate all API inputs
def validate_player_position(position):
    if not isinstance(position, dict):
        raise ValueError("Position must be an object")
    
    x, y = position.get('x'), position.get('y')
    if not (isinstance(x, (int, float)) and isinstance(y, (int, float))):
        raise ValueError("Coordinates must be numbers")
    
    if not (0 <= x <= 19 and 0 <= y <= 14):
        raise ValueError("Coordinates out of bounds")
    
    return True
```

### CORS Configuration
```python
# Secure CORS setup for production
from flask_cors import CORS

# Development
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Production
CORS(app, origins=["https://yourdomain.com"])
```

## Documentation Standards

### Code Comments
```javascript
/**
 * Calculates the optimal movement path for the frog
 * @param {Object} currentState - Current game state
 * @param {Array} obstacles - Array of obstacle objects
 * @param {number} lookahead - Number of steps to look ahead
 * @returns {Array} Array of movement suggestions
 */
function calculateOptimalPath(currentState, obstacles, lookahead = 3) {
    // Implementation details...
}
```

### API Documentation
- Use OpenAPI/Swagger specification
- Include request/response examples
- Document error codes and messages
- Provide integration examples

### README Updates
- Keep installation instructions current
- Update feature lists when adding functionality
- Include troubleshooting section
- Provide contribution guidelines

## Deployment Guidelines

### Environment Configuration
```javascript
// Environment-specific settings
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:5000',
        DEBUG: true,
        LOG_LEVEL: 'debug'
    },
    production: {
        API_BASE_URL: 'https://api.yourdomain.com',
        DEBUG: false,
        LOG_LEVEL: 'error'
    }
};
```

### Build Process
1. **Linting**: ESLint for JavaScript, Black for Python
2. **Testing**: Run full test suite
3. **Minification**: Compress JavaScript and CSS
4. **Asset Optimization**: Optimize images and fonts
5. **Security Scan**: Check for vulnerabilities

### Monitoring
- **Error Tracking**: Implement error logging
- **Performance Monitoring**: Track frame rates and response times
- **User Analytics**: Monitor gameplay patterns (privacy-compliant)

## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error conditions are managed
- [ ] Performance is acceptable

### Code Quality
- [ ] Follows coding standards
- [ ] Is well-documented
- [ ] Has appropriate tests
- [ ] Is maintainable and readable

### Security
- [ ] Input validation is present
- [ ] No sensitive data exposure
- [ ] CORS is properly configured
- [ ] Dependencies are up to date

### User Experience
- [ ] UI is responsive and accessible
- [ ] Error messages are user-friendly
- [ ] Loading states are handled
- [ ] Performance is smooth

## Maintenance Guidelines

### Regular Tasks
- **Weekly**: Update dependencies, review security alerts
- **Monthly**: Performance analysis, user feedback review
- **Quarterly**: Code refactoring, architecture review

### Version Management
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Changelog**: Document all changes
- **Migration Guides**: For breaking changes
- **Backward Compatibility**: Maintain when possible

### Monitoring and Alerts
- Set up automated testing on commits
- Monitor application performance metrics
- Alert on error rate increases
- Track user engagement metrics

This document should be reviewed and updated regularly as the project evolves and new best practices emerge.