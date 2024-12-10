import { FaProjectDiagram, FaUsers, FaTasks } from "react-icons/fa";
import { MdDataUsage } from "react-icons/md";
import BlurFade from "@/components/ui/blur-fade";

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 space-y-12 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center space-y-4">
        <BlurFade>
        <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
          About Our Project
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Welcome to Group 7's Project!
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-400">
          This project visualizes data from the Strava dataset of our professor, 
          <span className="italic"> Andreas Butz</span>.
        </p>
        <a
          href="http://www.cip.ifi.lmu.de/~oechsner/iv2425/Strava-export_47979926.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline text-lg"
        >
          Download the Strava Dataset
        </a>
        </BlurFade>
      </section>

       {/* Team Section */}
       <BlurFade delay={0.1} className="w-full max-w-4xl">
       <section className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
        <div className="flex items-center space-x-4">
          <FaUsers className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            Meet the Team
          </h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-5 text-lg text-gray-700 dark:text-gray-300">
          <li>Daniel Högen</li>
          <li>Meltem Özdag</li>
          <li>Moritz Reichelt</li>
          <li>Igor Suslov</li>
          <li>Yunus Emre Yavuz</li>
        </ul>     
      </section>
      </BlurFade>

      {/* Project Progress Section */}
      <BlurFade delay={0.2} className="w-full max-w-4xl">
      <section className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
        <div className="flex items-center space-x-4">
          <FaProjectDiagram className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            Project Progress
          </h2>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          WIP. We have completed the initial setup and are currently working on the core features. 
          Now our focus lays on understanding the data to create meaningful and interactive visualizations.
        </p>
      </section>
      </BlurFade>

      {/* Features Section */}
      <BlurFade delay={0.3} className="w-full max-w-4xl">
      <section className= "bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
        <div className="flex items-center space-x-4">
          <FaTasks className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            Planned Features & Timeline
          </h2>
        </div>
        <ul className="list-disc list-inside space-y-4 text-lg text-gray-700 dark:text-gray-300">
          <li>
            <strong>Soon: Basic Time / Activity Graph:</strong> Interactive graph
            with filtering functionality.
          </li>
          <li>
            <strong>Interactive Map:</strong> Visualizing the data on a map.
          </li>
          <li>
            <strong>(Maybe) 3D Globe:</strong> An Interactive Activity Map.
          </li>
          <li>
            <strong>...and more</strong> 
          </li>
        </ul>
      </section>
      </BlurFade>
    </div>
  );
}
