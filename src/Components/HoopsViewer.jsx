import { Component } from 'react'
import ViewerComponent from './ViewerComponent';
import model from '../models/assembly.scs';
import ModelTreeComponent from './ModelTreeComponent';
import * as Communicator from '../lib/hoops-web-viewer-monolith.mjs';
import AnimationCreatorPanel from './AnimationCreator/AnimationCreatorPanel';
import { AnimationSteps, AnimationController } from '../lib/Animation';
import { AnimationContext } from '../Context/AnimationContext';
import { getTreeData } from '../lib/functions';

export default class HoopsViewer extends Component {
  static contextType = AnimationContext
  constructor(props) {
    super(props);

    this.hwvReady = this.hwvReady.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.changeOperator = this.changeOperator.bind(this);
    this.handleAnimation = this.handleAnimation.bind(this);

    this.animationSteps = null;
    this.animationController = null;

    this.state = {
      hwv: null,
      currentTab: 1,
      cameraStatus: null,
      operator: 'Orbit',
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

      this.state.hwv.setCallbacks({
        sceneReady: () => {
          this.setState({
            cameraStatus: this.state.hwv.view.getCamera().toJson(),
          });
        },
        modelStructureReady: async () => {
          const { hwv } = this.state;
          const modelTree = getTreeData(hwv);
          const [treeData, arrayData, pmiData] = modelTree;
          await hwv.model.setNodesVisibility(pmiData, false);
          await hwv.view.fitWorld();

          this.setState({
            isStructureReady: true,
            defaultCamera: hwv.view.getCamera().toJson(),
          });
        },
        camera: () => {
          this.setState({
            cameraStatus: this.state.hwv.view.getCamera().toJson(),
          });
        }
      });
    });
  }

  changeOperator(event) {
    this.setState({
      operator: event.target.value,
    }, () => {
      if (!this.state.hwv) return;
      this.state.hwv.operatorManager.clear();
      this.state.hwv.operatorManager.push(Communicator.OperatorId.Orbit);
      if (this.state.operator === "Area Select") {
        this.state.hwv.operatorManager.push(Communicator.OperatorId.AreaSelect);
      } else if (this.state.operator === "Select") {
        this.state.hwv.operatorManager.push(Communicator.OperatorId.Select);
      } else if (this.state.operator === "Measure") {
        this.state.hwv.operatorManager.push(Communicator.OperatorId.MeasurePointPointDistance);
      }
    });
  }

  changeTab(newTab) {
    this.setState({
      currentTab: newTab,
    });
  }

  handleAnimation = async () => {
    if (!this.state.hwv || !this.animationSteps || !this.animationController) return;

    // const animationSteps = new AnimationSteps(this.state.hwv);
    // const animationController = new AnimationController(this.state.hwv, animationSteps);

    const { animation } = this.context;

    for (const a of animation) {
      this.animationSteps.addStep(a);
    }

    this.animationController.rewind();
    await this.animationController.play();
  }


  render() {

    const navItem = (value, content) => {
      return <li className="nav-item">
        <button
          className={'nav-link ' + (this.state.currentTab === value ? 'active' : '')}
          onClick={() => { this.changeTab(value) }}
          type="button">{content}</button></li>;
    };
    const cameraStatusContent = this.state.cameraStatus == null ? <p>Unavailable</p> :
      <div>
        <p className="mb-0"><strong>Position: </strong>
          ({this.state.cameraStatus.position.x.toFixed(2)}, {this.state.cameraStatus.position.y.toFixed(2)}, {this.state.cameraStatus.position.z.toFixed(2)})
        </p>
        <p className="mb-0"><strong>Target: </strong>
          ({this.state.cameraStatus.target.x.toFixed(2)}, {this.state.cameraStatus.target.y.toFixed(2)}, {this.state.cameraStatus.target.z.toFixed(2)})
        </p>
        <p className="mb-0"><strong>Up: </strong>
          ({this.state.cameraStatus.up.x.toFixed(2)}, {this.state.cameraStatus.up.y.toFixed(2)}, {this.state.cameraStatus.up.z.toFixed(2)})
        </p>
        <p className="mb-0">
          <strong>Width: </strong> {this.state.cameraStatus.width.toFixed(2)} &nbsp;
          <strong>Height: </strong> {this.state.cameraStatus.height.toFixed(2)}
        </p>
        <p className="mb-0">
          <strong>Projection: </strong> {this.state.cameraStatus.projection.toFixed(2)} &nbsp;
          <strong>NearLimit: </strong> {this.state.cameraStatus.nearLimit.toFixed(2)}
        </p>
        <p className="mb-0"><strong>Class Name: </strong> {this.state.cameraStatus.className}</p>
      </div>;
    const homeTabContent = <div className={'tab-pane fade show ' + (this.state.currentTab === 1 ? 'active' : '')}>
      <h2>React Demo for Hoops Web Platform</h2>
      <h5>Operator</h5>
      <select className="form-select mb-3" value={this.state.operator} onChange={this.changeOperator}>
        <option value="Orbit">Orbit</option>
        <option value="Area Select">Area Select</option>
        <option value="Select">Select</option>
        <option value="Measure">Measure</option>
      </select>
      <h5>Camera Status</h5>
      {cameraStatusContent}
    </div>;
    const modelStructureTabContent = <div className={'tab-pane fade show ' + (this.state.currentTab === 2 ? 'active' : '')}>
      <h5>Model Structure</h5>
      {
        this.state.isStructureReady
          ? <ModelTreeComponent hwv={this.state.hwv}></ModelTreeComponent>
          : <p>Model structure is not ready</p>
      }
    </div>;

    const { hwv } = this.state;

    return (
      <div className="flex" style={{ height: "100vh" }}>
        <div className="flex-1 border-end relative">
          <ViewerComponent modelUri={model} hwvReady={this.hwvReady}></ViewerComponent>
          {(this.context.animation && this.context.animation.length > 0) && <div className='absolute bottom-0 start-0 w-full flex justify-center items-center'>
            <button className="btn btn-primary p-3 cursor-pointer" onClick={this.handleAnimation}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
              </svg>
            </button>
          </div>}
        </div>
        <div className="flex-1" style={{ height: "100vh" }}>
          {hwv && <AnimationCreatorPanel viewer={hwv} />}
          {/* <ul className="nav nav-tabs px-3">
            {navItem(1, "Home")}
            {navItem(2, "ModelStructure")}
          </ul>
          <div className="tab-content p-3">
            {homeTabContent}{modelStructureTabContent}
          </div> */}
        </div>
      </div>
    )
  }
}