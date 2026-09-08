import React from "react";
import { ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-3">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 text-xs text-slate-500">
        <div>
          <span className="font-semibold text-slate-700">BlazeUp HROS</span> • Employee Offboarding Automation Engine
        </div>
        <div className="flex items-center gap-1.5">
          <span>Contact developer:</span>
          <a
            href="https://shaikraiyan.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-slate-800 hover:text-slate-950 underline underline-offset-4 transition-colors"
          >
            Shaik Raiyan
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
