import "./globals.css"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound"
import { Toaster } from "react-hot-toast";
import Ask from "./pages/Ask";
import Dashboard from "./pages/Dashboard";


function App() {


  return (
    <>
      <main className="h-screen flex">
        <Routes>
          <Route element={<Root />}>
            <Route index element={<Home />} />
            <Route path="/ask" element={<Ask/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Toaster position="top-center" />
    </>
  )
}

export default App
