/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the scene graph classes.
 * This module has an astract GraphNode which generalises the behaviour of a node in a scene graph.
 * Other classes inherit the GraphNode, forming a tree structure when instantiated.
 * - RootNode represents the background and the scene.
 * - SpaceshipNode represents the spaceship.
 * - BodyNode, HeadNode, and TailNode represent the three parts that belong to the spaceship.
 * - HandleNode refers to the black handle on the top of the body.
 * - FireNode belongs to the tail, representing the fire at the end of the spaceship.
 * These classes should be instantiated in model.js.
 */
function createSceneGraphModule() {

    /**
     * An abstract graph node in a scene graph.
     * @param id: Node identifier.
     * @param parent: Parent of the node in the scene graph.
     */
    var GraphNode = function(id, parent) {
        var self = this;
        // Maintain the identifier.
        this.id = id;

        // Maintain a local transformation that is relative to its parent.
        this.localTransformation = new AffineTransform();

        // Maintain a global transformation that is relative to the canvas coordinate.
        // This matrix is useful when performing a hit detection.
        this.globalTransformation = new AffineTransform();

        // If a valid parent is passed in, save the parent to this node, then add this node to the parent.
        this.parent = typeof parent !== 'undefined' ? parent : null;

        // Maintain a list of child nodes.
        this.children = [];

        // Local bounding box of this node. This should be overridden by concreate graph nodes.
        // The coordinate of the bounding box is from the perspective of the node itself, not 
        // from the canvas.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };

        // Indicate whether this node is interactable with a mouse. If it is not interactable with 
        // mouse at all, we do not need to perform a hit detection on it.
        this.isInteractableWithMouse = false;

        // Maintain a list of listners.
        this.listeners = [];
    };

    _.extend(GraphNode.prototype, {
        
        /**
         * Notify all listeners the change in this node.
         */
        notify: function() {
            _.each(this.listeners, function(listener) {
                // The view will be the primary listener to each graph node, hence we call its update function when this model changes
                listener.update();
            });
        },

        /**
         * Add a listener, if it is not registered with this node.
         * @param listener: Object that listens for the change of the node.
         */
        addListener: function(listener) {
            if (_.indexOf(this.listeners, listener) == -1) {
                this.listeners.push(listener);
            }
        },

        /**
         * Remove a listener, if it is registered with this node.
         * @param listener: Listener that is registered with this node. 
         */
        removeListener: function(listener) {
            this.listeners = _.without(this.listeners, listener);
        },

        /**
         * Add a child node to this node if it is not appended to this node.
         * 
         * You should point the child's parent to this node and add the child to the children list.
         * You should also recursively update the global transformations of its descendants, as they are
         * appended to a new parent.
         * @param node: Child node to be added.
         */
        addChild: function(node) {
            if (!_.contains(this.children, node)) {
                node.parent = this;
                node.updateAllGlobalTransformation();
                this.children.push(node);
            }
        },

        /**
         * Remove a child node of this node, if it is appended to this node.
         * @param node: Child node to be removed.
         */
        removeChild: function(node) {
            if (_.indexOf(this.children, node) >= 0) {
                this.children = _.without(this.children, node);
            }
        },

        /**
         * Apply a Google Closure AffineTransform object to the HTML5 Canvas context.
         * @param context: HTML5 Canvas context.
         * @param transformation: Google Closure AffineTransform object.
         */
        applyTransformationToContext: function(context, transformation) {
            context.transform(transformation.m00_, 
                transformation.m10_,
                transformation.m01_,
                transformation.m11_,
                transformation.m02_,
                transformation.m12_);
        },

        /**
         * Update the global transformation of _ONLY_ this node.
         * Specifically, if it is the root of the scene graph, update itself with its local 
         * transformation, otherwise clone the global transformation of its parent, then concatenate it 
         * with this node's local transformation.
         */
        updateGlobalTransformation: function() {
            if (this.id == 'scene') { 
                this.globalTransformation.concatenate(this.localTransformation);
            } else {
                var parentTransform = _.clone(this.parent.globalTransformation);
                this.localTransformation.concatenate(parentTransform);
            }
        },

        /**
         * Update the global transformations of this node and its descendants recursively.
         */
        updateAllGlobalTransformation: function() {
            this.updateGlobalTransformation();
            _.each(this.children, function(child) {
                child.updateGlobalTransformation();
            });
        },

        /**
         * Render _ONLY_ this node with the assumption that the node is painted at around the origin. 
         * @param context: Context obtained from HTML5 Canvas.
         */
        renderLocal: function(context) {
            this.applyTransformationToContext(context, this.globalTransformation);
        },

        /**
         * Recursively render itself and its descendants.
         * 
         * Specifically, 
         * 1. Save Canvas context before performing any operation.
         * 2. Apply local transformation to the context.
         * 3. Render the node and its children, 
         * 4. Restore Canvas context.
         *
         * @param context: Context obtained from HTML Canvas.
         */
        renderAll: function(context) {
            context.save();
            this.applyTransformationToContext(context, this.localTransformation);
            this.renderLocal(context);
            _.each(this.children, function(child) {
                child.renderAll(context);
            });
            context.restore();
        },

        /**
         * Rotate this node and its descendants.
         * 
         * Specifically, 
         * 1. Concatenate a rotation matrix after the current local transformation. This would apply 
         *    the rotation prior to other transformation that has been applied to this node. It is 
         *    equivalent to using the inverse of the current local transformation to return this node 
         *    back to the origin, applying the rotation, and transforming this node back with the local
         *    transformation.
         * 2. Update the global transfomration. Applying change to this node would in fact change the 
         *    positions and orientations of all its descendants. Thus, you should update the global 
         *    transformation matrix of itself and all its descendants. This allows us to perform a O(1)
         *    hit detection without the need to concatenate local matrices along the hierarchy each
         *    time we perform the hit detection.
         * 3. Finally, notify the view to update. This would make the canvas to repaint the scene graph
         *    by traversing down the tree.
         *
         * You do not need to traverse down the tree to update every descendant's local transformation,
         * since the scene graph will render this node's children based on the transformation applied to
         * the node.
         *  
         * @param theta: Angle to rotate clockwise.
         * @param x, y: Centre of Rotation.
         */
        rotate: function(theta, x, y) {
            this.localTransformation.rotate(theta, x, y);
            this.updateAllGlobalTransformation();
            this.notify();
        },

        /**
         * Translate this node and its descendants.
         * 
         * Specifically, 
         * 1. Concatenate a translation matrix after the current local transformation. 
         * 2. Update the global transfomration recursively to the node and its descendants.
         * 3. Finally, notify the view to update.
         * 
         * @param dx: Distance to translate in the x direction from the node's coordinate system.
         * @param dy: Distance to translate in the y direction from the node's coordinate system.
         */
        translate: function(dx, dy) {
            this.localTransformation.translate(dx, dy);
            this.updateAllGlobalTransformation();
            this.notify();
        },

        /**
         * Scale this node and its descendants.
         * 
         * Specifically, 
         * 1. Concatenate a scaling matrix after the current local transformation. 
         * 2. Update the global transfomration recursively to the node and its descendants.
         * 3. Finally, notify the view to update.
         *
         * Note that doing this would propogate the scaling to its descendants when rendering.
         * You may also need another function to scale the shape by updating its rendering dimensions
         * as well as its bounding box.
         *
         * @param sx: Scaling factor in the x direction from the node's coordinate system.
         * @param sy: Scaling factor in the y direction from the node's coordinate system.
         */
        scale: function(sx, sy) {
            this.localTransformation.scale(dx, dy);
            this.updateAllGlobalTransformation();
            //  TODO
            //  scale the bouding box, and update its rendering dimensions
            this.notify();          
        },



        /** 
          * Check whether a point is within the local bounding box.
          * Specifically, 
          * if this node is interactable with a mouse,
          * 1. Create the inverse matrix of the current global transformation.
          * 2. Transform the point with the matrix, so that the point becomes the coordinate relative
          *    to this node.
          * 3. Check with the transformed point whether it's in the local bounding box.
          * 
          * If it does not interact with a mouse, there is no need to perform a hit detection, 
          * you should return false.
          *
          * @param point: Point to be checked. It is a coordinate represented with list [x y].
          *               It is always the coordinate from the perspective of the canvas, i.e., 
          *               in the world view.
          * 
          * @return false if the node is not interactable with a mouse. When it is, return true if the 
          *         point is in the local bounding box, otherwise false.
          */
        performHitDetection: function(point) {
            if (!this.isInteractableWithMouse) {
                return false;
            }

            var p = _.clone(point);
            // create inverse matrix and transform the point
            var inverseGlobal = this.globalTransformation.createInverse();
            inverseGlobal.transform(point, 0, 0, 1);

            var x = p[0],
                y = p[1];

            if ( this.localBoundingBox['x'] < x  
                && x < this.localBoundingBox['x'] + this.localBoundingBox['w']
                && this.localBoundingBox['y'] < y
                && y < this.localBoundingBox['y'] + this.localBoundingBox['h']) {
                return true;
            } else {
                return false;
            }
        }
    });


    /**
     * RootNode is the root of the scene graph, i.e., it represents the canvas.
     */
    var RootNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        // Override the local bounding box of this node.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 800,
            h: 600
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(RootNode.prototype, GraphNode.prototype, {
        // TODO
    });

    /**
     * SpaceshipNode, representing the whole spaceship.
     */
    var SpaceshipNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        // TODO

        // Override the local bounding box of this node. You might want to modify this.
        this.localBoundingBox = {
            x: -50,
            y: -50,
            w: 100,
            h: 100
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(SpaceshipNode.prototype, GraphNode.prototype, {
        // Override the renderLocal function to draw itself in its own coordinate system.
        renderLocal: function(context) {

            // You might want to modify this.
            context.fillStyle = "white";
            context.rect(-40, -210, 130, 450);
            context.fill();
            // context.lineWidth = 3;
            // context.strokeStyle = 'black';
            // context.stroke();
            
        }
    });



    /**
     * HeadNode is the child of the spaceship node, representing the head of the spaceship.
     */
    var HeadNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);


        // Override the local bounding box of this node, you might want to modify this.
        this.localBoundingBox = {
            x: -30,
            y: -30,
            w: 60,
            h: 60
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(HeadNode.prototype, GraphNode.prototype, {
        // Override the renderLocal function to draw itself in its own coordinate system.
        renderLocal: function(context) {

            // You might want to modify this.
            context.lineWidth = 3;


            context.beginPath();
            context.moveTo(25, -100);
            context.lineTo(-5, -50);
            context.strokeStyle = 'black';
            context.stroke();
            context.lineTo(55,-50);
            context.strokeStyle = 'black';
            context.stroke();
            context.closePath();
            context.strokeStyle = 'black';
            context.stroke();
            context.fillStyle = "#blue";
            context.fill();


        }
    });




    /**
     * TailNode is a child of the spaceship node, representing the tail of the spaceship.
     */
    var TailNode = function() {
        GraphNode.apply(this, arguments);

        this.localBoundingBox = {
            x: -80,
            y: -80,
            w: 80,
            h: 80
        };
    }
    _.extend(TailNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {

            context.fillStyle = "#FFF1DB";
            context.lineWidth = 3;


            context.beginPath();
            context.moveTo(25, 282);
            context.strokeStyle = 'black';
            context.stroke();
            context.lineTo(-15, 330);
            context.strokeStyle = 'black';
            context.stroke();
            context.lineTo(65, 330);
            context.strokeStyle = 'black';
            context.stroke();
            context.closePath();
            context.strokeStyle = 'black';
            context.stroke();
            context.fillStyle = "#FFF1DB";
            context.fill();
        }
    });



    /**
     * FireNode is a child of the tail node, representing the fire at the end of the spaceship.
     */
    var FireNode = function() {
        GraphNode.apply(this, arguments);

        this.localBoundingBox = {
            x: -90,
            y: -90,
            w: 100,
            h: 100
        };

        this.fireOn = false;

    }
    _.extend(FireNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            //TODO

            if (this.fireOn) { 
                context.fillStyle = "#B30B16";
                context.fillRect(-10, 565, 20, 60);
                context.fillRect( 15, 565, 20, 60);
                context.fillRect( 40, 565, 20, 60);
            } 

        },
    });



    /**
     * BodyNode is a child of the spaceship node, representing the body of the spaceship.
     */ 
    var BodyNode = function() {
        GraphNode.apply(this, arguments);


        this.localBoundingBox = {
            x: -31,
            y: -31,
            w: 49,
            h: 49
        };
    }
    _.extend(BodyNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {

            context.fillStyle = "#FFE2C4";
            context.rect(-5, -49, 60, 230);
            context.fill();
            context.lineWidth = 3;
            context.strokeStyle = 'black';
            context.stroke();

        }
    });


// 
    /**
     * HandleNode is a child of the body node, representing the resizing handle of the spaceship.
     */ 
    var HandleNode = function() {
        GraphNode.apply(this, arguments);

        this.localBoundingBox = {
            x: -61,
            y: -61,
            w: 20,
            h: 20
        };
    }
    _.extend(HandleNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {

            context.fillStyle = "#000000";
            context.fillRect(-5, 31, 60, 10);
        }
    });


    // Return an object containing all of our classes and constants
    return {
        RootNode: RootNode,
        SpaceshipNode: SpaceshipNode,
        HeadNode: HeadNode,
        TailNode: TailNode,
        FireNode: FireNode,
        BodyNode: BodyNode,
        HandleNode: HandleNode,
    };
}