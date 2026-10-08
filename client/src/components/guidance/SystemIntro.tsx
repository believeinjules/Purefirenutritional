import { useState } from "react";
import { Link } from "wouter";
import { SYSTEM_HELP_LINE, type ShopSystem } from "@/data/systems";
import DoctorQuestionsCard from "./DoctorQuestionsCard";

/** "Is this for you?" intro for a system. Renders nothing if the intro copy is empty. */
export default function SystemIntro({ system }: { system: ShopSystem }) {
  const [showQuestions, setShowQuestions] = useState(false);
  if (!system.intro.trim()) return null;
  return (
    <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6" data-testid="system-intro">
      <p className="section-label mb-2">Is this for you?</p>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{system.name}</h2>
      <p className="text-gray-600 leading-relaxed max-w-2xl">{system.intro}</p>
      <p className="mt-3 text-sm text-gray-500">
        {SYSTEM_HELP_LINE.before}{" "}
        <Link href="/ai-assistant" className="text-orange-700 hover:underline">
          {SYSTEM_HELP_LINE.askPeppy}
        </Link>
        {SYSTEM_HELP_LINE.middle}{" "}
        <a
          href="#doctor-questions"
          onClick={() => setShowQuestions(true)}
          className="text-orange-700 hover:underline"
          aria-expanded={showQuestions}
        >
          {SYSTEM_HELP_LINE.doctorQuestions}
        </a>{" "}
        {SYSTEM_HELP_LINE.after}
      </p>
      {showQuestions && <DoctorQuestionsCard className="mt-4" />}
    </section>
  );
}
