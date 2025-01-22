// src/components/Data2.tsx

"use client";
import DailyActivityCalendarComponent from "@/components/DailyActivityCalendar";
import BlurFade from "@/components/ui/blur-fade";

export default function Data2() {
    return (
        <div className="flex items-center justify-center p-8 sm:p-20 w-full">
            <BlurFade>
                <DailyActivityCalendarComponent />
            </BlurFade>
        </div>
    );
}
