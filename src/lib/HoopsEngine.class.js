import * as Communicator from './hoops-web-viewer-monolith.mjs';

export default class HoopsEngine {
    constructor(containerId, viewerOptions = {}) {
        this.containerId = containerId;
        this.viewerOptions = viewerOptions;
        this.viewer = null;
        this.initialized = false;

        this.viewer = new Communicator.WebViewer({
            containerId: this.containerId,
            ...this.viewerOptions
        });

        this.viewer.start();

    }

    getViewer() {
        return this.viewer;
    }

    async resetView() {
        if (this.viewer) {
            await this.viewer.view.fitWorld();
        }
    }
}
