/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the spaceship model.
 */

function createViewModule() {
  var SpaceshipView = function(model, canvas) {
    /**
     * Obtain the SpaceshipView itself.
     */
    var self = this;

    /**
     * Maintain the model.
     */
    this.model = model;

    /**
     * Maintain the canvas and its context.
     */
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    /**
     * Update the canvas. 
     * You should be able to do this trivially by first clearing the canvas, then call the rootNode's 
     * renderAll() with the context.
     */
    this.update = function() {
        this.context.clearRect(0,0, this.canvas.height, this.canvas.width);
        this.model.rootNode.renderAll(this.context);
    };

    /**
     * You should add the view as a listener to each node in the scene graph, so that the view can get 
     * updated when the model is changed.
     */

    this.model.rootNode.addListener(this);
    this.model.spaceshipNode.addListener(this);
    this.model.headNode.addListener(this);
    this.model.bodyNode.addListener(this);
    this.model.handleNode.addListener(this);
    this.model.tailNode.addListener(this);
    this.model.fireNode.addListener(this);
    
    /**
     * Handle mousedown events.
     * You should perform a hit detection here by calling the model's performHitDetection().
     */ 
    canvas.addEventListener('mousedown', function(e) {
      //TODO
    });

    /**
     * Handle mousemove events.
     */ 
    canvas.addEventListener('mousemove', function(e) {
      //TODO
    });


    /**
     * Handle mouseup events.
     */ 
    canvas.addEventListener('mouseup', function(e) {
      //TODO
    });

    /**
     * Handle keydown events.
     */ 
    document.addEventListener('keydown', function(e) {
      //TODO      
      if (e.keyCode == '38') {
          // up arrow
          self.model.fireNode.fireOn = true;
          self.model.rootNode.translate(0, -1);
      }
      else if (e.keyCode == '40') {
          // down arrow
      }
      else if (e.keyCode == '37') {
         // left arrow
         self.model.tailNode.translate(-10, -10);
         self.model.tailNode.rotate(0.1, 0.1, 0.1);
      }
      else if (e.keyCode == '39') {
         // right arrow
         self.model.tailNode.rotate(-0.1, 0.1, 0.1);
      } else {

      }
    });

    /**
     * Handle keyup events.
     */ 
    document.addEventListener('keyup', function(e) {

        if (e.keyCode == '38') {
            // up arrow
            self.model.fireNode.fireOn = false;
            self.update();
        }
        else if (e.keyCode == '40') {
            // down arrow
        }
        else if (e.keyCode == '37') {
           // left arrow
        }
        else if (e.keyCode == '39') {
           // right arrow
        } else {

        }


    });
    /**
     * Update the view when first created.
     */
    this.update();
  };

  return {
    SpaceshipView: SpaceshipView
  };
}