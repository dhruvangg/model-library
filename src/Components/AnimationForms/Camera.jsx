import { useForm } from "react-hook-form";
import { useAnimationContext } from "../../Context/AnimationContext";

function Camera({ viewer }) {
    const { addAnimation } = useAnimationContext()
    const { register, handleSubmit } = useForm()

    const createCameraAnimation = (data) => {
        const camera = viewer.view.getCamera()
        const duration = parseFloat(data.duration);
        const delay = parseFloat(data.delay);
        addAnimation({ type: 'camera', startTime: delay, duration: duration, camera: camera.toJson() });
    }

    return (
        <form className="p-4 bg-white" onSubmit={handleSubmit(createCameraAnimation)}>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Duration (s):</label>
                <input type="number" {...register("duration", { required: true })} min={1} name="duration" defaultValue={1} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Animation duration in milliseconds" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Delay (s):</label>
                <input type="number" {...register("delay", { required: true })} min={0} name="delay" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Delay before animation starts" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Save Current Camera
            </button>
        </form>
    )
}

export default Camera