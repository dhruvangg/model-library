import React, { useState } from "react"
import { HomeIcon, TranslateIcon, CameraIcon, BlinkIcon, FadeOutIcon, RotateIcon, ColorIcon } from "../Icons";
import { Blink, Camera, Translate, Fade, Color } from "../AnimationForms";

const Items = [
    { id: 1, name: "home", icon: <HomeIcon /> },
    { id: 2, name: "camera", icon: <CameraIcon /> },
    { id: 3, name: "translate", icon: <TranslateIcon /> },
    { id: 4, name: "rotate", icon: <RotateIcon />, },
    { id: 5, name: "fadeOut", icon: <FadeOutIcon /> },
    { id: 6, name: "blink", icon: <BlinkIcon /> },
    { id: 7, name: "color", icon: <ColorIcon /> },
]

function AnimationCreatorPanel({ viewer }) {
    const [activeItem, setActiveItem] = useState(null)
    const handleItemClick = (item) => setActiveItem(activeItem === item ? null : item);

    return (
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
            <ul className='flex'>
                {Items.map((item) => (
                    <li key={item.id}>
                        <button className={`p-2 cursor-pointer ${activeItem === item.name ? 'bg-blue-500 text-white' : ''}`} onClick={() => handleItemClick(item.name)}>
                            {item.icon}
                        </button>
                    </li>
                ))}
            </ul>
            <RenderAnimationForm activeItem={activeItem} viewer={viewer} />
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
            return <Fade />;
        case 'blink':
            return <Blink />;
        case 'color':
            return <Color />;
        default:
            return null;
    }
}
