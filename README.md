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

 - Ensure you have a local web server running (e.g., http-server or live-server).
 - Install required Node modules:
```bash
npm install three
npm install three/examples/jsm
npm install firebase
```

or 
```bash
npm install
```

3. Run the Game: Launch your local server and open the game in a web browser:

```bash
npx vite
```
## Controls
- Key	Action
- Shift	Accelerate
- Space	Brake/Stop
- A (Left)	Turn left
- D (Right)	Turn right
- S (Backward)	Reverse
- R	Reset game


## Code Structure
### Main Components
- Scene and Camera: Sets up the 3D scene and camera perspective.
- Player: Represents the player-controlled car with custom physics.
- Floors and Track: Manages terrain and checkpoints.
- loadGLTF: Loads 3D car models using the GLTFLoader.

### Key Functions
- createMap: Generates the racing map dynamically.
- checkCollision: Detects collisions between the car and other objects.
- touchingGround: Ensures the car is grounded.
- reset: Resets the game state for a new session.
- animate: Main rendering loop for dynamic scene updates.
- Physics and Mechanics

- Speed and acceleration mechanics implemented with:
``` javascript
speed += acceleration;
```

### Collision handling:
``` javascript
if (obj1.userData.obb.intersectsOBB(obj2.userData.obb)) {
    // Handle collision
}
```

### Lap tracking:
``` javascript
lapTimes.push(elapsedTime - prevTime);
```

## Assets
### 3D Models: 
- Car model loaded via GLTF.
### Textures:
- Road texture (road-texture-4k-02.jpg)
- Power-up texture (powerUp1Texture.png)
- Finish line texture (finishline.jpg)
- Background: Space-themed background (39608.jpg).

## Dependencies
- Three.js: For rendering and managing 3D objects.
- Firebase: For storing and retrieving leaderboard data.
- GLTFLoader: For loading 3D models.
- TextureLoader: For applying textures to objects.

## Future Improvements
- Add multiplayer mode for competitive racing.
- Enhance physics for more realistic car dynamics.
- Introduce additional maps and levels.
- Add sound effects and music for an immersive experience.

## License
This project is licensed under the UCLA License.

## Contributors


![image](https://github.com/user-attachments/assets/6937f963-a10e-4aee-a677-b96987088252)  | ![image](https://github.com/user-attachments/assets/e1bb1c4b-3102-4269-93db-6f144d3ca4ef) | [![ShoheiCode](https://github.com/user-attachments/assets/9201f055-0e10-4723-93c7-9818a769f111)](https://portfoliowebsite-36391.web.app/)
---|---|---
[megganluu](https://github.com/megganluu) | [valeriethekitty](https://github.com/valeriethekitty) | [ShoheiCode](https://github.com/Shoheicode)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

