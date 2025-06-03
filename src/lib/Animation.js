import * as Communicator from "./hoops-web-viewer-monolith.mjs";

function hexToColor(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result !== null) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return new Communicator.Color(r, g, b);
    }
    return Communicator.Color.black();
}

export class KeyframeAnimation {
    constructor(viewer, animationName) {
        this.viewer = viewer;
        this.animation = new Communicator.Animation.Animation(animationName);
        this.player = this.viewer.animationManager.createPlayer(this.animation);

        this._nodeOpacities = {};
        this._isPause = false
    }

    getAnimation() {
        return this.animation;
    }

    play() {
        this.rewind();
        this.player.play();
    }

    rewind() {
        this.player.reload();
        this.isPause = false;
    }

    pause() {
        if (this._isPause) {
            this.player.play();
        }
        else {
            this.player.pause();
        }
        this.isPause = !this.isPause;
    }

    async addTranslation(nodes, startTime, duration, directionVec3, distance) {
        for (const nodeId of nodes) {
            const channelName = `Translate-${nodeId}`;
            const buffer = new Communicator.Animation.KeyframeBuffer(Communicator.Animation.KeyType.Vec3);
            const sampler = new Communicator.Animation.Sampler(buffer, Communicator.Animation.InterpolationType.Linear);
            this.animation.createNodeChannel(channelName, nodeId, Communicator.Animation.NodeProperty.Translation, sampler);

            const initialPos = Communicator.Point3.zero();
            await buffer.insertVec3Keyframe(startTime, initialPos.x, initialPos.y, initialPos.z);

            const targetPos = Communicator.Point3.add(initialPos, Communicator.Point3.scale(new Communicator.Point3(directionVec3.x, directionVec3.y, directionVec3.z), distance));
            await buffer.insertVec3Keyframe(startTime + duration, targetPos.x, targetPos.y, targetPos.z);
        }
    }

    addRotation(nodes, startTime, duration, axis, center, angleDeg) {
        for (const nodeId of nodes) {
            const buffer = new Communicator.Animation.KeyframeBuffer(Communicator.Animation.KeyType.Quat);
            const sampler = new Communicator.Animation.Sampler(buffer, Communicator.Animation.InterpolationType.Linear);
            this.animation.createNodeChannel(`Rotate-${nodeId}`, nodeId, Communicator.Animation.NodeProperty.Rotation, sampler);

            const initialMatrix = this.viewer.model.getNodeMatrix(nodeId);
            const qStart = Communicator.Quaternion.createFromMatrix(initialMatrix);
            buffer.insertQuatKeyframe(startTime, qStart.x, qStart.y, qStart.z, qStart.w);

            const localRotation = this.#computeLocalRotation(nodeId, initialMatrix, axis, center, angleDeg);
            this.animation.pivotPoints.set(nodeId, localRotation.center);

            const qEnd = this.#createQuatFromAxisAngle(localRotation.axis, angleDeg);
            buffer.insertQuatKeyframe(startTime + duration, qEnd.x, qEnd.y, qEnd.z, qEnd.w);
        }
    }

    addCameraAnimation(startTime, duration, targetCamera, fromCamera) {
        const channels = Communicator.Animation.createCameraChannels(this.animation, "Camera", Communicator.Animation.InterpolationType.Linear);
        const currentCamera = fromCamera || this.viewer.view.getCamera();
        Communicator.Animation.keyframeCamera(startTime, currentCamera, this.animation);
        Communicator.Animation.keyframeCamera(startTime + duration, targetCamera, this.animation);
    }

    async addColorAnimation(nodes, startTime, duration, startColor, endColor) {
        for (const nodeId of nodes) {
            const channelName = `Color-${nodeId}`;
            const buffer = new Communicator.Animation.KeyframeBuffer(Communicator.Animation.KeyType.Vec3);
            const sampler = new Communicator.Animation.Sampler(buffer, Communicator.Animation.InterpolationType.Linear);
            const channel = this.animation.createNodeChannel(channelName, nodeId, Communicator.Animation.NodeProperty.Color, sampler);

            if (!startColor) {
                const nodeColor = await this.viewer.model.getNodesEffectiveFaceColor([nodeId]);
                startColor = nodeColor[0];
            }

            channel.sampler.buffer.insertVec3Keyframe(startTime, startColor.r, startColor.g, startColor.b);
            channel.sampler.buffer.insertVec3Keyframe(startTime + duration, endColor.r, endColor.g, endColor.b);
        }
    }

    async addBlinkAnimation(nodes, startTime, duration) {

        for (const nodeId of nodes) {

            const channelName = `Blink-${nodeId}`;
            let nodeColor;
            const children = this.viewer.model.getNodeChildren(nodeId);

            if (0 == children.length) {
                const parentNode = this.viewer.model.getNodeParent(nodeId);
                nodeColor = await this.viewer.model.getNodesEffectiveFaceColor([parentNode]);
            } else {
                nodeColor = await this.viewer.model.getNodesEffectiveFaceColor([nodeId]);
            }

            const buffer = new Communicator.Animation.KeyframeBuffer(Communicator.Animation.KeyType.Vec3);
            const sampler = new Communicator.Animation.Sampler(buffer, Communicator.Animation.InterpolationType.Linear);
            const channel = this.animation.createNodeChannel(channelName, nodeId, Communicator.Animation.NodeProperty.Color, sampler);

            let color = Communicator.Color.red();

            for (let i = 0; i <= 6; i++) {
                const time = startTime + duration / 6 * i;
                if (i % 2 == 0) {
                    channel.sampler.buffer.insertVec3Keyframe(time, nodeColor[0].r, nodeColor[0].g, nodeColor[0].b)
                } else {
                    channel.sampler.buffer.insertVec3Keyframe(time, color.r, color.g, color.b);
                }
            }

            channel.sampler.buffer.insertVec3Keyframe(startTime + duration, nodeColor[0].r, nodeColor[0].g, nodeColor[0].b);
        }
    }

    async addFadeoutAnimation(nodes, startTime, duration) {
        await this.addOpacityAnimation(nodes, startTime, duration, 0);
    }

    async addOpacityAnimation(nodes, startTime, duration, opacity) {

        for (const nodeId of nodes) {
            const channelName = `Opacity-${nodeId}`;
            // if (undefined == this._nodeOpacities[nodeId]) {
            const opacity = await this.viewer.model.getNodesOpacity([nodeId]);
            this._nodeOpacities[nodeId] = (opacity[0] == null) ? 1 : opacity[0]
            // }

            const buffer = new Communicator.Animation.KeyframeBuffer(Communicator.Animation.KeyType.Scalar);
            const sampler = new Communicator.Animation.Sampler(buffer, Communicator.Animation.InterpolationType.Linear);
            const channel = this.animation.createNodeChannel(channelName, nodeId, Communicator.Animation.NodeProperty.Opacity, sampler);

            channel.sampler.buffer.insertScalarKeyframe(startTime, this._nodeOpacities[nodeId]);
            channel.sampler.buffer.insertScalarKeyframe(startTime + duration, opacity);

            // this._nodeOpacities[nodeId] = opacity;
        }
    }

    #computeLocalRotation(nodeId, matrix, axis, center, angleDeg) {
        const parent = this.viewer.model.getNodeParent(nodeId);
        const netMatrix = this.viewer.model.getNodeNetMatrix(parent);
        const inverse = new Communicator.Matrix.inverse(netMatrix);

        const localAxis0 = Communicator.Point3.zero();
        inverse.transform(Communicator.Point3.zero(), localAxis0);

        const localAxis = Communicator.Point3.zero();
        inverse.transform(axis, localAxis);
        localAxis.subtract(localAxis0);

        const rotationMatrix = Communicator.Matrix.createFromOffAxisRotation(localAxis, angleDeg * Math.PI / 180);
        const multipliedMatrix = Communicator.Matrix.multiply(matrix, rotationMatrix);

        const localCenter = Communicator.Point3.zero();
        inverse.transform(center, localCenter);

        const rotatedCenter = Communicator.Point3.zero();
        rotationMatrix.transform(localCenter, rotatedCenter);

        const translationMatrix = new Communicator.Matrix();
        translationMatrix.setTranslationComponent(
            localCenter.x - rotatedCenter.x,
            localCenter.y - rotatedCenter.y,
            localCenter.z - rotatedCenter.z
        );

        return {
            axis: localAxis,
            center: localCenter
        };
    }

    #createQuatFromAxisAngle(axis, angleDeg) {
        const rad = angleDeg * Math.PI / 180 * 0.5;
        const sinHalf = Math.sin(rad);
        const quat = new Communicator.Quaternion(
            axis.x * sinHalf,
            axis.y * sinHalf,
            axis.z * sinHalf,
            Math.cos(rad)
        );
        return quat;
    }

    serialize() {
        this.rewind();
        const obj = Communicator.Animation.exportAnimations([this.animation]);
        return obj;
    }

    deserialize(obj) {
        const animations = Communicator.Animation.importAnimations(obj)
        this.animation = animations[0];

        this.player = this.viewer.animationManager.createPlayer(this.animation);
    }
}

export class AnimationSteps {
    constructor(viewer) {
        this.viewer = viewer;
        this.steps = [];
        this.homeCamera;
    }

    setHomeCamera(camera) {
        var json = camera.forJson();
        this.homeCamera = json;
    }

    getHomeCamera() {
        return this.homeCamera;
    }

    addStep(step) {
        this.steps.push(step);
    }

    removeStep(animationType) {
        const index = this.steps.findIndex((s) => s.type == animationType)
        if (index > -1) {
            this.steps.splice(index, 1);
        }
    }
}


export class AnimationController {
    constructor(viewer, animationSteps) {
        this.viewer = viewer;
        this.animationSteps = animationSteps;
        this.homeCamera;
        this.keyFrameAnimation;
    }

    async createKeyframeAnimation() {
        this.keyFrameAnimation = new KeyframeAnimation(this.viewer, "KeyframeAnimation");
        this.homeCamera = this.animationSteps.getHomeCamera();

        const steps = this.animationSteps.steps;
        const copySteps = [...steps];

        copySteps.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        let lastCamera = this.homeCamera ? Communicator.Camera.fromJson(this.homeCamera) : this.viewer.view.getCamera();

        for (const step of copySteps) {
            const { startTime, duration, type } = step;
            switch (type) {
                case "camera":
                    const camera = Communicator.Camera.fromJson(step.camera);
                    this.keyFrameAnimation.addCameraAnimation(startTime, duration, camera, lastCamera);
                    lastCamera = camera;
                    break;
                case "translation":
                    await this.keyFrameAnimation.addTranslation(step.nodes, startTime, duration, step.vector, step.distance);
                    break;
                case "rotation":
                    this.keyFrameAnimation.addRotation(step.nodes, startTime, duration, step.axis, step.center, step.angle);
                    break;
                case "color":
                    await this.keyFrameAnimation.addColorAnimation(step.nodes, startTime, duration, step.startColor, hexToColor(step.endColor));
                    break;
                case "blink":
                    await this.keyFrameAnimation.addBlinkAnimation(step.nodes, startTime, duration);
                    break;
                case "fadeout":
                    await this.keyFrameAnimation.addFadeoutAnimation(step.nodes, startTime, duration);
                    break;
                default:
                    break;
            }
        }
    }

    async play() {
        this.rewind();
        await this.createKeyframeAnimation();
        this.keyFrameAnimation.play();
    }

    pause() {
        this.keyFrameAnimation.pause();
    }

    rewind() {
        // this.viewer.model.reset();
        // this.viewer.model.resetModelOpacity();

        if (undefined != this.animationSteps) {
            var cameraJson = this.animationSteps.getHomeCamera();
            if (cameraJson != undefined) {
                var camera = Communicator.Camera.fromJson(cameraJson);
                this.viewer.view.setCamera(camera);
            } else {
                this.viewer.view.resetCamera(0);
            }
        }
        else if (undefined != this._homeCamera) {
            this.viewer.view.setCamera(this._homeCamera);
        }
        else {
            this.viewer.view.resetCamera(0);
        }
    }

    async serialize() {
        this.rewind();
        await this.createKeyframeAnimation();
        const obj = this.keyFrameAnimation.serialize();
        return obj;
    }

    playByObject(obj) {
        if (undefined != obj.homeCamera) {
            this.homeCamera = Communicator.Camera.fromJson(obj.homeCamera);
        }

        const animation = obj.animation;

        this.keyFrameAnimation = new KeyframeAnimation(this.viewer);
        this.keyFrameAnimation.deserialize(animation);

        this.keyFrameAnimation.play();
    }
}