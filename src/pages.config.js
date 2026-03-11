/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ActiveWorkout from './pages/ActiveWorkout';
import Calculator from './pages/Calculator';
import Cardio from './pages/Cardio';
import EditWorkout from './pages/EditWorkout';
import ExerciseDetail from './pages/ExerciseDetail';
import Lifts from './pages/Lifts';
import LogWeight from './pages/LogWeight';
import Macros from './pages/Macros';
import Measurements from './pages/Measurements';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import WorkoutHistory from './pages/WorkoutHistory';
import WorkoutSummary from './pages/WorkoutSummary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActiveWorkout": ActiveWorkout,
    "Calculator": Calculator,
    "Cardio": Cardio,
    "EditWorkout": EditWorkout,
    "ExerciseDetail": ExerciseDetail,
    "Lifts": Lifts,
    "LogWeight": LogWeight,
    "Macros": Macros,
    "Measurements": Measurements,
    "Profile": Profile,
    "Settings": Settings,
    "WorkoutHistory": WorkoutHistory,
    "WorkoutSummary": WorkoutSummary,
}

export const pagesConfig = {
    mainPage: "Profile",
    Pages: PAGES,
    Layout: __Layout,
};