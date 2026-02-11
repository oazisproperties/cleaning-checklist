"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChecklist } from "@/lib/checklists";

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.property as string;
  const checklist = getChecklist(slug);

  const [checked, setChecked] = useState<Record<string, Set<number>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleItem = useCallback((section: string, index: number) => {
    setChecked((prev) => {
      const sectionSet = new Set(prev[section] || []);
      if (sectionSet.has(index)) {
        sectionSet.delete(index);
      } else {
        sectionSet.add(index);
      }
      return { ...prev, [section]: sectionSet };
    });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const updateNotes = useCallback((section: string, value: string) => {
    setNotes((prev) => ({ ...prev, [section]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!checklist) return;
    setStatus("submitting");
    setErrorMessage("");

    const sections = checklist.sections.map((section) => {
      const sectionChecked = checked[section.name] || new Set();
      return {
        name: section.name,
        items: section.items.map((item, i) => ({
          text: item,
          done: sectionChecked.has(i),
        })),
        notes: notes[section.name]?.trim() || "",
      };
    });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property: checklist.name, sections }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setErrorMessage(data.error || "Failed to submit.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (!checklist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-lg text-gray-600">Property not found.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-teal hover:text-teal-dark underline cursor-pointer"
        >
          Go Back
        </button>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-bold">Checklist Submitted</p>
          <p className="text-sm text-gray-500 text-center">
            A summary has been emailed to the admin.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 px-8 py-3 text-lg font-semibold text-white bg-teal hover:bg-teal-dark rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-teal hover:text-teal-dark cursor-pointer"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-teal">
            {checklist.name}
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          {checklist.sections.map((section) => {
            const sectionChecked = checked[section.name] || new Set();
            const doneCount = sectionChecked.size;
            const totalCount = section.items.length;
            const isCollapsed = collapsed[section.name] ?? true;
            const allDone = doneCount === totalCount;

            return (
              <div key={section.name} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection(section.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer transition-colors ${
                    allDone ? "bg-teal/20" : "bg-teal"
                  }`}
                >
                  <span className={`font-semibold text-sm ${allDone ? "text-teal-dark" : "text-white"}`}>
                    {section.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${allDone ? "text-teal-dark" : "text-white/80"}`}>
                      {doneCount}/{totalCount}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isCollapsed ? "" : "rotate-180"} ${
                        allDone ? "text-teal-dark" : "text-white"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {section.items.map((item, i) => {
                        const isDone = sectionChecked.has(i);
                        return (
                          <label
                            key={i}
                            className="flex items-start gap-3 py-2 cursor-pointer active:bg-cream/50 rounded-lg px-1 -mx-1"
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleItem(section.name, i)}
                              className="mt-0.5 w-5 h-5 min-w-5 rounded border-gray-300 text-teal accent-teal cursor-pointer"
                            />
                            <span className={`text-sm leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-700"}`}>
                              {item}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-cream-dark">
                      <textarea
                        value={notes[section.name] || ""}
                        onChange={(e) => updateNotes(section.name, e.target.value)}
                        placeholder="Add notes..."
                        rows={2}
                        className="w-full text-sm border border-cream-dark rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {errorMessage && status === "error" && (
          <p className="mt-4 text-red-600 text-sm text-center">{errorMessage}</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-cream/90 backdrop-blur-sm border-t border-cream-dark">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={status === "submitting"}
            className="w-full py-4 text-lg font-bold text-white bg-orange hover:bg-orange-dark rounded-xl transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-lg"
          >
            {status === "submitting" ? "Submitting..." : "Submit Checklist"}
          </button>
        </div>
      </div>
    </main>
  );
}
