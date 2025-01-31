import Link from "next/link";
import { BarChart2, Heart, Activity, MapPin, Calendar, ChartPie } from "lucide-react";
import BlurFade from "../components/ui/blur-fade";

const BentoGrid = () => {
  const items = [
    {
      href: "/distance-time-year",
      label: "Distance - Time",
      description: "Monthly progress with detailed distance metrics",
      icon: BarChart2,
      gradient: "from-blue-100 to-purple-100"
    },
    {
      href: "/total-activity-time",
      label: "Total Activity Time",
      description: "Cumulative activity duration and patterns",
      icon: ChartPie,
      gradient: "from-green-100 to-cyan-100"
    },
    {
      href: "/calendar",
      label: "Activity Calendar",
      description: "View schedule and consistency",
      icon: Calendar,
      gradient: "from-orange-100 to-pink-100"
    },
    {
      href: "/map",
      label: "Map",
      description: "Visualize routes and places of activity",
      icon: MapPin,
      gradient: "from-red-100 to-yellow-100"
    },
  ];

  return (
    <div className="my-auto mt-8">
      <div className="mb-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">Welcome to the Activity Dashboard</h2>
      <p className="text-gray-600 text-center mb-10">
          Explore the different sections to track and visualize fitness progress.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {items.map((item, index) => (
          <BlurFade key={item.href} delay={index * 0.1}>
            <Link href={item.href} className="block">
              <div className={`relative p-6 rounded-xl bg-gradient-to-br ${item.gradient} 
                shadow-lg backdrop-blur-sm 
                transition-all duration-300 
                hover:scale-[1.02] hover:shadow-2xl
                group hover:bg-gradient-to-tl`}>
                <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20" />
                <div className="relative flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <item.icon className="w-8 h-8 text-black" />
                    <h3 className="text-lg font-bold text-black">{item.label}</h3>
                  </div>
                  <p className="text-sm text-black/70 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          </BlurFade>
        ))}
      </div>
    </div>
  );
};

export default BentoGrid;