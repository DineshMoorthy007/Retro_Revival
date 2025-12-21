class AIFrogger {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        
        // Game settings
        this.gridSize = 40;
        this.rows = 15;
        this.cols = 20;
        
        // Player
        this.frog = {
            x: 9,
            y: 14,
            size: 30,
            color: '#00ff00',
            isLeaping: false,
            leapStartTime: 0,
            leapDuration: 300,
            rotation: 0
        };
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.moveStartTime = 0;
        
        // Enhanced traffic system
        this.cars = [];
        this.carLanes = [];
        
        // Enhanced river system
        this.logs = [];
        this.logLanes = [];
        
        // AI system with backend integration
        this.ai = {
            enabled: false,
            analyzing: false,
            suggestions: [],
            pathfinding: null,
            difficulty: 'normal',
            backendConnected: false,
            safePaths: [],
            dangerZones: [],
            predictions: {},
            hints: []
        };
        
        // Performance tracking
        this.performance = {
            gameStartTime: 0,
            moveTimes: [],
            crossingPatterns: [],
            currentPath: []
        };
        
        this.setupEventListeners();
        this.connectToBackend();
        this.initializeGame();
        this.gameLoop();
    }
    
    async manualReconnect() {
        document.getElementById('aiStatus').textContent = 'Reconnecting...';
        document.getElementById('aiStatus').style.color = '#ffff00';
        document.getElementById('reconnectBtn').classList.add('hidden');
        
        await this.connectToBackend();
        
        if (this.ai.backendConnected) {
            // Test the connection with a simple request
            try {
                await this.updateAIAssistance();
                console.log('✓ AI Backend reconnected and tested successfully');
            } catch (error) {
                console.log('✗ Reconnection test failed');
            }
        } else {
            // Show reconnect button if connection failed
            document.getElementById('reconnectBtn').classList.remove('hidden');
        }
    }
    
    async connectToBackend() {
        console.log('Attempting to connect to AI backend...');
        
        try {
            // Try the health check endpoint first
            const response = await fetch('http://localhost:5000/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                this.ai.backendConnected = true;
                document.getElementById('aiStatus').textContent = 'AI Connected ✓';
                document.getElementById('aiStatus').style.color = '#00ff00';
                console.log('✓ AI Backend connected successfully:', data.message);
                
                // Try to get initial player stats
                try {
                    const statsResponse = await fetch('http://localhost:5000/api/player_stats');
                    if (statsResponse.ok) {
                        const stats = await statsResponse.json();
                        console.log('✓ Player stats loaded:', stats);
                    }
                } catch (error) {
                    console.log('Player stats not yet available');
                }
            } else {
                throw new Error('Backend responded with error');
            }
        } catch (error) {
            console.log('✗ AI Backend not available:', error.message);
            console.log('Running in Local AI Mode');
            document.getElementById('aiStatus').textContent = 'Local AI Mode';
            document.getElementById('aiStatus').style.color = '#ffff00';
            document.getElementById('reconnectBtn').classList.remove('hidden');
            this.ai.backendConnected = false;
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            const moveTime = Date.now();
            if (this.moveStartTime > 0) {
                const reactionTime = (moveTime - this.moveStartTime) / 1000;
                this.performance.moveTimes.push(reactionTime);
            }
            this.moveStartTime = moveTime;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.moveFrog(0, -1);
                    break;
                case 'ArrowDown':
                    this.moveFrog(0, 1);
                    break;
                case 'ArrowLeft':
                    this.moveFrog(-1, 0);
                    break;
                case 'ArrowRight':
                    this.moveFrog(1, 0);
                    break;
                case ' ':
                    this.frogJump();
                    break;
            }
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('aiHintBtn').addEventListener('click', () => this.getAIHint());
        document.getElementById('aiAutoBtn').addEventListener('click', () => this.toggleAIAutoPlay());
        document.getElementById('reconnectBtn').addEventListener('click', () => this.manualReconnect());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('viewStatsBtn').addEventListener('click', () => this.showPlayerStats());
    }
    
    async initializeGame() {
        await this.generateAdaptiveTraffic();
        await this.generateAdaptiveRiver();
        this.updateUI();
        this.performance.gameStartTime = Date.now();
    }
    
    async generateAdaptiveTraffic() {
        if (this.ai.backendConnected) {
            try {
                console.log('Requesting adaptive traffic from AI backend...');
                const response = await fetch('http://localhost:5000/api/adaptive_traffic', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        player_position: { x: this.frog.x, y: this.frog.y },
                        level: this.level,
                        cars: this.cars.map(car => ({
                            x: car.x, y: car.y, width: car.width, 
                            direction: car.direction, speed: car.speed
                        }))
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success' && data.traffic_lanes) {
                        this.carLanes = data.traffic_lanes;
                        console.log('✓ Adaptive traffic generated successfully');
                        return;
                    }
                }
                throw new Error('Invalid response from backend');
            } catch (error) {
                console.log('✗ Adaptive traffic failed:', error.message);
                console.log('Using fallback traffic generation');
                this.ai.backendConnected = false; // Mark as disconnected
                document.getElementById('aiStatus').textContent = 'Connection Lost';
                document.getElementById('aiStatus').style.color = '#ff8800';
            }
        }
        
        // Fallback to local generation
        this.generateFallbackTraffic();
        this.generateCarsFromLanes();
    }
    
    generateFallbackTraffic() {
        // Scale difficulty with level
        const baseDensity = 0.2 + (this.level * 0.05);
        const baseSpeed = 1.5 + (this.level * 0.3);
        
        this.carLanes = [
            { y: 11, direction: 1, speed: baseSpeed * 1.3, color: '#ff0000', density: baseDensity * 1.2, car_spacing: Math.max(2, 4 - this.level * 0.2) },
            { y: 10, direction: -1, speed: baseSpeed, color: '#ffff00', density: baseDensity, car_spacing: Math.max(2, 4 - this.level * 0.2) },
            { y: 9, direction: 1, speed: baseSpeed * 1.6, color: '#ff00ff', density: baseDensity * 1.4, car_spacing: Math.max(2, 3 - this.level * 0.15) },
            { y: 8, direction: -1, speed: baseSpeed * 1.2, color: '#00ffff', density: baseDensity * 1.1, car_spacing: Math.max(2, 3 - this.level * 0.15) },
            { y: 7, direction: 1, speed: baseSpeed * 1.4, color: '#ff8800', density: baseDensity * 1.15, car_spacing: Math.max(2, 4 - this.level * 0.2) }
        ];
    }
    
    generateCarsFromLanes() {
        this.cars = [];
        this.carLanes.forEach(lane => {
            const numCars = Math.floor(lane.density * 10);
            for (let i = 0; i < numCars; i++) {
                this.cars.push({
                    x: (i * lane.car_spacing) + Math.random() * 2,
                    y: lane.y,
                    width: 1.5 + Math.random() * 0.5,
                    height: 0.8,
                    direction: lane.direction,
                    speed: lane.speed * this.gameSpeed * (0.8 + Math.random() * 0.4),
                    color: lane.color,
                    type: Math.random() > 0.7 ? 'truck' : 'car'
                });
            }
        });
    }
    
    async generateAdaptiveRiver() {
        if (this.ai.backendConnected) {
            try {
                console.log('Requesting adaptive river from AI backend...');
                const response = await fetch('http://localhost:5000/api/adaptive_river', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        player_position: { x: this.frog.x, y: this.frog.y },
                        level: this.level,
                        logs: this.logs.map(log => ({
                            x: log.x, y: log.y, width: log.width,
                            direction: log.direction, speed: log.speed
                        }))
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success' && data.river_lanes) {
                        this.logLanes = data.river_lanes;
                        console.log('✓ Adaptive river generated successfully');
                        return;
                    }
                }
                throw new Error('Invalid response from backend');
            } catch (error) {
                console.log('✗ Adaptive river failed:', error.message);
                console.log('Using fallback river generation');
            }
        }
        
        // Fallback to local generation
        this.generateFallbackRiver();
        this.generateLogsFromLanes();
    }
    
    generateFallbackRiver() {
        // Scale river difficulty with level
        const baseFlowSpeed = 0.8 + (this.level * 0.2);
        const baseDensity = Math.max(0.25, 0.5 - (this.level * 0.03)); // Fewer logs at higher levels
        
        this.logLanes = [
            { y: 5, direction: 1, flow_speed: baseFlowSpeed, log_density: baseDensity, log_spacing: Math.max(1.5, 2.5 - this.level * 0.1) },
            { y: 4, direction: -1, flow_speed: baseFlowSpeed * 1.5, log_density: baseDensity * 0.9, log_spacing: Math.max(1.5, 2.8 - this.level * 0.1) },
            { y: 3, direction: 1, flow_speed: baseFlowSpeed * 0.8, log_density: baseDensity * 1.1, log_spacing: Math.max(1.5, 2.2 - this.level * 0.1) },
            { y: 2, direction: -1, flow_speed: baseFlowSpeed * 1.2, log_density: baseDensity, log_spacing: Math.max(1.5, 2.5 - this.level * 0.1) },
            { y: 1, direction: 1, flow_speed: baseFlowSpeed * 1.3, log_density: baseDensity * 0.95, log_spacing: Math.max(1.5, 2.6 - this.level * 0.1) }
        ];
    }
    
    generateLogsFromLanes() {
        this.logs = [];
        this.logLanes.forEach(lane => {
            const numLogs = Math.floor(lane.log_density * 8);
            for (let i = 0; i < numLogs; i++) {
                this.logs.push({
                    x: (i * lane.log_spacing * 2) + Math.random() * 3,
                    y: lane.y,
                    width: 2.5 + Math.random() * 1.5,
                    height: 0.8,
                    direction: lane.direction,
                    speed: lane.flow_speed * this.gameSpeed,
                    color: '#8B4513',
                    type: Math.random() > 0.5 ? 'log' : 'turtle'
                });
            }
        });
    }
    
    moveFrog(dx, dy) {
        const newX = Math.max(0, Math.min(this.cols - 1, this.frog.x + dx));
        const newY = Math.max(0, Math.min(this.rows - 1, this.frog.y + dy));
        
        // Check if move is valid
        if (this.isValidMove(newX, newY)) {
            // Start leap animation
            this.frog.isLeaping = true;
            this.frog.leapStartTime = Date.now();
            
            // Set rotation based on direction
            if (dx > 0) this.frog.rotation = Math.PI / 2;
            else if (dx < 0) this.frog.rotation = -Math.PI / 2;
            else if (dy < 0) this.frog.rotation = 0;
            else if (dy > 0) this.frog.rotation = Math.PI;
            
            this.frog.x = newX;
            this.frog.y = newY;
            
            // Track movement for AI learning
            this.performance.currentPath.push({
                x: newX, y: newY, 
                timestamp: Date.now(),
                success: true
            });
            
            // Score for moving forward
            if (dy < 0) {
                this.score += 10;
            }
            
            this.checkWinCondition();
            this.updateAIAssistance();
        }
    }
    
    frogJump() {
        // Special jump ability - can jump over one obstacle
        const jumpY = Math.max(0, this.frog.y - 2);
        if (this.isValidMove(this.frog.x, jumpY)) {
            this.frog.isLeaping = true;
            this.frog.leapStartTime = Date.now();
            this.frog.y = jumpY;
            this.score += 20;
            this.checkWinCondition();
        }
    }
    
    isValidMove(x, y) {
        // Check boundaries
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
        
        // Safe zones (grass)
        if (y === 0 || y === 6 || y === 12 || y === 14) return true;
        
        // Water - must be on log
        if (y >= 1 && y <= 5) {
            return this.isOnLog(x, y);
        }
        
        // Road - check for cars
        if (y >= 7 && y <= 11) {
            return !this.isHitByCar(x, y);
        }
        
        return true;
    }
    
    isOnLog(x, y) {
        return this.logs.some(log => 
            Math.abs(log.y - y) < 0.5 &&
            x >= log.x && x < log.x + log.width
        );
    }
    
    isHitByCar(x, y) {
        return this.cars.some(car => 
            Math.abs(car.y - y) < 0.5 &&
            x >= car.x && x < car.x + car.width
        );
    }
    
    updateGame() {
        if (this.gameState !== 'playing') return;
        
        // Update frog leap animation
        if (this.frog.isLeaping) {
            const elapsed = Date.now() - this.frog.leapStartTime;
            if (elapsed >= this.frog.leapDuration) {
                this.frog.isLeaping = false;
            }
        }
        
        // Update cars with enhanced movement
        this.cars.forEach(car => {
            car.x += car.direction * car.speed * 0.1;
            
            // Wrap around screen
            if (car.direction > 0 && car.x > this.cols + 2) {
                car.x = -car.width;
            } else if (car.direction < 0 && car.x < -car.width - 2) {
                car.x = this.cols;
            }
        });
        
        // Update logs with enhanced movement
        this.logs.forEach(log => {
            log.x += log.direction * log.speed * 0.1;
            
            // Add slight turbulence for realism
            if (Math.random() < 0.02) {
                log.speed *= (0.95 + Math.random() * 0.1);
            }
            
            // Wrap around screen
            if (log.direction > 0 && log.x > this.cols + 2) {
                log.x = -log.width;
            } else if (log.direction < 0 && log.x < -log.width - 2) {
                log.x = this.cols;
            }
        });
        
        // Move frog with log if on water
        if (this.frog.y >= 1 && this.frog.y <= 5) {
            const currentLog = this.logs.find(log => 
                Math.abs(log.y - this.frog.y) < 0.5 &&
                this.frog.x >= log.x && this.frog.x < log.x + log.width
            );
            
            if (currentLog) {
                this.frog.x += currentLog.direction * currentLog.speed * 0.1;
                
                // Check if frog moved off screen
                if (this.frog.x < 0 || this.frog.x >= this.cols) {
                    this.loseLife();
                }
            } else {
                // Frog in water without log
                this.loseLife();
            }
        }
        
        // Check collisions
        this.checkCollisions();
        
        // AI updates
        if (this.ai.enabled) {
            this.updateAI();
        }
        
        // Update AI assistance periodically
        if (Date.now() % 1000 < 50) { // Every second approximately
            this.updateAIAssistance();
        }
    }
    
    async updateAIAssistance() {
        if (!this.ai.backendConnected) {
            this.calculateLocalAssistance();
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/predictive_assistance', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    player_position: { x: this.frog.x, y: this.frog.y },
                    cars: this.cars.map(car => ({
                        x: car.x, y: car.y, width: car.width,
                        direction: car.direction, speed: car.speed
                    })),
                    logs: this.logs.map(log => ({
                        x: log.x, y: log.y, width: log.width,
                        direction: log.direction, speed: log.speed
                    })),
                    level: this.level
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    this.ai.safePaths = data.safe_paths || [];
                    this.ai.dangerZones = data.danger_zones || [];
                    this.ai.predictions = data.predictions || {};
                    this.ai.hints = data.hints || [];
                    return;
                }
            }
            throw new Error('Invalid assistance response');
        } catch (error) {
            console.log('AI assistance failed, using local fallback:', error.message);
            this.calculateLocalAssistance();
        }
    }
    
    calculateLocalAssistance() {
        // Simple local AI assistance
        this.ai.safePaths = [];
        this.ai.dangerZones = [];
        
        // Check immediate surroundings
        const moves = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];
        
        moves.forEach(move => {
            const newX = this.frog.x + move.dx;
            const newY = this.frog.y + move.dy;
            
            if (this.isValidMove(newX, newY)) {
                this.ai.safePaths.push({
                    x: newX, y: newY,
                    safety_score: 0.8,
                    direction: move
                });
            }
        });
    }
    
    checkCollisions() {
        // Check car collisions
        if (this.frog.y >= 7 && this.frog.y <= 11) {
            if (this.isHitByCar(this.frog.x, this.frog.y)) {
                this.loseLife();
            }
        }
    }
    
    loseLife() {
        this.lives--;
        this.frog.x = 9;
        this.frog.y = 14;
        this.frog.rotation = 0;
        
        // Track failed attempt
        this.performance.currentPath.push({
            x: this.frog.x, y: this.frog.y,
            timestamp: Date.now(),
            success: false
        });
        
        if (this.lives <= 0) {
            this.gameOver();
        }
        
        this.updateUI();
    }
    
    checkWinCondition() {
        if (this.frog.y === 0) {
            this.score += 100 * this.level;
            this.level++;
            this.gameSpeed += 0.2;
            
            // Save crossing pattern
            this.performance.crossingPatterns.push([...this.performance.currentPath]);
            this.performance.currentPath = [];
            
            // Reset frog position
            this.frog.x = 9;
            this.frog.y = 14;
            this.frog.rotation = 0;
            
            // Regenerate obstacles with increased difficulty - make it synchronous
            this.regenerateLevel();
            
            this.updateUI();
            this.sendPerformanceData();
        }
    }
    
    regenerateLevel() {
        // Synchronously regenerate traffic and river for smoother level transitions
        this.generateFallbackTraffic();
        this.generateCarsFromLanes();
        this.generateFallbackRiver();
        this.generateLogsFromLanes();
        
        // Then try to get AI-enhanced patterns in the background
        if (this.ai.backendConnected) {
            this.generateAdaptiveTraffic();
            this.generateAdaptiveRiver();
        }
    }
    
    async sendPerformanceData() {
        if (!this.ai.backendConnected) return;
        
        try {
            const avgReactionTime = this.performance.moveTimes.length > 0 
                ? this.performance.moveTimes.reduce((a, b) => a + b) / this.performance.moveTimes.length 
                : 0;
            
            await fetch('http://localhost:5000/api/analyze_performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    move_time: avgReactionTime,
                    level_completed: true,
                    player_path: this.performance.currentPath,
                    score: this.score,
                    level: this.level
                })
            });
        } catch (error) {
            console.log('Could not send performance data');
        }
    }
    
    // AI System
    async getAIHint() {
        if (this.ai.analyzing) return;
        
        this.ai.analyzing = true;
        document.getElementById('aiStatus').textContent = 'Analyzing...';
        
        if (this.ai.backendConnected) {
            await this.updateAIAssistance();
            
            if (this.ai.hints.length > 0) {
                const hint = this.ai.hints[0];
                this.displayAIHint(hint);
            } else {
                this.displayAIHint({ message: 'No specific hints available', type: 'info' });
            }
        } else {
            // Local hint calculation
            const hint = this.calculateBestMove();
            this.displayAIHint(hint);
        }
        
        this.ai.analyzing = false;
        setTimeout(() => {
            document.getElementById('aiStatus').textContent = this.ai.backendConnected ? 'AI Connected' : 'Local AI Mode';
        }, 2000);
    }
    
    calculateBestMove() {
        const frog = this.frog;
        const moves = [
            { dx: 0, dy: -1, name: 'UP', priority: 3 },
            { dx: -1, dy: 0, name: 'LEFT', priority: 1 },
            { dx: 1, dy: 0, name: 'RIGHT', priority: 1 },
            { dx: 0, dy: 1, name: 'DOWN', priority: 0 }
        ];
        
        // Analyze each possible move
        const validMoves = moves.filter(move => {
            const newX = frog.x + move.dx;
            const newY = frog.y + move.dy;
            return this.isValidMove(newX, newY);
        });
        
        if (validMoves.length === 0) {
            return { message: 'No safe moves available. Wait for better timing.', type: 'warning' };
        }
        
        // Prioritize forward movement
        const forwardMove = validMoves.find(move => move.dy < 0);
        if (forwardMove) {
            return { message: `Move ${forwardMove.name} to progress!`, type: 'direction' };
        }
        
        // Find safest side move
        const sideMoves = validMoves.filter(move => move.dx !== 0);
        if (sideMoves.length > 0) {
            const bestSide = sideMoves[0];
            return { message: `Move ${bestSide.name} to find better position.`, type: 'suggestion' };
        }
        
        return { message: 'Stay put and wait for opportunity.', type: 'info' };
    }
    
    displayAIHint(hint) {
        const aiHint = document.getElementById('aiHint');
        aiHint.innerHTML = `<strong>${hint.type?.toUpperCase() || 'HINT'}:</strong> ${hint.message}`;
        aiHint.style.color = hint.type === 'warning' ? '#ff0000' : 
                           hint.type === 'direction' ? '#00ff00' : '#00ffff';
        
        setTimeout(() => {
            aiHint.innerHTML = '';
        }, 4000);
    }
    
    toggleAIAutoPlay() {
        this.ai.enabled = !this.ai.enabled;
        const btn = document.getElementById('aiAutoBtn');
        
        if (this.ai.enabled) {
            btn.textContent = 'Stop AI';
            document.getElementById('aiStatus').textContent = 'AI Playing...';
        } else {
            btn.textContent = 'AI Auto-Play';
            document.getElementById('aiStatus').textContent = this.ai.backendConnected ? 'AI Connected' : 'Local AI Mode';
        }
    }
    
    updateAI() {
        // AI makes moves automatically
        if (Math.random() < 0.2) { // AI moves less frequently for better gameplay
            if (this.ai.safePaths.length > 0) {
                const bestPath = this.ai.safePaths[0];
                const dx = bestPath.x - this.frog.x;
                const dy = bestPath.y - this.frog.y;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.moveFrog(Math.sign(dx), 0);
                } else {
                    this.moveFrog(0, Math.sign(dy));
                }
            } else {
                // Fallback to local AI
                const hint = this.calculateBestMove();
                if (hint.type === 'direction') {
                    const direction = hint.message.split(' ')[1];
                    switch(direction) {
                        case 'UP': this.moveFrog(0, -1); break;
                        case 'DOWN': this.moveFrog(0, 1); break;
                        case 'LEFT': this.moveFrog(-1, 0); break;
                        case 'RIGHT': this.moveFrog(1, 0); break;
                    }
                }
            }
        }
    }
    
    // Game state management
    startGame() {
        if (this.gameState === 'menu' || this.gameState === 'gameOver') {
            this.gameState = 'playing';
            document.getElementById('startBtn').textContent = 'Playing...';
            this.moveStartTime = Date.now();
            this.performance.gameStartTime = Date.now();
            console.log('Game started successfully');
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').textContent = 'Resume';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseBtn').textContent = 'Pause';
        }
    }
    
    resetGame() {
        // Stop any ongoing AI operations
        this.ai.enabled = false;
        this.ai.analyzing = false;
        
        // Reset all game state
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.moveStartTime = 0;
        
        // Reset frog state
        this.frog.x = 9;
        this.frog.y = 14;
        this.frog.rotation = 0;
        this.frog.isLeaping = false;
        
        // Reset performance tracking
        this.performance = {
            gameStartTime: Date.now(),
            moveTimes: [],
            crossingPatterns: [],
            currentPath: []
        };
        
        // Clear AI assistance
        this.ai.safePaths = [];
        this.ai.dangerZones = [];
        this.ai.predictions = {};
        this.ai.hints = [];
        
        // Hide game over screen
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Reset UI elements
        document.getElementById('startBtn').textContent = 'Start Game';
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('aiAutoBtn').textContent = 'AI Auto-Play';
        document.getElementById('aiStatus').textContent = this.ai.backendConnected ? 'AI Connected' : 'Local AI Mode';
        document.getElementById('aiHint').innerHTML = '';
        
        // Reinitialize game objects
        this.initializeGame();
        
        console.log('Game reset complete - ready to start new game');
    }
    
    async gameOver() {
        this.gameState = 'gameOver';
        
        // Send final performance data
        await this.sendPerformanceData();
        
        // Get player stats
        let playerStats = { skill_level: 'Beginner', success_rate: 0 };
        if (this.ai.backendConnected) {
            try {
                const response = await fetch('http://localhost:5000/api/player_stats');
                if (response.ok) {
                    playerStats = await response.json();
                }
            } catch (error) {
                console.log('Could not fetch player stats');
            }
        }
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('skillLevel').textContent = playerStats.skill_level || 'Beginner';
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    async showPlayerStats() {

        // Calculate local statistics
        const avgReactionTime = this.performance.moveTimes.length > 0 
            ? (this.performance.moveTimes.reduce((a, b) => a + b) / this.performance.moveTimes.length).toFixed(2)
            : 'N/A';
        
        const totalMoves = this.performance.moveTimes.length;
        const successfulCrossings = this.performance.crossingPatterns.length;
        const currentScore = this.score;
        const currentLevel = this.level;
        const livesRemaining = this.lives;
        
        // Try to get backend stats if available
        if (this.ai.backendConnected) {
            try {
                const response = await fetch('http://localhost:5000/api/player_stats');
                if (response.ok) {
                    const stats = await response.json();
                    alert(`🐸 PLAYER STATISTICS 🐸\n\n` +
                          `═══════════════════════\n` +
                          `Current Session:\n` +
                          `  Score: ${currentScore}\n` +
                          `  Level: ${currentLevel}\n` +
                          `  Lives: ${livesRemaining}\n` +
                          `  Total Moves: ${totalMoves}\n` +
                          `  Successful Crossings: ${successfulCrossings}\n` +
                          `  Avg Reaction Time: ${avgReactionTime}s\n\n` +
                          `Overall Performance:\n` +
                          `  Skill Level: ${stats.skill_level}\n` +
                          `  Total Games: ${stats.total_games}\n` +
                          `  Overall Avg Reaction: ${stats.average_reaction_time.toFixed(2)}s`);
                    return;
                }
            } catch (error) {
                console.log('Backend stats not available, showing local stats');
            }
        }
        
        // Show local statistics only
        alert(`🐸 PLAYER STATISTICS 🐸\n\n` +
              `═══════════════════════\n` +
              `Current Session:\n` +
              `  Score: ${currentScore}\n` +
              `  Level: ${currentLevel}\n` +
              `  Lives: ${livesRemaining}\n` +
              `  Total Moves: ${totalMoves}\n` +
              `  Successful Crossings: ${successfulCrossings}\n` +
              `  Avg Reaction Time: ${avgReactionTime}s\n\n` +
              `💡 Tip: Start the AI backend for\n` +
              `   advanced analytics and tracking!`);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    // Enhanced Rendering
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background zones
        this.drawBackground();
        
        // Draw AI assistance overlays
        this.drawAIAssistance();
        
        // Draw game objects
        this.drawCars();
        this.drawLogs();
        this.drawFrog();
        
        // Draw predictions
        this.drawPredictions();
    }
    
    drawBackground() {
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        
        // Draw zones with enhanced graphics
        for (let row = 0; row < this.rows; row++) {
            let color, pattern;
            if (row === 0) {
                color = '#006600'; // Goal zone (brighter green)
                pattern = 'goal';
            } else if (row === 14) {
                color = '#004400'; // Start zone (dark green)
                pattern = 'grass';
            } else if (row >= 1 && row <= 5) {
                color = '#000066'; // Water (dark blue)
                pattern = 'water';
            } else if (row === 6 || row === 12) {
                color = '#004400'; // Safe zones
                pattern = 'grass';
            } else {
                color = '#333333'; // Road (dark gray)
                pattern = 'road';
            }
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, row * cellHeight, this.canvas.width, cellHeight);
            
            // Add patterns
            this.drawZonePattern(0, row * cellHeight, this.canvas.width, cellHeight, pattern);
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = '#444444';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * cellHeight);
            this.ctx.lineTo(this.canvas.width, i * cellHeight);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cellWidth, 0);
            this.ctx.lineTo(i * cellWidth, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    drawZonePattern(x, y, width, height, pattern) {
        this.ctx.save();
        
        switch(pattern) {
            case 'water':
                // Draw water ripples
                this.ctx.strokeStyle = '#0000aa';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < width; i += 20) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + i, y + height * 0.3);
                    this.ctx.quadraticCurveTo(x + i + 10, y + height * 0.2, x + i + 20, y + height * 0.3);
                    this.ctx.stroke();
                }
                break;
                
            case 'grass':
                // Draw grass texture
                this.ctx.strokeStyle = '#006600';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < width; i += 5) {
                    for (let j = 0; j < height; j += 8) {
                        if (Math.random() > 0.7) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(x + i, y + j + height);
                            this.ctx.lineTo(x + i, y + j + height - 3);
                            this.ctx.stroke();
                        }
                    }
                }
                break;
                
            case 'road':
                // Draw road markings
                this.ctx.strokeStyle = '#ffff00';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([10, 10]);
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + height / 2);
                this.ctx.lineTo(x + width, y + height / 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                break;
                
            case 'goal':
                // Draw goal pattern
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('GOAL', x + width / 2, y + height / 2 + 4);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawAIAssistance() {
        if (!this.ai.safePaths.length && !this.ai.dangerZones.length) return;
        
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        
        // Draw safe paths
        this.ai.safePaths.forEach(path => {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            
            const x = path.x * cellWidth;
            const y = path.y * cellHeight;
            
            this.ctx.fillRect(x, y, cellWidth, cellHeight);
            this.ctx.strokeRect(x, y, cellWidth, cellHeight);
            this.ctx.restore();
        });
        
        // Draw danger zones
        this.ai.dangerZones.forEach(zone => {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            
            const x = zone.x * cellWidth;
            const y = zone.y * cellHeight;
            
            this.ctx.fillRect(x, y, cellWidth, cellHeight);
            this.ctx.strokeRect(x, y, cellWidth, cellHeight);
            this.ctx.restore();
        });
    }
    
    drawCars() {
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        
        this.cars.forEach(car => {
            this.ctx.save();
            
            const x = car.x * cellWidth;
            const y = car.y * cellHeight + (cellHeight - car.height * cellHeight) / 2;
            const width = car.width * cellWidth;
            const height = car.height * cellHeight;
            
            // Car body
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(x, y, width, height);
            
            // Car details based on type
            if (car.type === 'truck') {
                // Truck cab
                this.ctx.fillStyle = this.darkenColor(car.color);
                this.ctx.fillRect(x + width * 0.7, y - 2, width * 0.3, height + 4);
            }
            
            // Windows
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(x + width * 0.1, y + 2, width * 0.8, height * 0.3);
            
            // Wheels
            this.ctx.fillStyle = '#000000';
            const wheelSize = 4;
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.2, y + height, wheelSize, 0, Math.PI * 2);
            this.ctx.arc(x + width * 0.8, y + height, wheelSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Headlights
            this.ctx.fillStyle = '#ffffff';
            if (car.direction > 0) {
                this.ctx.fillRect(x + width - 3, y + height * 0.2, 3, height * 0.6);
            } else {
                this.ctx.fillRect(x, y + height * 0.2, 3, height * 0.6);
            }
            
            this.ctx.restore();
        });
    }
    
    drawLogs() {
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        
        this.logs.forEach(log => {
            this.ctx.save();
            
            const x = log.x * cellWidth;
            const y = log.y * cellHeight + (cellHeight - log.height * cellHeight) / 2;
            const width = log.width * cellWidth;
            const height = log.height * cellHeight;
            
            if (log.type === 'turtle') {
                // Draw turtle
                this.ctx.fillStyle = '#228B22';
                
                // Turtle shell (oval)
                this.ctx.beginPath();
                this.ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Shell pattern
                this.ctx.strokeStyle = '#006400';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x + width * 0.3, y);
                this.ctx.lineTo(x + width * 0.7, y + height);
                this.ctx.moveTo(x + width * 0.7, y);
                this.ctx.lineTo(x + width * 0.3, y + height);
                this.ctx.stroke();
                
                // Head
                this.ctx.fillStyle = '#32CD32';
                this.ctx.beginPath();
                this.ctx.arc(x + (log.direction > 0 ? width + 5 : -5), y + height/2, 6, 0, Math.PI * 2);
                this.ctx.fill();
                
            } else {
                // Draw log
                this.ctx.fillStyle = log.color;
                this.ctx.fillRect(x, y, width, height);
                
                // Log texture (rings)
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < width; i += 15) {
                    this.ctx.beginPath();
                    this.ctx.arc(x + i, y + height/2, height/2, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // Log ends
                this.ctx.fillStyle = '#8B4513';
                this.ctx.beginPath();
                this.ctx.arc(x, y + height/2, height/2, 0, Math.PI * 2);
                this.ctx.arc(x + width, y + height/2, height/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    drawFrog() {
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        
        const x = this.frog.x * cellWidth + cellWidth / 2;
        const y = this.frog.y * cellHeight + cellHeight / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.frog.rotation);
        
        // Leap animation
        let scale = 1;
        let offsetY = 0;
        if (this.frog.isLeaping) {
            const elapsed = Date.now() - this.frog.leapStartTime;
            const progress = elapsed / this.frog.leapDuration;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            scale = 1 + Math.sin(progress * Math.PI) * 0.3;
            offsetY = -Math.sin(progress * Math.PI) * 15;
        }
        
        this.ctx.scale(scale, scale);
        this.ctx.translate(0, offsetY);
        
        // Frog body (oval)
        this.ctx.fillStyle = this.frog.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Frog belly (lighter green)
        this.ctx.fillStyle = '#66ff66';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 3, 12, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Frog spots
        this.ctx.fillStyle = '#008800';
        this.ctx.beginPath();
        this.ctx.arc(-8, -5, 3, 0, Math.PI * 2);
        this.ctx.arc(8, -5, 3, 0, Math.PI * 2);
        this.ctx.arc(0, 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Frog eyes
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-8, -12, 6, 0, Math.PI * 2);
        this.ctx.arc(8, -12, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye pupils
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(-8, -12, 3, 0, Math.PI * 2);
        this.ctx.arc(8, -12, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye shine
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-9, -13, 1, 0, Math.PI * 2);
        this.ctx.arc(7, -13, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Frog legs (back legs visible)
        this.ctx.fillStyle = this.frog.color;
        this.ctx.beginPath();
        this.ctx.ellipse(-15, 8, 8, 5, Math.PI / 6, 0, Math.PI * 2);
        this.ctx.ellipse(15, 8, 8, 5, -Math.PI / 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add nostrils
        this.ctx.fillStyle = '#004400';
        this.ctx.beginPath();
        this.ctx.arc(-3, -3, 1, 0, Math.PI * 2);
        this.ctx.arc(3, -3, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPredictions() {
        if (!this.ai.predictions.cars && !this.ai.predictions.logs) return;
        
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 3]);
        
        // Draw car prediction trails
        if (this.ai.predictions.cars) {
            this.ai.predictions.cars.forEach(carPred => {
                const car = carPred.current;
                const future = carPred.future;
                
                if (future && future.length > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(car.x * cellWidth, car.y * cellHeight + cellHeight/2);
                    
                    future.forEach(pos => {
                        this.ctx.lineTo(pos.x * cellWidth, pos.y * cellHeight + cellHeight/2);
                    });
                    
                    this.ctx.stroke();
                }
            });
        }
        
        this.ctx.restore();
    }
    
    darkenColor(color) {
        // Simple color darkening function
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    gameLoop() {
        this.updateGame();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new AIFrogger();
});