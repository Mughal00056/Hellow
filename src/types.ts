/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type LucideIcon } from 'lucide-react';

export interface FileItem {
  id: string;
  name: string;
  language: string;
  content: string;
  icon?: LucideIcon;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
  icon: string;
}

export const INITIAL_FILES: FileItem[] = [
  {
    id: '1',
    name: 'App.tsx',
    language: 'typescript',
    content: `export default function App() {\n  return (\n    <div className="p-4">\n      <h1 className="text-2xl font-bold">Hello World</h1>\n      <p>Edit this file to see changes.</p>\n    </div>\n  );\n}`,
  },
  {
    id: '2',
    name: 'styles.css',
    language: 'css',
    content: `body {\n  background-color: #0d1117;\n  color: #c9d1d9;\n  font-family: -apple-system, system-ui, sans-serif;\n}`,
  },
  {
    id: '3',
    name: 'readme.md',
    language: 'markdown',
    content: `# Mobile IDE\n\nA full VS Code experience on your mobile device.\n\n## Features\n- Monaco Editor\n- AI Assistant\n- Extensions`,
  }
];
