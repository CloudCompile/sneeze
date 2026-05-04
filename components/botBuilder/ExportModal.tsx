"use client";

import { useState } from "react";
import JSZip from "jszip";
import type { BotState } from "@/lib/botBuilder/types";
import {
  generateBotCode,
  generateRequirementsTxt,
  generateEnvExample,
  generateReadme,
} from "@/lib/botBuilder/codeGenerator";

interface ExportModalProps {
  state: BotState;
  onClose: () => void;
}

export function ExportModal({ state, onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Add bot.py
      const botCode = generateBotCode(state);
      zip.file("bot.py", botCode);

      // Add requirements.txt
      const requirements = generateRequirementsTxt();
      zip.file("requirements.txt", requirements);

      // Add .env.example
      const envExample = generateEnvExample();
      zip.file(".env.example", envExample);

      // Add README.md
      const readme = generateReadme(state.config.name);
      zip.file("README.md", readme);

      // Add .gitignore
      const gitignore = `# Environment variables
.env
.env.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
`;
      zip.file(".gitignore", gitignore);

      // Add main.py wrapper
      const mainPy = `#!/usr/bin/env python3
"""Entry point for the Discord bot."""

if __name__ == "__main__":
    from bot import bot
    bot.run()
`;
      zip.file("main.py", mainPy);

      // Generate and download
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.config.name.replace(/\s+/g, "-")}-bot.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      alert("Failed to export: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Export Your Bot
        </h2>

        <p className="text-sm text-slate-300 mb-4">
          This will download a ZIP file with all the code you need to run your
          bot:
        </p>

        <ul className="text-sm text-slate-400 space-y-1 mb-6 ml-4">
          <li>• <code className="text-slate-300 bg-slate-700/30 px-2 py-1 rounded">bot.py</code> - Your complete bot code</li>
          <li>• <code className="text-slate-300 bg-slate-700/30 px-2 py-1 rounded">requirements.txt</code> - Dependencies</li>
          <li>• <code className="text-slate-300 bg-slate-700/30 px-2 py-1 rounded">.env.example</code> - Environment template</li>
          <li>• <code className="text-slate-300 bg-slate-700/30 px-2 py-1 rounded">README.md</code> - Setup guide</li>
          <li>• <code className="text-slate-300 bg-slate-700/30 px-2 py-1 rounded">.gitignore</code> - Git configuration</li>
        </ul>

        <p className="text-xs text-slate-500 mb-6">
          Ready to deploy? Just add your Discord token to .env and run:
          <code className="block mt-1 text-slate-300 bg-slate-700/30 px-2 py-1 rounded">pip install -r requirements.txt && python bot.py</code>
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {isExporting ? "Exporting..." : "Download ZIP"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700/30 hover:bg-slate-600/30 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
