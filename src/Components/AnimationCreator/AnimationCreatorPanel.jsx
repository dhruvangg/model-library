import React, { useState } from "react"
import Translate from "../AnimationForms/Translate";
import { HomeIcon, TranslateIcon, CameraIcon, BlinkIcon, FadeOutIcon, RotateIcon } from "../Icons";
import Camera from "../AnimationForms/Camera";
import AnimationSteps from "./AnimationSteps";

const Items = [
    { id: 1, name: "home", icon: <HomeIcon /> },
    { id: 2, name: "camera", icon: <CameraIcon /> },
    { id: 3, name: "translate", icon: <TranslateIcon /> },
    { id: 4, name: "rotate", icon: <RotateIcon />, },
    { id: 5, name: "fadeOut", icon: <FadeOutIcon /> },
    { id: 6, name: "blink", icon: <BlinkIcon /> }
]

function AnimationCreatorPanel({ viewer }) {
    const [activeItem, setActiveItem] = useState(null)
    const handleItemClick = (item) => setActiveItem(activeItem === item ? null : item);

    // const rootNode = viewer.model.getAbsoluteRootNode();
    // console.log(viewer.model.setNodesVisibility(rootNode, true));

    return (
        <div className="flex flex-col h-full justify-between">
            <div>
                <ul className='flex'>
                    {Items.map((item) => (
                        <li key={item.id}>
                            <button className={`p-2 cursor-pointer ${activeItem === item.id ? 'bg-blue-500 text-white' : ''}`} onClick={() => handleItemClick(item.name)}>
                                {item.icon}
                            </button>
                        </li>
                    ))}
                </ul>
                <RenderAnimationForm activeItem={activeItem} viewer={viewer} />
            </div>

            <AnimationSteps />
        </div>
    )
}

export default React.memo(AnimationCreatorPanel)


function RenderAnimationForm({ activeItem, ...rest }) {
    switch (activeItem) {
        case 'home':
            return <div>Home</div>;
        case 'translate':
            return <Translate />;
        case 'camera':
            return <Camera {...rest} />;
        case 'rotate':
            return <div>Rotate</div>;
        case 'fadeOut':
            return <div>FadeOut</div>;
        case 'blink':
            return <div>Blink</div>;
        default:
            return null;
    }
}
