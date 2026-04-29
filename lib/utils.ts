import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import JSZip from "jszip"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractWorkspaceId(input: string): string {
  if (!input) return '';
  
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    const pathParts = url.pathname.split('/');
    const workspaceIndex = pathParts.indexOf('workspace');
    if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1]) {
      return pathParts[workspaceIndex + 1];
    }
  } catch (e) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (match) {
      return match[0];
    }
  }

  return input;
}

export function downloadJson(data: any, fileName: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadZip(files: { name: string; content: any }[], zipName: string) {
  const zip = new JSZip();
  
  files.forEach(file => {
    const content = typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2);
    zip.file(`${file.name}.json`, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}`;
}
