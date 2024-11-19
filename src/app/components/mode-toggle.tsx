'use client'
import {SunIcon, MoonIcon} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="flex items-center space-x-1 rounded-md hover:text-white/60"
    >
      {isDarkMode ? <SunIcon className="size-10"  /> : <MoonIcon className="size-10" />}
    </button>
  );
}