import Link from "next/link";
import { BarChart2, Heart, Activity, MapPin, Calendar, ChartPie } from "lucide-react";
import BlurFade from "../components/ui/blur-fade"; // Import BlurFade component

const BentoGrid = () => {
  const items = [
    { href: "/distance-time-year", label: "Distance - Time", icon: BarChart2 },
    { href: "/total-activity-time", label: "Total Activity Time", icon: ChartPie },
    { href: "/heart-speed", label: "Heart Rate - Speed", icon: Heart },
    { href: "/alt-heart", label: "Altitude - Heart Rate", icon: Activity },
    { href: "/times-holidays", label: "Times - Holidays", icon: Calendar },
    { href: "/map", label: "Map", icon: MapPin },
  ];

  return (
    <div className="my-auto grid grid-cols-2 gap-6 mt-8">
      {items.map((item, index) => (
        <BlurFade key={item.href} delay={index * 0.1}>
          <Link legacyBehavior href={item.href}>
            <a className="flex flex-col items-center p-6 border rounded-lg shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105 hover:shadow-xl dark:hover:bg-gray-800">
              <item.icon className="w-10 h-10 mb-3 text-blue-500" />
              <span className="text-lg font-semibold">{item.label}</span>
            </a>
          </Link>
        </BlurFade>
      ))}
    </div>
  );
};

export default BentoGrid;