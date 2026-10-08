import { Printer, Stethoscope } from "lucide-react";
import { DOCTOR_QUESTIONS } from "@/data/doctorQuestions";
import "./doctor-print.css";

/**
 * "Questions for your doctor" card. "Print / Save as PDF" prints only this card
 * (see doctor-print.css; the scope class is added just for that print job).
 */
export default function DoctorQuestionsCard({
  productName,
  id = "doctor-questions",
  className = "",
}: {
  productName?: string;
  id?: string;
  className?: string;
}) {
  const handlePrint = () => {
    const root = document.documentElement;
    const cleanup = () => {
      root.classList.remove("pf-print-doctor");
      window.removeEventListener("afterprint", cleanup);
    };
    root.classList.add("pf-print-doctor");
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Some browsers don't fire afterprint reliably.
    setTimeout(cleanup, 1000);
  };

  return (
    <section
      id={id}
      className={`pf-doctor-card scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="pf-print-only mb-4 text-xs uppercase tracking-widest text-gray-500">
        Pure Fire Nutritional · purefirenutritional.com
      </div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-gray-400 pf-no-print" aria-hidden />
          <h2 id={`${id}-title`} className="text-lg font-semibold text-gray-900">
            Questions for your doctor{productName ? ` about ${productName}` : ""}
          </h2>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="pf-no-print inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" aria-hidden />
          Print / Save as PDF
        </button>
      </div>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
        {DOCTOR_QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
    </section>
  );
}
