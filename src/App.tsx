import {useEffect} from "react";
import {createHashRouter, createRoutesFromElements, Route, RouterProvider} from 'react-router-dom';
import {useLocalStorage} from "usehooks-ts";

import HomePage from './pages/HomePage.tsx';
import DayNightImportCalc from "./pages/calc/DayNightImportCalc.tsx";


const router = createHashRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route index element={<HomePage/>}/>

      <Route path="calc">
        <Route path="day-night-import" element={<DayNightImportCalc/>}/>
      </Route>

    </Route>
  )
)

function App() {
  const [theme] = useLocalStorage('theme', 'dark');

  function applyTheme() {
    const htmlElement = document.querySelector('html');
    htmlElement?.setAttribute('data-bs-theme', theme);
  }

  useEffect(() => {
    applyTheme();
  }, [theme]);

  return (
    <>
      <RouterProvider router={router}/>
    </>
  );
}

export default App;
