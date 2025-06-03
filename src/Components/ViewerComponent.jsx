import { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Communicator from '../lib/hoops-web-viewer-monolith.mjs';
import { getTreeData } from '../lib/functions';
import { HoopsContext } from '../Context/HoopsContext';

class ViewerComponent extends Component {
    static contextType = HoopsContext;
    constructor(props) {
        super(props);
        this.viewerId = uuidv4();
    }

    componentDidMount() {
        const hwv = new Communicator.WebViewer({
            containerId: this.viewerId,
            endpointUri: this.props.modelUri,
        });
        hwv.setCallbacks({
            sceneReady: () => {
                var axisTriad = hwv.view.getAxisTriad();
                axisTriad.setAnchor(Communicator.OverlayAnchor.LowerRightCorner);
                axisTriad.enable();

                hwv.selectionManager.setPickTolerance(2);
                hwv.selectionManager.setSelectParentIfSelected(false);

                hwv.view.setBackgroundColor(Communicator.Color.white(), Communicator.Color.white());
            },
            selectionArray: async (selectionEvents) => {
                // const selectedNodeIds = selectionEvents.map(event => event.getSelection().getNodeId());
                // console.log(selectedNodeIds);
                
                let hightLightedNodes = [];

                const selectionManager = hwv.selectionManager;
                await selectionManager.each(async (selectedObj) => {
                    const nodeId = selectedObj.getNodeId();
                    hightLightedNodes.push(nodeId);
                })

                const { setSelectedNodeIds } = this.context;
                setSelectedNodeIds(hightLightedNodes)

                selectionManager.setNodeSelectionColor(Communicator.Color.yellow());
                selectionManager.setNodeSelectionOutlineColor(Communicator.Color.yellow());
                selectionManager.setNodeElementSelectionColor(Communicator.Color.red());
                selectionManager.setNodeElementSelectionOutlineColor(Communicator.Color.red());

            },
        });
        hwv.start();
        window.addEventListener('resize', () => {
            hwv.resizeCanvas();
        });
        this.props.hwvReady(hwv);
    }

    render() {
        // const { selectedNodeIds } = this.context;
        // console.log(selectedNodeIds);
        return (
            <div className="w-full h-full relative" id={this.viewerId}></div>
        );
    }
}

export default ViewerComponent;