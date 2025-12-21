from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import time
from collections import deque
import threading
import math

app = Flask(__name__)
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"])

# Add a simple health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "AI Backend is running"})

class FroggerAI:
    def __init__(self):
        # Player performance tracking
        self.player_metrics = {
            'reaction_times': deque(maxlen=50),
            'success_rate': deque(maxlen=20),
            'hesitation_count': 0,
            'crossing_patterns': [],
            'preferred_lanes': {},
            'skill_level': 'beginner',  # beginner, intermediate, advanced
            'total_games': 0,
            'average_score': 0
        }
        
        # Adaptive traffic system
        self.traffic_ai = {
            'base_density': 0.3,
            'current_density': 0.3,
            'speed_multiplier': 1.0,
            'pattern_learning': {},
            'surprise_factor': 0.1
        }
        
        # River flow AI
        self.river_ai = {
            'base_flow_speed': 1.0,
            'current_flow_speed': 1.0,
            'log_density': 0.4,
            'current_patterns': []
        }
        
        # Predictive assistance
        self.assistance = {
            'hint_frequency': 0.8,  # High for beginners
            'prediction_depth': 3,  # Frames to predict ahead
            'glow_intensity': 1.0,
            'adaptive_hints': True
        }
        
        # Game state tracking
        self.game_state = {
            'current_level': 1,
            'player_position': {'x': 9, 'y': 14},
            'last_move_time': time.time(),
            'move_history': deque(maxlen=100),
            'danger_zones': [],
            'safe_paths': []
        }
    
    def analyze_player_performance(self, game_data):
        """Analyze player performance and update metrics"""
        try:
            # Update reaction time
            if 'move_time' in game_data:
                reaction_time = game_data['move_time']
                self.player_metrics['reaction_times'].append(reaction_time)
            
            # Update success rate
            if 'level_completed' in game_data:
                success = 1 if game_data['level_completed'] else 0
                self.player_metrics['success_rate'].append(success)
            
            # Track crossing patterns
            if 'player_path' in game_data:
                self.player_metrics['crossing_patterns'].append(game_data['player_path'])
            
            # Update skill level based on performance
            self._update_skill_level()
            
            return {"status": "success", "skill_level": self.player_metrics['skill_level']}
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _update_skill_level(self):
        """Update player skill level based on metrics"""
        if len(self.player_metrics['reaction_times']) < 5:
            return
        
        avg_reaction = np.mean(self.player_metrics['reaction_times'])
        success_rate = np.mean(self.player_metrics['success_rate']) if self.player_metrics['success_rate'] else 0
        
        # Skill classification
        if avg_reaction < 0.5 and success_rate > 0.8:
            self.player_metrics['skill_level'] = 'advanced'
            self.assistance['hint_frequency'] = 0.2
        elif avg_reaction < 1.0 and success_rate > 0.6:
            self.player_metrics['skill_level'] = 'intermediate'
            self.assistance['hint_frequency'] = 0.5
        else:
            self.player_metrics['skill_level'] = 'beginner'
            self.assistance['hint_frequency'] = 0.8
    
    def generate_adaptive_traffic(self, current_state):
        """Generate adaptive traffic patterns based on player behavior"""
        try:
            player_pos = current_state.get('player_position', {'x': 9, 'y': 14})
            level = current_state.get('level', 1)
            
            # Learn from player crossing patterns
            self._learn_crossing_patterns(player_pos)
            
            # Adjust traffic density based on skill level
            base_density = 0.2 + (level * 0.05)
            skill_multiplier = {
                'beginner': 0.8,
                'intermediate': 1.0,
                'advanced': 1.3
            }[self.player_metrics['skill_level']]
            
            self.traffic_ai['current_density'] = base_density * skill_multiplier
            
            # Generate traffic with learned patterns
            traffic_lanes = []
            for lane_y in [7, 8, 9, 10, 11]:  # Road lanes
                # Check if player frequently uses this lane
                lane_preference = self.player_metrics['preferred_lanes'].get(lane_y, 0)
                
                # Increase difficulty for preferred lanes
                density_modifier = 1.0 + (lane_preference * 0.3)
                
                # Add surprise elements occasionally
                surprise_modifier = 1.0
                if np.random.random() < self.traffic_ai['surprise_factor']:
                    surprise_modifier = 1.5
                
                lane_config = {
                    'y': lane_y,
                    'density': self.traffic_ai['current_density'] * density_modifier * surprise_modifier,
                    'speed': (1.0 + level * 0.2) * self.traffic_ai['speed_multiplier'],
                    'direction': 1 if lane_y % 2 == 0 else -1,
                    'car_spacing': max(2, 5 - level),
                    'prediction_data': self._predict_lane_safety(lane_y, current_state)
                }
                traffic_lanes.append(lane_config)
            
            return {
                "status": "success",
                "traffic_lanes": traffic_lanes,
                "difficulty_adjustment": skill_multiplier
            }
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def generate_adaptive_river(self, current_state):
        """Generate adaptive river flow based on player performance"""
        try:
            level = current_state.get('level', 1)
            player_pos = current_state.get('player_position', {'x': 9, 'y': 14})
            
            # Adjust flow speed based on skill level
            skill_multiplier = {
                'beginner': 0.7,
                'intermediate': 1.0,
                'advanced': 1.4
            }[self.player_metrics['skill_level']]
            
            self.river_ai['current_flow_speed'] = (0.8 + level * 0.15) * skill_multiplier
            
            # Generate river lanes with adaptive difficulty
            river_lanes = []
            for lane_y in [1, 2, 3, 4, 5]:  # Water lanes
                # Vary log density based on player success in water
                water_success_rate = self._get_water_success_rate()
                density_modifier = 1.2 - water_success_rate  # More logs if player struggles
                
                lane_config = {
                    'y': lane_y,
                    'flow_speed': self.river_ai['current_flow_speed'],
                    'log_density': max(0.3, self.river_ai['log_density'] * density_modifier),
                    'direction': 1 if lane_y % 2 == 0 else -1,
                    'log_spacing': max(1.5, 4 - level * 0.3),
                    'turbulence': min(0.3, level * 0.05)  # Add slight randomness
                }
                river_lanes.append(lane_config)
            
            return {
                "status": "success",
                "river_lanes": river_lanes,
                "flow_adjustment": skill_multiplier
            }
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def get_predictive_assistance(self, current_state):
        """Provide AI-driven predictive assistance"""
        try:
            player_pos = current_state.get('player_position', {'x': 9, 'y': 14})
            cars = current_state.get('cars', [])
            logs = current_state.get('logs', [])
            
            # Calculate safe paths
            safe_paths = self._calculate_safe_paths(player_pos, cars, logs)
            
            # Predict future positions of obstacles
            predictions = self._predict_obstacle_positions(cars, logs)
            
            # Generate hints based on skill level
            hints = []
            if np.random.random() < self.assistance['hint_frequency']:
                hints = self._generate_contextual_hints(player_pos, safe_paths, predictions)
            
            # Calculate danger zones
            danger_zones = self._identify_danger_zones(player_pos, cars, logs, predictions)
            
            return {
                "status": "success",
                "safe_paths": safe_paths,
                "predictions": predictions,
                "hints": hints,
                "danger_zones": danger_zones,
                "glow_intensity": self.assistance['glow_intensity'],
                "skill_level": self.player_metrics['skill_level']
            }
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _learn_crossing_patterns(self, player_pos):
        """Learn player's preferred crossing patterns"""
        lane_y = player_pos['y']
        if lane_y in self.player_metrics['preferred_lanes']:
            self.player_metrics['preferred_lanes'][lane_y] += 1
        else:
            self.player_metrics['preferred_lanes'][lane_y] = 1
    
    def _predict_lane_safety(self, lane_y, current_state):
        """Predict safety of a lane for the next few seconds"""
        cars = current_state.get('cars', [])
        lane_cars = [car for car in cars if abs(car['y'] - lane_y) < 0.5]
        
        safety_timeline = []
        for t in range(10):  # Predict 10 time steps ahead
            safe_spots = []
            for x in range(20):  # Check each column
                is_safe = True
                for car in lane_cars:
                    future_x = car['x'] + car['direction'] * car['speed'] * t * 0.1
                    if abs(future_x - x) < car['width']:
                        is_safe = False
                        break
                if is_safe:
                    safe_spots.append(x)
            safety_timeline.append(safe_spots)
        
        return safety_timeline
    
    def _get_water_success_rate(self):
        """Calculate player's success rate in water sections"""
        if not self.player_metrics['crossing_patterns']:
            return 0.5
        
        water_attempts = 0
        water_successes = 0
        
        for pattern in self.player_metrics['crossing_patterns'][-10:]:  # Last 10 patterns
            for move in pattern:
                if 1 <= move.get('y', 0) <= 5:  # Water section
                    water_attempts += 1
                    if move.get('success', False):
                        water_successes += 1
        
        return water_successes / max(1, water_attempts)
    
    def _calculate_safe_paths(self, player_pos, cars, logs):
        """Calculate safe movement paths"""
        safe_moves = []
        
        # Check all possible moves
        for dx, dy in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
            new_x = player_pos['x'] + dx
            new_y = player_pos['y'] + dy
            
            if 0 <= new_x < 20 and 0 <= new_y < 15:
                safety_score = self._evaluate_position_safety(new_x, new_y, cars, logs)
                if safety_score > 0.5:
                    safe_moves.append({
                        'x': new_x,
                        'y': new_y,
                        'safety_score': safety_score,
                        'direction': {'dx': dx, 'dy': dy}
                    })
        
        return sorted(safe_moves, key=lambda x: x['safety_score'], reverse=True)
    
    def _predict_obstacle_positions(self, cars, logs):
        """Predict future positions of cars and logs"""
        predictions = {'cars': [], 'logs': []}
        
        # Predict car positions
        for car in cars:
            future_positions = []
            for t in range(self.assistance['prediction_depth']):
                future_x = car['x'] + car['direction'] * car['speed'] * t * 0.1
                future_positions.append({'x': future_x, 'y': car['y'], 'time': t})
            predictions['cars'].append({
                'current': car,
                'future': future_positions
            })
        
        # Predict log positions
        for log in logs:
            future_positions = []
            for t in range(self.assistance['prediction_depth']):
                future_x = log['x'] + log['direction'] * log['speed'] * t * 0.1
                future_positions.append({'x': future_x, 'y': log['y'], 'time': t})
            predictions['logs'].append({
                'current': log,
                'future': future_positions
            })
        
        return predictions
    
    def _generate_contextual_hints(self, player_pos, safe_paths, predictions):
        """Generate contextual hints based on current situation"""
        hints = []
        
        if not safe_paths:
            hints.append({
                'type': 'warning',
                'message': 'Wait for safer timing',
                'urgency': 'high'
            })
        elif len(safe_paths) == 1:
            move = safe_paths[0]['direction']
            direction = 'up' if move['dy'] < 0 else 'down' if move['dy'] > 0 else 'left' if move['dx'] < 0 else 'right'
            hints.append({
                'type': 'direction',
                'message': f'Move {direction}',
                'urgency': 'medium'
            })
        else:
            # Multiple safe options, suggest the best one
            best_move = safe_paths[0]['direction']
            direction = 'up' if best_move['dy'] < 0 else 'down' if best_move['dy'] > 0 else 'left' if best_move['dx'] < 0 else 'right'
            hints.append({
                'type': 'suggestion',
                'message': f'Best move: {direction}',
                'urgency': 'low'
            })
        
        return hints
    
    def _identify_danger_zones(self, player_pos, cars, logs, predictions):
        """Identify dangerous areas to avoid"""
        danger_zones = []
        
        # Check immediate car threats
        for car_pred in predictions['cars']:
            for future_pos in car_pred['future'][:2]:  # Next 2 time steps
                if abs(future_pos['y'] - player_pos['y']) < 1:
                    danger_zones.append({
                        'x': future_pos['x'],
                        'y': future_pos['y'],
                        'type': 'car',
                        'severity': 'high'
                    })
        
        # Check water without logs
        if 1 <= player_pos['y'] <= 5:
            player_on_log = False
            for log_pred in predictions['logs']:
                log = log_pred['current']
                if (abs(log['y'] - player_pos['y']) < 0.5 and 
                    log['x'] <= player_pos['x'] < log['x'] + log['width']):
                    player_on_log = True
                    break
            
            if not player_on_log:
                danger_zones.append({
                    'x': player_pos['x'],
                    'y': player_pos['y'],
                    'type': 'water',
                    'severity': 'critical'
                })
        
        return danger_zones
    
    def _evaluate_position_safety(self, x, y, cars, logs):
        """Evaluate safety score of a position"""
        safety_score = 1.0
        
        # Check car collisions
        for car in cars:
            if (abs(car['y'] - y) < 0.5 and 
                car['x'] <= x < car['x'] + car['width']):
                safety_score = 0.0
                break
        
        # Check water safety
        if 1 <= y <= 5:  # Water area
            on_log = False
            for log in logs:
                if (abs(log['y'] - y) < 0.5 and 
                    log['x'] <= x < log['x'] + log['width']):
                    on_log = True
                    break
            if not on_log:
                safety_score = 0.0
        
        return safety_score

# Global AI instance
frogger_ai = FroggerAI()

@app.route('/api/analyze_performance', methods=['POST'])
def analyze_performance():
    data = request.json
    result = frogger_ai.analyze_player_performance(data)
    return jsonify(result)

@app.route('/api/adaptive_traffic', methods=['POST'])
def adaptive_traffic():
    data = request.json
    result = frogger_ai.generate_adaptive_traffic(data)
    return jsonify(result)

@app.route('/api/adaptive_river', methods=['POST'])
def adaptive_river():
    data = request.json
    result = frogger_ai.generate_adaptive_river(data)
    return jsonify(result)

@app.route('/api/predictive_assistance', methods=['POST'])
def predictive_assistance():
    data = request.json
    result = frogger_ai.get_predictive_assistance(data)
    return jsonify(result)

@app.route('/api/player_stats', methods=['GET'])
def get_player_stats():
    return jsonify({
        'skill_level': frogger_ai.player_metrics['skill_level'],
        'total_games': frogger_ai.player_metrics['total_games'],
        'average_reaction_time': np.mean(frogger_ai.player_metrics['reaction_times']) if frogger_ai.player_metrics['reaction_times'] else 0,
        'success_rate': np.mean(frogger_ai.player_metrics['success_rate']) if frogger_ai.player_metrics['success_rate'] else 0
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)