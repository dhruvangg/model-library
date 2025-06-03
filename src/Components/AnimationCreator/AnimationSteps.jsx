import { useAnimationContext } from "../../Context/AnimationContext"

const AnimationSteps = () => {
    const { animation } = useAnimationContext();

    if (!animation || animation.length === 0) return null;

    return (
        <table>
            <thead>
                <tr className="p-2 bg-gray-200">
                    <th className="text-gray-600 p-2">Type</th>
                    <th className="text-gray-600 p-2">Nodes</th>
                    <th className="text-gray-600 p-2">Vector</th>
                    <th className="text-gray-600 p-2">Distance</th>
                    <th className="text-gray-600 p-2">Duration</th>
                    <th className="text-gray-600 p-2">Start Time</th>
                </tr>
            </thead>
            <tbody>
                {animation.map((el) => {
                    return (
                        <tr key={el.id} className="p-2 border-b hover:bg-gray-100 cursor-pointer">
                            <td className="text-gray-500 p-2 capitalize">{el.type}</td>
                            <td className="text-gray-700 p-2">{JSON.stringify(el.nodes)}</td>
                            <td className="text-gray-700 p-2">{JSON.stringify(el.vector)}</td>
                            <td className="text-gray-700 p-2">{el.distance}</td>
                            <td className="text-gray-700 p-2">{el.duration}</td>
                            <td className="text-gray-700 p-2">{el.startTime}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default AnimationSteps