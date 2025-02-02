import { FaProjectDiagram, FaUsers, FaTasks, FaDownload, FaGitlab, FaStackExchange, FaLayerGroup } from "react-icons/fa";
import { MdDataUsage } from "react-icons/md";
import { SiNextdotjs, SiVercel, SiPython } from "react-icons/si";
import { Gitlab, ChartBar, Layers } from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 space-y-12 text-gray-900 dark:text-gray-100 mt-8">
      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center space-y-4">
        <BlurFade>
        <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
          About Our Project
        </h1>
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

      {/* About Section */}
      <BlurFade delay={0.2} className="w-full max-w-4xl">
      <section className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
        <div className="flex items-center space-x-4">
          <FaProjectDiagram className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            What is this?
          </h2>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          This project is part of the course "Information Visualization" at LMU Munich. 
          It aims to provide an interactive and engaging way to explore the Strava dataset of our professor, 
          <span className="italic"> Andreas Butz</span>.
        </p>
        <div className="flex space-x-4">
          <a
            href="http://www.cip.ifi.lmu.de/~oechsner/iv2425/Strava-export_47979926.zip"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaDownload className="mr-2" />
            Download Strava Dataset
          </a>
          <a
            href="https://gitlab.lrz.de/iv2425-projects/team-07"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            <Gitlab className="mr-2" />
            GitLab Repository
          </a>
        </div>
      </section>
      </BlurFade>

      {/* Data Section */}
      <BlurFade delay={0.3} className="w-full max-w-4xl">
      <section className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
        <div className="flex items-center space-x-4">
          <MdDataUsage className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            Data Overview
          </h2>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          The dataset contains information about activities such as running, cycling, 
          and swimming. It includes details like distance, duration, and calories burned.
        </p>
      </section>
      </BlurFade>

      {/* Features Section */}
      <BlurFade delay={0.4} className="w-full max-w-4xl">
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
          <div className="flex items-center space-x-4">
            <FaTasks className="text-4xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">Features</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
            <li><strong>Monthly Activity Charts:</strong> Line and bar charts display monthly distances.</li>
            <li><strong>Pie Charts:</strong> One shows total activity time; another illustrates distance per activity.</li>
            <li><strong>Activity Calendar:</strong> A GitHub-style calendar with daily hour breakdowns.</li>
            <li><strong>Interactive Map:</strong> Visualizes activity paths and routes in real-time.</li>
            <li><strong>Scatter Plot:</strong> Correlates heart rate with pace for performance insights.</li>
            <li><strong>Calorie vs Food Bar Chart:</strong> Compares calorie expenditure against food consumption.</li>
            <li><strong>Switch between Datasets:</strong> Live switching between years and different datasets.</li>
            <li><strong>Bonus:</strong> Butz Gallery</li>
          </ul>
        </section>
      </BlurFade>

      {/* Tech Stack Section */}
      <BlurFade delay={0.5} className="w-full max-w-4xl">
        <section className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-4">
          <div className="flex items-center space-x-4">
          <FaLayerGroup className="text-4xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
              Tech Stack
            </h2>
            <SiNextdotjs className="text-4xl text-black-600 dark:text-black-400" />
            <SiVercel className="text-4xl text-black-600 dark:text-black-400" />
            <ChartBar className="text-4xl" />
            <SiPython className="text-4xl" />
           
          </div>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
            <li><strong>Next.js:</strong> Frontend and API routes</li>
            <li><strong>Vercel:</strong> Deployment platform</li>
            <li><strong>Recharts:</strong> Data charts and visualizations</li>
            <li><strong>Python:</strong> Data processing and preparation</li>
          </ul>
        </section>
      </BlurFade>
    </div>
  );
}
