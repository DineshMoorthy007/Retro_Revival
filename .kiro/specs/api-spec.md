# AI Frogger - API Specification

## Overview

The AI Frogger backend provides RESTful API endpoints for enhanced gameplay features including adaptive difficulty, predictive assistance, and performance analytics.

**Base URL**: `http://localhost:5000`  
**Content-Type**: `application/json`  
**CORS**: Enabled for all origins during development

## Authentication

Currently no authentication required. All endpoints are publicly accessible during development.

## Health Check

### GET /api/health

Check if the AI backend is running and responsive.

**Response**:
```json
{
  "status": "healthy",
  "message": "AI Backend is running"
}
```

**Status Codes**:
- `200 OK`: Backend is operational
- `500 Internal Server Error`: Backend issues

## Performance Analytics

### POST /api/analyze_performance

Submit player performance data for AI learning and skill assessment.

**Request Body**:
```json
{
  "move_time": 0.75,
  "level_completed": true,
  "player_path": [
    {
      "x": 9,
      "y": 14,
      "timestamp": 1640995200000,
      "success": true
    }
  ],
  "score": 1250,
  "level": 3
}
```

**Response**:
```json
{
  "status": "success",
  "skill_level": "intermediate"
}
```

**Parameters**:
- `move_time` (number): Average reaction time in seconds
- `level_completed` (boolean): Whether the level was successfully completed
- `player_path` (array): Sequence of player movements with timestamps
- `score` (number): Current game score
- `level` (number): Current game level

## Adaptive Traffic Generation

### POST /api/adaptive_traffic

Generate dynamic traffic patterns based on player behavior and skill level.

**Request Body**:
```json
{
  "player_position": {
    "x": 9,
    "y": 8
  },
  "level": 2,
  "cars": [
    {
      "x": 5.2,
      "y": 7,
      "width": 1.8,
      "direction": 1,
      "speed": 2.1
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "traffic_lanes": [
    {
      "y": 11,
      "density": 0.35,
      "speed": 2.4,
      "direction": 1,
      "car_spacing": 2.8,
      "prediction_data": [
        [2, 5, 8, 12, 15],
        [3, 6, 9, 13, 16]
      ]
    }
  ],
  "difficulty_adjustment": 1.2
}
```

**Parameters**:
- `player_position` (object): Current frog coordinates
- `level` (number): Current game level
- `cars` (array): Current vehicle positions and properties

**Response Fields**:
- `traffic_lanes` (array): Generated lane configurations
- `difficulty_adjustment` (number): Skill-based multiplier applied
- `prediction_data` (array): Safe positions for next 10 time steps

## Adaptive River Generation

### POST /api/adaptive_river

Generate dynamic river flow patterns based on player water crossing performance.

**Request Body**:
```json
{
  "player_position": {
    "x": 9,
    "y": 3
  },
  "level": 2,
  "logs": [
    {
      "x": 3.5,
      "y": 2,
      "width": 3.2,
      "direction": -1,
      "speed": 1.1
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "river_lanes": [
    {
      "y": 5,
      "flow_speed": 1.2,
      "log_density": 0.38,
      "direction": 1,
      "log_spacing": 2.1,
      "turbulence": 0.05
    }
  ],
  "flow_adjustment": 0.9
}
```

**Parameters**:
- `player_position` (object): Current frog coordinates
- `level` (number): Current game level
- `logs` (array): Current log/turtle positions and properties

**Response Fields**:
- `river_lanes` (array): Generated river lane configurations
- `flow_adjustment` (number): Skill-based flow speed multiplier
- `turbulence` (number): Random variation factor

## Predictive Assistance

### POST /api/predictive_assistance

Get AI-powered hints, safe paths, and danger zone predictions.

**Request Body**:
```json
{
  "player_position": {
    "x": 9,
    "y": 8
  },
  "cars": [
    {
      "x": 5.2,
      "y": 7,
      "width": 1.8,
      "direction": 1,
      "speed": 2.1
    }
  ],
  "logs": [
    {
      "x": 3.5,
      "y": 2,
      "width": 3.2,
      "direction": -1,
      "speed": 1.1
    }
  ],
  "level": 2
}
```

**Response**:
```json
{
  "status": "success",
  "safe_paths": [
    {
      "x": 9,
      "y": 7,
      "safety_score": 0.85,
      "direction": {
        "dx": 0,
        "dy": -1
      }
    }
  ],
  "predictions": {
    "cars": [
      {
        "current": {
          "x": 5.2,
          "y": 7,
          "width": 1.8
        },
        "future": [
          {
            "x": 5.4,
            "y": 7,
            "time": 1
          }
        ]
      }
    ],
    "logs": []
  },
  "hints": [
    {
      "type": "direction",
      "message": "Move UP to progress!",
      "urgency": "medium"
    }
  ],
  "danger_zones": [
    {
      "x": 6,
      "y": 7,
      "type": "car",
      "severity": "high"
    }
  ],
  "glow_intensity": 0.8,
  "skill_level": "intermediate"
}
```

**Parameters**:
- `player_position` (object): Current frog coordinates
- `cars` (array): Current vehicle positions
- `logs` (array): Current log/turtle positions
- `level` (number): Current game level

**Response Fields**:
- `safe_paths` (array): Recommended movement options with safety scores
- `predictions` (object): Future positions of obstacles
- `hints` (array): Contextual advice messages
- `danger_zones` (array): Areas to avoid with severity levels
- `glow_intensity` (number): Visual assistance intensity (0-1)
- `skill_level` (string): Current player skill assessment

## Player Statistics

### GET /api/player_stats

Retrieve aggregated player performance statistics.

**Response**:
```json
{
  "skill_level": "intermediate",
  "total_games": 15,
  "average_reaction_time": 0.68,
  "success_rate": 0.73
}
```

**Response Fields**:
- `skill_level` (string): Current skill classification
- `total_games` (number): Total games played
- `average_reaction_time` (number): Mean reaction time in seconds
- `success_rate` (number): Percentage of successful level completions (0-1)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Detailed error description"
}
```

**Common Status Codes**:
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Backend processing error
- `503 Service Unavailable`: Backend temporarily unavailable

## Rate Limiting

Currently no rate limiting implemented. In production, consider:
- 100 requests per minute per IP
- Burst allowance of 20 requests
- Graceful degradation when limits exceeded

## Data Models

### Player Position
```json
{
  "x": 9,        // Grid X coordinate (0-19)
  "y": 14       // Grid Y coordinate (0-14)
}
```

### Vehicle Object
```json
{
  "x": 5.2,      // Current X position (float)
  "y": 7,        // Lane Y position (integer)
  "width": 1.8,  // Vehicle width in grid units
  "direction": 1, // Movement direction (-1 or 1)
  "speed": 2.1   // Movement speed (units per second)
}
```

### Log/Turtle Object
```json
{
  "x": 3.5,      // Current X position (float)
  "y": 2,        // Lane Y position (integer)
  "width": 3.2,  // Platform width in grid units
  "direction": -1, // Movement direction (-1 or 1)
  "speed": 1.1   // Movement speed (units per second)
}
```

### Movement Record
```json
{
  "x": 9,                    // Grid X coordinate
  "y": 14,                   // Grid Y coordinate
  "timestamp": 1640995200000, // Unix timestamp in milliseconds
  "success": true            // Whether move was successful
}
```

## Integration Examples

### Frontend Connection Test
```javascript
async function testConnection() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Backend status:', data.status);
  } catch (error) {
    console.log('Backend unavailable');
  }
}
```

### Getting AI Hints
```javascript
async function getHints(gameState) {
  const response = await fetch('http://localhost:5000/api/predictive_assistance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState)
  });
  
  const assistance = await response.json();
  return assistance.hints;
}
```

## Development Notes

- All coordinates use the game's 20x15 grid system
- Floating-point positions allow for smooth movement between grid cells
- Time values are in milliseconds (Unix timestamps) or seconds (durations)
- Direction values: -1 (left/up), 1 (right/down)
- Safety scores range from 0 (dangerous) to 1 (completely safe)

## Future Enhancements

Planned API extensions:
- User authentication and persistent profiles
- Multiplayer session management
- Advanced analytics and reporting
- Custom difficulty configuration
- Achievement and progression tracking