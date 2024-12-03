// PARTICLES

const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
	color: 0xffff00, // Yellow
	size: 0.075, // *TO DO* Test different particle sizes (options: 0.025, 0.05, 0.075-- 0.1 is quite large)
	transparent: true,
	opacity: 0.75,
});

const numParticles = 50;
const position = new Float32Array(numParticles * 3); // x = i, y = i + 1, z = i + 2
const particleSpeed = [];

for (let i = 0; i < numParticles; i++) { // add random positions to each particle
	position[i * 3] = (Math.random() * 2) - 1; // Random position adjustment [-1, 1]
	position[i * 3 + 1] = (Math.random()); // *TO DO* Change based on game coordinates
	position[i * 3 + 2] = (-Math.random());

	let speed = {
		x: (Math.random() - 0.5) * 0.01,
		y: (Math.random() - 0.5) * 0.01,
		z: (Math.random() - 0.5) * 0.01,
	}
	particleSpeed.push(speed);
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3));

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

let clock = new THREE.Clock();
let time = 0

function animateParticles() {
	const positions = particlesGeometry.attributes.position.array;
  
	for (let i = 0; i < numParticles; i++) {
	  position[i * 3] += particleSpeed[i].x;
	  position[i * 3 + 1] += particleSpeed[i].y;
	  position[i * 3 + 2] += particleSpeed[i].z;

	  // Restricts the range of the particles (changes the shape)
	  if (Math.abs(positions[i * 3]) > 0.5) position[i * 3] = 0.1;
	  if (positions[i * 3 + 1] > 2) position[i * 3 + 1] = 0.1;
	  if (Math.abs(positions[i * 3 + 2]) > 2) positions[i * 3 + 2] = 0.1;
	}
  
	particlesGeometry.attributes.position.needsUpdate = true;
  }
  // Add in animate function:
  // 	particles.position.copy(asteroid.position);
