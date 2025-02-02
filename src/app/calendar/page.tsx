"use client";
import DailyActivityCalendarComponent from "@/components/DailyActivityCalendar";
import BlurFade from "@/components/ui/blur-fade";
import Link from "next/link"; 
import { ArrowLeft } from "lucide-react";

export default function Data2() {
    return (
        <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
            <div className="text-center max-w-2xl">
                <div className="flex justify-center items-center mb-4">
                    <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="mr-1" /> Back
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mb-4">Activity Calendar</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Track your fitness journey through time. Each cell represents a day,
                    with color intensity showing your activity level - similar to GitHub's
                    contribution graph but for your workout achievements.
                </p>
            </div>
            <BlurFade>
                <DailyActivityCalendarComponent />
            </BlurFade>
        </div>
    );
}