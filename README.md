# Render Racers
## Overview
This project is a racing game built using Three.js. It features interactive gameplay, dynamic physics, power-ups, and lap tracking. The game utilizes WebGL for rendering 3D objects and Firebase for leaderboard management.

## Features
- Dynamic Racing Tracks: Procedurally generated maps with checkpoints, obstacles, and power-ups.
- Interactive Gameplay:
  - Acceleration, steering, and braking mechanics.
  - Collision detection with objects and out-of-bounds handling.
- Power-Ups: Three types of power-ups:
  - Speed Boost
  - Time Deduction
  - Time Penalty
- Lap Tracking: Tracks lap times and displays them dynamically.
- Minimap: A minimap for better navigation during the race.
- Leaderboard: Firebase integration to store and retrieve best lap times.

## Installation
1. Clone the Repository:
```bash
git clone https://github.com/Shoheicode/CS-174-Final-Project.git
cd CS-174-Final-Project
``` 
2. Install Dependencies:

Ensure you have a local web server running (e.g., http-server or live-server).

3. Install required Node modules:
bash
Copy code
npm install three
npm install three/examples/jsm
npm install firebase
Run the Game: Launch your local server and open the game in a web browser:

bash
Copy code
npx live-server
Controls
Key	Action
Shift	Accelerate
Space	Brake/Stop
A (Left)	Turn left
D (Right)	Turn right
S (Backward)	Reverse
R	Reset game
Code Structure
Main Components
scene and camera: Sets up the 3D scene and camera perspective.
player: Represents the player-controlled car with custom physics.
floors and track: Manages terrain and checkpoints.
loadGLTF: Loads 3D car models using the GLTFLoader.
Key Functions
createMap: Generates the racing map dynamically.
checkCollision: Detects collisions between the car and other objects.
touchingGround: Ensures the car is grounded.
reset: Resets the game state for a new session.
animate: Main rendering loop for dynamic scene updates.
Physics and Mechanics
Speed and acceleration mechanics implemented with:
javascript
Copy code
speed += acceleration;
Collision handling:
javascript
Copy code
if (obj1.userData.obb.intersectsOBB(obj2.userData.obb)) {
    // Handle collision
}
Lap tracking:
javascript
Copy code
lapTimes.push(elapsedTime - prevTime);
Assets
3D Models: Car model loaded via GLTF.
Textures:
Road texture (road-texture-4k-02.jpg)
Power-up texture (powerUp1Texture.png)
Finish line texture (finishline.jpg)
Background: Space-themed background (39608.jpg).
Dependencies
Three.js: For rendering and managing 3D objects.
Firebase: For storing and retrieving leaderboard data.
GLTFLoader: For loading 3D models.
TextureLoader: For applying textures to objects.
How to Contribute
Fork the repository.
Create a feature branch.
Submit a pull request describing your changes.
Future Improvements
Add multiplayer mode for competitive racing.
Enhance physics for more realistic car dynamics.
Introduce additional maps and levels.
Add sound effects and music for an immersive experience.
License
This project is licensed under the MIT License.

Acknowledgments
Three.js
Firebase
OpenGL Textures
