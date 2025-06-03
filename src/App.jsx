import HoopsViewer from "./Components/HoopsViewer"
import AnimationProvider from "./Context/AnimationContext"
import HoopsProvider from "./Context/HoopsContext"
// import './App.css'

function App() {
  return (
    <HoopsProvider>
      <AnimationProvider>
        <HoopsViewer />
      </AnimationProvider>
    </HoopsProvider>
  )
}

export default App