import { Navbar } from "@/components/layout/Navbar";
import { ComponentSelector } from "@/components/practice/ComponentSelector";

export default function PracticePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#FAFAFA]">Choose a component</h1>
          <p className="mt-1 text-sm text-[#71717A]">
            Select the area you want to practise. You can filter by topic, difficulty, and year on the next page.
          </p>
        </div>

        <ComponentSelector />
      </main>
    </>
  );
}
