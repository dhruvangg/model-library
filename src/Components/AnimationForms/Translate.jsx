import { useForm } from "react-hook-form"
import { useHoopsContext } from "../../Context/HoopsContext"
import { useEffect } from "react"
import { useAnimationContext } from "../../Context/AnimationContext"

function Translate() {
    const { selectedNodeIds } = useHoopsContext()
    const { addAnimation } = useAnimationContext();

    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm()

    useEffect(() => {
        const currentValues = getValues();
        reset({
            ...currentValues,
            parts: selectedNodeIds.join(","),
        })
    }, [selectedNodeIds])


    const createTranslateAnimation = (data) => {
        const parts = data.parts.split(",").map(part => Number(part.trim()));
        const direction = {
            x: data.direction === 'X' ? 1 : 0,
            y: data.direction === 'Y' ? 1 : 0,
            z: data.direction === 'Z' ? 1 : 0,
        }
        const distance = parseFloat(data.distance);
        const duration = parseFloat(data.duration);
        const delay = parseFloat(data.delay);
        const animation = {
            type: "translation",
            nodes: parts,
            vector: direction,
            distance: distance,
            duration: duration,
            startTime: delay,
        };

        console.log("Animation Data:", animation);
        addAnimation(animation)
    }

    return (
        <form className="p-4 bg-white" onSubmit={handleSubmit(createTranslateAnimation)}>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Parts:</label>
                <input {...register("parts", { required: true })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4" placeholder="Part IDs (comma separated)" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Translation Vector:</label>
                <label>
                    <input type="radio" {...register("direction")} value="X" className="mr-2" defaultChecked />
                    <span>X</span>
                </label>
                <label className="ml-4">
                    <input type="radio" {...register("direction")} value="Y" className="mr-2" />
                    <span>Y</span>
                </label>
                <label className="ml-4">
                    <input type="radio" {...register("direction")} value="Z" className="mr-2" />
                    <span>Z</span>
                </label>
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Distance:</label>
                <input type="number" {...register("distance", { required: true })} name="distance" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Distance to translate" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Duration (s):</label>
                <input type="number" {...register("duration", { required: true })} min={1} name="duration" defaultValue={1} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Animation duration in milliseconds" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Delay (s):</label>
                <input type="number" {...register("delay", { required: true })} min={0} name="delay" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Delay before animation starts" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Save
            </button>
        </form>
    )
}

export default Translate