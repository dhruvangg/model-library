import { useForm } from "react-hook-form";
import { useAnimationContext } from "../../Context/AnimationContext";
import { useHoopsContext } from "../../Context/HoopsContext";
import { useEffect } from "react";

export const Color = () => {
    const { selectedNodeIds } = useHoopsContext()
    const { addAnimation } = useAnimationContext()
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm()

    useEffect(() => {
        const currentValues = getValues();
        reset({
            ...currentValues,
            nodes: selectedNodeIds.join(","),
        })
    }, [selectedNodeIds])

    const createAnimation = (data) => {
        const nodes = data.nodes.split(",").map(part => Number(part.trim()));
        const duration = parseFloat(data.duration);
        const delay = parseFloat(data.delay);
        console.log({ type: 'color', startTime: delay, duration: duration, nodes, startColor: data.startColor, endColor: data.endColor });
        
        addAnimation({ type: 'color', startTime: delay, duration: duration, nodes, startColor: data.startColor, endColor: data.endColor });
    }

    return (
        <form className="p-4 bg-white" onSubmit={handleSubmit(createAnimation)}>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Parts:</label>
                <input {...register("nodes", { required: true })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4" placeholder="Part IDs (comma separated)" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Duration (s):</label>
                <input type="number" {...register("duration", { required: true })} min={1} name="duration" defaultValue={1} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Animation duration in milliseconds" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Delay (s):</label>
                <input type="number" {...register("delay", { required: true })} min={0} name="delay" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Delay before animation starts" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">Start Color:</label>
                <input {...register("startColor")} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4" placeholder="Part IDs (comma separated)" />
            </div>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">End Color:</label>
                <input {...register("endColor", { required: true })} defaultValue={'#FF0000'} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4" placeholder="Part IDs (comma separated)" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Save
            </button>
        </form>
    )
}