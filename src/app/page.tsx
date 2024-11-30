import Image from "next/image";
import D3Graph from "../components/graph";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <D3Graph />
      </main>
      <footer className="row-start-3 flex justify-between w-full px-6">
        <span>IV Gruppe 07 WS 2024/2025</span>
      </footer>
    </div>
  );
}
