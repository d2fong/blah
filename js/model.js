/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the spaceship model.
 */

function createModelModule() {
  var SpaceshipModel = function() {

    var sceneGraphModule = createSceneGraphModule();

    /*
     * Maintain a list of nodes for iteration when performing hit detection.
     */
    this.nodes = [];

    /**
     * Instantiate the scene graph here.
     */
    this.rootNode = new sceneGraphModule.RootNode('scene');

    this.spaceshipNode = new sceneGraphModule.SpaceshipNode('spaceship', this.rootNode);
    this.spaceshipNode.translate(400, 300);

    this.headNode = new sceneGraphModule.HeadNode('head', this.spaceshipNode);
    this.headNode.translate(0, -80);

    //TODO


    /**
     * Push every node into the the nodes list.
     */
    this.nodes.push(this.headNode);
    this.nodes.push(this.spaceshipNode);
    this.nodes.push(this.rootNode);
    
    //TODO
  };

  _.extend(SpaceshipModel.prototype, {
    /**
      * Perform hit detection and return the hit node.
      * @param point: Point in the world view, i.e., from the perspective of the canvas.
      * @return 
      *   null if no node is hit, otherwise return the hit node.
      */
    performHitDetection: function(point) {
      var result = _.find(this.nodes, function(node) {
        if (node.performHitDetection(point)) {
          return node;
        }
      });
      if (result) {
        return result;
      } 
      return null;
    }
  });

  return {
    SpaceshipModel: SpaceshipModel
  };
}