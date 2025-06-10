import { Component } from 'react'
import ViewerComponent from './ViewerComponent';
import model from '../models/assembly.scs';
import ModelTreeComponent from './ModelTreeComponent';
import * as Communicator from '../lib/hoops-web-viewer-monolith.mjs';
import AnimationCreatorPanel from './AnimationCreator/AnimationCreatorPanel';
import { AnimationSteps, AnimationController } from '../lib/Animation';
import { HandleOperator, NodesSelectOperator, PointSelectOperator, VectorSelectOperator } from '../lib/Operator';
import { AnimationContext } from '../Context/AnimationContext';
import { getTreeData } from '../lib/functions';
import AnimationStepGrid from './AnimationCreator/AnimationStepGrid';


export default class HoopsViewer extends Component {
  static contextType = AnimationContext
  constructor(props) {
    super(props);

    this.hwvReady = this.hwvReady.bind(this);
    this.handleAnimation = this.handleAnimation.bind(this);

    this.animationSteps = null;
    this.animationController = null;

    this.pointSelectorOperator = null;
    this.pointSelectorOperatorHandle = null;

    this.handleOperator = null;
    this.HandleOperatorHandle = null;
    this.nodesSelectOperator = null;
    this.nodesSelectOperatorHandle = null;
    this.vectorSelectOperator = null;
    this.vectorSelectOperatorHandle = null;

    this.state = {
      hwv: null,
      isStructureReady: false,
      defaultCamera: null,
    };
  }

  hwvReady(newHWV) {
    this.setState({
      hwv: newHWV,
    }, () => {

      this.animationSteps = new AnimationSteps(this.state.hwv);
      this.animationController = new AnimationController(this.state.hwv, this.animationSteps);

      this.pointSelectorOperator = new PointSelectOperator(this.state.hwv);
      this.pointSelectorOperatorHandle = this.state.hwv.operatorManager.registerCustomOperator(this.pointSelectorOperator);

        // _this._handleOp = new HandleOperator(this.state.hwv, _this._animationSteps);
        // _this._handleOpHandel = this.state.hwv.operatorManager.registerCustomOperator(_this._handleOp);
        
        this.nodesSelectOperator = new NodesSelectOperator(this.state.hwv, '');
        this.nodesSelectOperatorHandle = this.state.hwv.operatorManager.registerCustomOperator(this.nodesSelectOperator);
        
        this.vectorSelectOperator = new VectorSelectOperator(this.state.hwv);
        this.vectorSelectOperatorHandle = this.state.hwv.operatorManager.registerCustomOperator(this.vectorSelectOperator);

      this.state.hwv.setCallbacks({
        sceneReady: () => { },
        modelStructureReady: async () => {
          const { hwv } = this.state;
          const modelTree = getTreeData(hwv);
          const [treeData, arrayData, pmiData] = modelTree;
          await hwv.model.setNodesVisibility(pmiData, false);
          await hwv.view.fitWorld();

          // console.log(hwv);
          

          // hwv.operatorManager.push(this.pointSelectorOperatorHandle)
          // hwv.operatorManager.push(this.nodesSelectOperatorHandle)
          hwv.operatorManager.push(this.vectorSelectOperatorHandle)

          this.setState({
            isStructureReady: true,
            defaultCamera: hwv.view.getCamera().toJson(),
          });
        }
      });
    });
  }

  handleAnimation = async () => {
    if (!this.state.hwv || !this.animationSteps || !this.animationController) return;

    const { animation } = this.context;

    for (const a of animation) {
      this.animationSteps.addStep(a);
    }

    this.animationController.rewind();
    await this.animationController.play();
  }


  render() {
    const { hwv } = this.state;

    return (
      <div className="flex flex-col">
        <div className='flex border-b'>
          <div className="flex-1 border-end relative min-h-[70vh] border-r">
            <ViewerComponent modelUri={model} hwvReady={this.hwvReady}></ViewerComponent>
            {(this.context.animation && this.context.animation.length > 0) && <div className='absolute bottom-0 start-0 w-full flex justify-center items-center'>
              <button className="btn btn-primary p-3 cursor-pointer" onClick={this.handleAnimation}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                </svg>
              </button>
            </div>}
          </div>
          <div className="flex-1">
            {hwv && <AnimationCreatorPanel viewer={hwv} />}
          </div>
        </div>
        <AnimationStepGrid />
      </div>
    )
  }
}