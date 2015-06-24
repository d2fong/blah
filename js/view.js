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
      //TODO
    };

    /**
     * You should add the view as a listener to each node in the scene graph, so that the view can get 
     * updated when the model is changed.
     */
    this.model.rootNode.addListener(this);
    this.model.headNode.addListener(this);
    
    //TODO

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
    });

    /**
     * Handle keyup events.
     */ 
    document.addEventListener('keyup', function(e) {
      //TODO
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