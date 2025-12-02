"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export default function LanguageSwitcher() {
  const [activeLang, setActiveLang] = useState("fr");

  // Setup Google Translate once
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure hidden container exists
    let container = document.getElementById("google_translate_element");
    if (!container) {
      container = document.createElement("div");
      container.id = "google_translate_element";
      container.style.display = "none";
      document.body.appendChild(container);
    }

    // Already loaded
    if (window.google && window.google.translate) return;

    // Global callback used by Google script
    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-undef
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          includedLanguages: "fr,en,ar",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const scriptId = "google-translate-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function changeLanguage(langCode) {
    setActiveLang(langCode);

    if (typeof window === "undefined") return;
    const combo = document.querySelector("select.goog-te-combo");
    if (!combo) return;

    combo.value = langCode;
    combo.dispatchEvent(new Event("change"));
  }

  return (
    <Card className="py-1 px-0">
     
      <CardContent className="px-1">
      {LANGS.map(({ code, label }) => (
        <Button
          key={code}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => changeLanguage(code)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeLang === code
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {label}
        </Button>
      ))}
      </CardContent>
    </Card>
  );
}
