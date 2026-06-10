import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddFarm from "./pages/AddFarm";
import Irrigation from "./pages/Irrigation";
import Farm from "./pages/Farm";
import PageTransition from "./components/PageTransition";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />

        <Route
          path="/farms"
          element={
            <PageTransition>
              <Farm />
            </PageTransition>
          }
        />

        <Route
          path="/addfarm"
          element={
            <PageTransition>
              <AddFarm />
            </PageTransition>
          }
        />

        <Route
          path="/irrigation"
          element={
            <PageTransition>
              <Irrigation />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;