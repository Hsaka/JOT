/**
 * Represents a single point, so the firework being fired up
 * into the air, or a point in the exploded firework
 */
Utils.Particle = function (pos, target, vel, marker, usePhysics, type) {

    // properties for animation
    // and colouring
    this.reset(pos, target, vel, marker, usePhysics, type);

};

/**
 * Functions that we'd rather like to be
 * available to all our particles, such
 * as updating and rendering
 */
Utils.Particle.prototype = {

    reset: function (pos, target, vel, marker, usePhysics, type, img) {
        this.GRAVITY = 0.06;
        this.alpha = 1;
        this.easing = Math.random() * 0.02;
        this.fade = Math.random() * 0.1;
        this.gridX = marker % 120;
        this.gridY = Math.floor(marker / 120) * 12;
        this.color = marker;
        this.type = type;
        this.image = img || 'small-glow';

        this.pos = {
            x: pos.x || 0,
            y: pos.y || 0
        };

        this.vel = {
            x: vel.x || 0,
            y: vel.y || 0
        };

        this.lastPos = {
            x: this.pos.x,
            y: this.pos.y
        };

        this.target = {
            y: target.y || 0
        };

        this.usePhysics = usePhysics || false;
    },

    update: function () {

        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;

        if (this.usePhysics) {
            this.vel.y += this.GRAVITY;
            this.pos.y += this.vel.y;

            // since this value will drop below
            // zero we'll occasionally see flicker,
            // ... just like in real life! Woo! xD
            this.alpha -= this.fade;
        } else {

            var distance = (this.target.y - this.pos.y);

            // ease the position
            this.pos.y += distance * (0.03 + this.easing);

            // cap to 1
            this.alpha = Math.min(distance * distance * 0.00005, 1);
        }

        this.pos.x += this.vel.x;

        return (this.alpha < 0.05 || this.pos.y > Utils.GlobalSettings.height || this.pos.x < 0 || this.pos.x > Utils.GlobalSettings.width);
    },

    render: function (mainCanvas, context, fireworkCanvas) {

        var x = Math.round(this.pos.x),
            y = Math.round(this.pos.y),
            xVel = (x - this.lastPos.x) * -5,
            yVel = (y - this.lastPos.y) * -5;

        context.save();
        //context.globalCompositeOperation = 'lighter';
        //context.globalAlpha = Math.random() * this.alpha;

        // draw the line from where we were to where
        // we are now
        context.fillStyle = "hsl(" + Math.round((this.color/12) * 3.6) + ",100%,60%)"; //"rgba(255,255,255,0.3)";
        context.beginPath();
        context.moveTo(this.pos.x, this.pos.y);
        context.lineTo(this.pos.x + 1.5, this.pos.y);
        context.lineTo(this.pos.x + xVel, this.pos.y + yVel);
        context.lineTo(this.pos.x - 1.5, this.pos.y);
        context.closePath();
        context.fill();
        
        mainCanvas.draw(this.image, x - 3, y - 3);

        context.restore();
    },

    destroy: function () {
        this.image = null;
        this.pos = null;
        this.vel = null;
        this.lastPos = null;
        this.target = null;
    }

};

Utils.Fireworks = function (game, state) {
    this.game = game;
    this.state = state;

    this.particles = [];
    this.particlePool = [];
    this.poolMarker = 0;
    this.poolSize = 0;
    this.fadeTimer = 0;
};

Utils.Fireworks.prototype = {
    init: function () {
        // create a canvas for the fireworks
        this.mainCanvas = this.game.add.bitmapData(Utils.GlobalSettings.width, Utils.GlobalSettings.height);
        this.mainContext = this.mainCanvas.context;
        //this.mainCanvas.fill(0, 0, 0, 1);
        this.mainCanvas.cls();
        this.mainCanvas.addToWorld();

        this.expandPool(500);
    },

    createFirework: function(fireworkImg) {
        this.createParticle(null, null, null, null, null, null, fireworkImg);
        this.fadeTimer = 0;
    },

    createSpark: function (x, y) {
        this.createParticle({ x: x, y: y }, { x: x, y: y }, null, null, null, 1);
        this.fadeTimer = 0;
    },

    createFireworks: function (n) {
        for (var i = 0; i < n; i++) {
            this.createParticle();
        }
        this.fadeTimer = 0;
    },

    clearContext: function () {
        this.fadeTimer += 0.001;
        if (this.fadeTimer >= 1) {
            this.fadeTimer = 0;
        }
        this.mainCanvas.fill(0, 0, 0, this.fadeTimer);
    },

    /**
     * Explodes in a roughly circular fashion
     */
    circle: function (firework) {

        var count = Utils.GlobalSettings.isMobile ? 20 : 40;
        var angle = (Math.PI * 2) / count;
        while (count--) {

            var randomVelocity = 4 + Math.random() * 4;
            var particleAngle = count * angle;

            this.createParticle(
              firework.pos,
              null,
              {
                  x: Math.cos(particleAngle) * randomVelocity,
                  y: Math.sin(particleAngle) * randomVelocity
              },
              firework.color,
              true,
              null,
              firework.image);
        }
    },

    spark: function (firework) {
        var count = 5;
        var angle = (Math.PI * 2) / count;
        while (count--) {

            var randomVelocity = 1;
            var particleAngle = count * angle;

            this.createParticle(
              firework.pos,
              null,
              {
                  x: Math.cos(particleAngle) * randomVelocity,
                  y: Math.sin(particleAngle) * randomVelocity
              },
              firework.color,
              true,
              null,
              firework.image);
        }
    },

    /**
     * Explodes in a star shape
     */
    star: function (firework) {

        // set up how many points the firework
        // should have as well as the velocity
        // of the exploded particles etc
        var points = Utils.GlobalSettings.isMobile ? 6 + Math.round(Math.random() * 5) : 6 + Math.round(Math.random() * 15);
        var jump = Utils.GlobalSettings.isMobile ? 3 + Math.round(Math.random() * 3) : 3 + Math.round(Math.random() * 7);
        var subdivisions = Utils.GlobalSettings.isMobile ? 5 : 10;
        var radius = 80;
        var randomVelocity = -(Math.random() * 3 - 6);

        var start = 0;
        var end = 0;
        var circle = Math.PI * 2;
        var adjustment = Math.random() * circle;

        do {

            // work out the start, end
            // and change values
            start = end;
            end = (end + jump) % points;

            var sAngle = (start / points) * circle - adjustment;
            var eAngle = ((start + jump) / points) * circle - adjustment;

            var startPos = {
                x: firework.pos.x + Math.cos(sAngle) * radius,
                y: firework.pos.y + Math.sin(sAngle) * radius
            };

            var endPos = {
                x: firework.pos.x + Math.cos(eAngle) * radius,
                y: firework.pos.y + Math.sin(eAngle) * radius
            };

            var diffPos = {
                x: endPos.x - startPos.x,
                y: endPos.y - startPos.y,
                a: eAngle - sAngle
            };

            // now linearly interpolate across
            // the subdivisions to get to a final
            // set of particles
            for (var s = 0; s < subdivisions; s++) {

                var sub = s / subdivisions;
                var subAngle = sAngle + (sub * diffPos.a);

                this.createParticle(
                  {
                      x: startPos.x + (sub * diffPos.x),
                      y: startPos.y + (sub * diffPos.y)
                  },
                  null,
                  {
                      x: Math.cos(subAngle) * randomVelocity,
                      y: Math.sin(subAngle) * randomVelocity
                  },
                  firework.color,
                  true,
                  null,
                  firework.image);
            }

            // loop until we're back at the start
        } while (end !== 0);

    },

    /**
   * Passes over all particles particles
   * and draws them
   */
    drawFireworks:function() {
        var a = this.particles.length;

        while (a--) {
            var firework = this.particles[a];
            if (firework) {

                // if the update comes back as true
                // then our firework should explode
                if (firework.update()) {
                    // if the firework isn't using physics
                    // then we know we can safely(!) explode it... yeah.
                    if (!firework.usePhysics) {

                        if (firework.type === 0) {
                            if (Math.random() < 0.8) {
                                this.star(firework);
                            } else {
                                this.circle(firework);
                            }
                        }
                        else
                            if (firework.type === 1) {
                                this.spark(firework);
                            }
                    }

                    // kill off the firework, replace it
                    // with the particles for the exploded version
                    this.particles.splice(a, 1);
                    this.returnParticle(firework);
                }

                // pass the canvas context and the firework
                // colours to the
                firework.render(this.mainCanvas, this.mainContext);
            }
        }
    },

    makeParticle: function (pos, target, vel, color, usePhysics, type, img) {

        pos = pos || {};
        target = target || {};
        vel = vel || {};
        type = type || 0;
        img = img || 'small-glow';

        return new Utils.Particle(
          // position
          {
              x: pos.x || Utils.GlobalSettings.width * 0.5,
              y: pos.y || Utils.GlobalSettings.height + 10
          },

          // target
          {
              y: target.y || 150 + Math.random() * 100
          },

          // velocity
          {
              x: vel.x || Math.random() * 3 - 1.5,
              y: vel.y || 0
          },

          color || Math.floor(Math.random() * 100) * 12,

          usePhysics,

          type, img);
    },

/**
 * Creates a new particle / firework
 */
    createParticle: function(pos, target, vel, color, usePhysics, type, img) {

        pos = pos || {
            x: Utils.GlobalSettings.width * 0.5,
            y: Utils.GlobalSettings.height + 10
        };
        target = target || {
            y: 150 + Math.random() * 100
        };
        vel = vel || {
            x: Math.random() * 3 - 1.5,
            y: 0
        };
        color = color || Math.floor(Math.random() * 100) * 12;
        type = type || 0;
        img = img || 'small-glow';
        
        if (this.poolMarker >= this.poolSize) {
            this.expandPool(this.poolSize * 2);
        }

        var obj = this.particlePool[this.poolMarker++];
        if (obj) {
            obj.index = this.poolMarker - 1;
            obj.reset(pos, target, vel, color, usePhysics, type, img);
            this.particles.push(obj);
        }
    },

    //push new objects onto the pool
    expandPool: function (newSize) {
        for (var i = 0; i < newSize - this.poolSize; ++i) {
            this.particlePool.push(this.makeParticle());
        }

        this.poolSize = newSize;
    },

    //swap it with the last available object
    returnParticle: function (particle) {
        this.poolMarker--;
        var end = this.particlePool[this.poolMarker];
        var endIndex = end.index;

        this.particlePool[this.poolMarker] = particle;
        this.particlePool[particle.index] = end;

        end.index = particle.index;
        particle.index = endIndex;
    },

    update: function () {
        this.clearContext();
        this.drawFireworks();
    },

    destroy: function () {
        var i = 0;
        if (this.particles) {
            for (i = 0; i < this.particles.length; i++) {
                if (this.particles[i]) {
                    this.particles[i].destroy();
                    this.particles[i] = null;
                }
            }

            this.particles = null;
        }

        if (this.particlePool) {
            for (i = 0; i < this.particlePool.length; i++) {
                if (this.particlePool[i]) {
                    this.particlePool[i].destroy();
                    this.particlePool[i] = null;
                }
            }

            this.particlePool = null;
        }

        if (this.mainCanvas) {
            //this.mainCanvas.destroy();
            this.mainCanvas = null;
        }
    }
};