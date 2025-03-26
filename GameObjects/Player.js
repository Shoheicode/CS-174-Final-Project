class PlayerObject{
    // Properties of the car
    speed = 0;
    acceleration = 0.005; // 5 m/s^2
    deacceleration = 0.01;
    maxSpeed = 0.75; // 7.5 m/s
    powerUpSpeed = 1.2;
    dirRotation = -3*Math.PI/2; // Start turn angle
    collide = false;
    speedY = 0;
    raceOver = false;
    rSpeed = 0;
    run = false; // Controls the run time
    brake = false;
    touchGround = true;
    waitTime = 0;

    

}

export default PlayerObject;