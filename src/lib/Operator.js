import * as Communicator from "./hoops-web-viewer-monolith.mjs";

export class PointSelectOperator {
    constructor(viewer) {
        this._viewer = viewer;
        this._markupHandle;
        this._point;
    };

    onMouseDown(event) {
        var _this = this;
        if (event.getButton() != Communicator.Button.Left) {
            return;
        }

        var pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.Face);

        _this._viewer.view.pickFromPoint(event.getPosition(), pickConfig).then(function (selectionItem) {
            var selectionPosition = selectionItem.getPosition();
            if (selectionPosition) {
                if (_this._markupHandle) {
                    _this._viewer.markupManager.unregisterMarkup(_this._markupHandle, _this._viewer.view);
                }
                _this._point = selectionPosition;
                var markupItem = new PointMarkup(_this._viewer, _this._point);
                _this._markupHandle = _this._viewer.markupManager.registerMarkup(markupItem, _this._viewer.view);

                var x = _this._point.x;
                var y = _this._point.y;
                var z = _this._point.z;
                x = x.toFixed(2);
                y = y.toFixed(2);
                z = z.toFixed(2);
                console.log(x, y, z);

                // $("#point").val(x + ", " + y + ", " + z);
                // mainViewer.showPreview();
            }
        });
    }

    getPoint() {
        var _this = this;
        return _this._point;
    }

    reset() {
        var _this = this;
        _this._viewer.markupManager.unregisterMarkup(_this._markupHandle);
        _this._point = undefined;
    }
}

function unitVector (P1, P2, l) {
    var dx = P2.x - P1.x;
    var dy = P2.y - P1.y;
    var dz = P2.z - P1.z;
    l = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return {x: dx / l, y: dy / l, z: dz / l};
}

class PointMarkup extends Communicator.Markup.MarkupItem {
    constructor(viewer, point) {
        super();
        this._viewer = viewer;
        this._point = point.copy();
        this._circle = new Communicator.Markup.Shapes.Circle();
    }

    draw() {
        var _this = this;
        _this._circle.set(Communicator.Point2.fromPoint3(this._viewer.view.projectPoint(_this._point)), 3);
        this._viewer.markupManager.getRenderer().drawCircle(_this._circle);
    }

    hit() {
        return false;
    }
}

export class HandleOperator {
    constructor(viewer, animationSteps) {
        this._viewer = viewer;
        this._animationSteps = animationSteps;
        this._handleOperator = viewer.getOperatorManager().getOperator(Communicator.OperatorId.Handle);
        this._nodes = [];
        this._minSt;
    };

    onMouseUp(event) {
        var _this = this;
        if (event.getButton() != Communicator.Button.Left) {
            return;
        }
        
        if (this._handleOperator._dragCount > 0) {
            _this._viewer.getModel().getNodesBounding(_this._nodes).then(function(box){
                var vector = unitVector(_this._minSt, box.min);
                var distance = Math.round(Communicator.Point3.distance(_this._minSt, box.min));
                if (distance < 1)
                    return;
                _this._animationSteps.addTranslationStep(_this._nodes.concat(), vector, distance);
            });
            return;
        }
            
        var pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.Face);
        _this._viewer.view.pickFromPoint(event.getPosition(), pickConfig).then(function (selectionItem) {
            var nodeId = selectionItem.getNodeId();
            if (nodeId > 0) {
                var model = _this._viewer.getModel();
                model.setNodesHighlighted([0], false).then(function() {
                    if (!event.controlDown()) {
                        _this._nodes.length = 0;
                    }
                    
                    _this._nodes.push(nodeId);
                    model.setNodesHighlighted(_this._nodes, true);
                    model.getNodesBounding(_this._nodes).then(function(box){
                        var x = box.min.x + (box.max.x - box.min.x) / 2;
                        var y = box.min.y + (box.max.y - box.min.y) / 2;
                        var z = box.min.z + (box.max.z - box.min.z) / 2;
                        var p = new Communicator.Point3(x, y, z);
                        _this._handleOperator.addHandles(_this._nodes, p);
                        _this._minSt = box.min;
                    });
                });
            } else {
                _this.reset();
            }
        });
    }
    
    reset() {
        var _this = this;
        _this._handleOperator.removeHandles();
        var root = _this._viewer.getModel().getRootNode();
        _this._viewer.getModel().setNodesHighlighted([root], false);
        _this._nodes.length = 0;
    }
    
    getNodes() {
        var _this = this;
        return _this._nodes;
    }
}

export class NodesSelectOperator {
    constructor(viewer, msgs) {
        this._viewer = viewer;
        this._msgs = msgs;
        this._nodes = [];
    };

    onMouseDown(event) {
        var _this = this;
        if (event.getButton() != Communicator.Button.Left) {
            return;
        }
        
        var pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.Face);
        _this._viewer.view.pickFromPoint(event.getPosition(), pickConfig).then(function (selectionItem) {
            var nodeId = selectionItem.getNodeId();
            if (nodeId > 0) {
                // nodeId = _this._viewer.getModel().getNodeParent(nodeId);
                _this.selected(nodeId);
            }
        });
    }
    
    reset() {
        var _this = this;
        var root = _this._viewer.model.getRootNode();
        _this._viewer.model.setNodesHighlighted([root], false);
        _this._nodes.length = 0;
    }
    
    getNodes() {
        var _this = this;
        return _this._nodes;
    }
    
    selected(nodeId) {
        var _this = this;
        var model = _this._viewer.model;
        
        // mainViewer.resetLineHighlighted();
        
        model.setNodesHighlighted([model.getAbsoluteRootNode()], false).then(function() {
            var i = _this._nodes.indexOf(nodeId);
            if(i == -1) {
                _this._nodes.push(nodeId);
            } else {
                _this._nodes.splice(i, 1);
            }
            model.setNodesHighlighted(_this._nodes, true);
            console.log('nodes', _this._nodes);
            
            // $('select#targetNodes option').remove();
            // if (_this._nodes.length > 0) {
            //     $.each(_this._nodes, function(id, nodeId){
            //         $option = $('<option>').val(id).text(nodeId)
            //         $("#targetNodes").append($option);    
            //     })
            // } else {
            //     $option = $('<option>')
            //         .val('')
            //         .text(_this._msgs[9])
            //         .prop('disabled', true);
            //     $("#targetNodes").append($option);
            // }
            // mainViewer.showPreview();
        });
    }
}

export class VectorSelectOperator {
    constructor(viewer) {
        this._viewer = viewer;
        this._currentNode;
        this._currentId;
        this._isFlip;
        this._vector;
        this._markupHandle;
    };

    clear() {
        var _this = this;
        
        if (_this._currentNode != undefined) {
            _this._currentNode = undefined;
            _this._currentId = undefined;
            _this._isFlip = undefined;
            _this._vector = undefined;
            _this._viewer.markupManager.unregisterMarkup(_this._markupHandle, _this._viewer.view);
            _this._markupHandle = undefined;
        }
    }
    
    onMouseMove(event) {
        var _this = this;
        
        var pickConfig = new Communicator.PickConfig(Communicator.SelectionMask.Line);
        _this._viewer.view.pickFromPoint(event.getPosition(), pickConfig).then(function (selectionItem) {
            var line = selectionItem.getLineEntity();
            if (line) {
                var points = line.getPoints();
                if (points.length == 2) {
                    var node = selectionItem.getNodeId();
                    var id = line.getLineId();
                    
                    var isFlip;
                    var p = selectionItem.getPosition();
                    var d0 = Communicator.Point3.distance(p, points[0]);
                    var d1 = Communicator.Point3.distance(p, points[1]);                  
                    if (d0 < d1) {
                        isFlip = false;
                    } else {
                        isFlip = true;
                    }
                    
                    if (_this._currentNode != node || _this._currentId != id || _this._isFlip != isFlip) {
                        _this.clear();
                        _this._currentNode = node;
                        _this._currentId = id;
                        _this._isFlip = isFlip;
                        
                        var markupItem = new ArrowMarkup(_this._viewer, new Communicator.Color(255, 0, 0));
                        if (d0 < d1) {
                            markupItem.setPosiiton(points[0], points[1]);
                            _this._vector = unitVector(points[0], points[1]);
                        } else {
                            markupItem.setPosiiton(points[1], points[0]);
                            _this._vector = unitVector(points[1], points[0]);
                        }                        
                        _this._markupHandle = _this._viewer.markupManager.registerMarkup(markupItem, _this._viewer.view);
                        console.log(_this._vector);                        
                    }
                } else {
                    _this.clear();
                }
            } else {
                _this.clear();
            }
        });
    }
    
    onMouseDown(event) {
        var _this = this;
        
        // mainViewer.setVector(_this._vector);
    }
}

class ArrowMarkup extends Communicator.Markup.MarkupItem {
    constructor(viewer, color, constntLength) {
        super();
        this._viewer = viewer;
        this._stPnt = Communicator.Point3.zero();
        this._enPnt = Communicator.Point3.zero();
        this._line = new Communicator.Markup.Shapes.Line();
        this._line.setStartEndcapType(Communicator.Markup.Shapes.EndcapType.Circle);
        this._line.setEndEndcapType(Communicator.Markup.Shapes.EndcapType.Arrowhead);
        this._line.setStrokeWidth(2);
        this._line.setStartEndcapColor(color);
        this._line.setEndEndcapColor(color);
        this._line.setStrokeColor(color);
        this._constantLength = false;
        if (undefined != constntLength) this._constantLength = true;
    }

    draw() {
        const stPnt = Communicator.Point2.fromPoint3(this._viewer.view.projectPoint(this._stPnt));
        let enPnt = Communicator.Point2.fromPoint3(this._viewer.view.projectPoint(this._enPnt));

        if (this._constantLength) {
            const p0 = new Communicator.Point2(0, 0);
            const canvasSize = this._viewer.view.getCanvasSize();   
            const pMin = this._viewer.view.unprojectPoint(p0, 0)
            const pMax = this._viewer.view.unprojectPoint(canvasSize, 0)
            let diagonalLength = Communicator.Point3.distance(pMin, pMax);
            diagonalLength /= 10;
            if (isNaN(diagonalLength) || diagonalLength < 1) diagonalLength = 1;

            const endPnt = this._stPnt.copy().add(this._enPnt.copy().scale(diagonalLength));
            enPnt = Communicator.Point2.fromPoint3(this._viewer.view.projectPoint(endPnt));
        }

        this._line.set(stPnt, enPnt);
        this._viewer.markupManager.getRenderer().drawLine(this._line);
    }
 
    hit() {
        return false;
    }

    remove () {
        return;
    }

    setPosiiton(stPnt, enPnt) {
        this._stPnt = stPnt.copy();
        this._enPnt = enPnt.copy();
    }

    getPosition() {
        return [this._stPnt, this._enPnt];
    }

    setStartEndCap(startCap, endCap) {
        this._line.setStartEndcapType(startCap);
        this._line.setEndEndcapType(endCap);
    }

}
