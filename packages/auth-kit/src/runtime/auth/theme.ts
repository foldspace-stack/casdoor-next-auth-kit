import type { CSSProperties, ReactNode } from 'react';

export interface AuthThemeTokens {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  ring?: string;
  radius?: string;
  shadow?: string;
  fontFamily?: string;
  pageBackdrop?: string;
}

export interface AuthThemeProviderProps {
  children: ReactNode;
  theme?: AuthThemeTokens;
  className?: string;
  style?: CSSProperties;
}

function setVar(style: Record<string, string>, name: string, value: string | undefined) {
  if (value) {
    style[name] = value;
  }
}

export function buildAuthThemeStyle(theme: AuthThemeTokens = {}): CSSProperties {
  const style: Record<string, string> = {
    '--background': '#ffffff',
    '--foreground': '#0f172a',
    '--card': 'rgba(255, 255, 255, 0.92)',
    '--card-foreground': '#0f172a',
    '--muted': '#f8fafc',
    '--muted-foreground': '#475569',
    '--border': 'rgba(148, 163, 184, 0.24)',
    '--input': 'rgba(255, 255, 255, 0.98)',
    '--primary': '#0f172a',
    '--primary-foreground': '#ffffff',
    '--secondary': '#e2e8f0',
    '--secondary-foreground': '#0f172a',
    '--accent': '#eef2ff',
    '--accent-foreground': '#1d4ed8',
    '--destructive': '#ef4444',
    '--destructive-foreground': '#ffffff',
    '--ring': 'rgba(59, 130, 246, 0.28)',
    '--radius': '1rem',
    '--shadow': '0 22px 60px rgba(15, 23, 42, 0.14)',
    '--font-family': '"Inter", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
    '--page-backdrop':
      'radial-gradient(circle at top, rgba(59, 130, 246, 0.12) 0, rgba(59, 130, 246, 0) 36%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
  };

  setVar(style, '--background', theme.background);
  setVar(style, '--foreground', theme.foreground);
  setVar(style, '--card', theme.card);
  setVar(style, '--card-foreground', theme.cardForeground);
  setVar(style, '--muted', theme.muted);
  setVar(style, '--muted-foreground', theme.mutedForeground);
  setVar(style, '--border', theme.border);
  setVar(style, '--input', theme.input);
  setVar(style, '--primary', theme.primary);
  setVar(style, '--primary-foreground', theme.primaryForeground);
  setVar(style, '--secondary', theme.secondary);
  setVar(style, '--secondary-foreground', theme.secondaryForeground);
  setVar(style, '--accent', theme.accent);
  setVar(style, '--accent-foreground', theme.accentForeground);
  setVar(style, '--destructive', theme.destructive);
  setVar(style, '--destructive-foreground', theme.destructiveForeground);
  setVar(style, '--ring', theme.ring);
  setVar(style, '--radius', theme.radius);
  setVar(style, '--shadow', theme.shadow);
  setVar(style, '--font-family', theme.fontFamily);
  setVar(style, '--page-backdrop', theme.pageBackdrop);
  return style as CSSProperties;
}

export function mergeClassName(...values: Array<string | null | undefined | false>): string | undefined {
  const filtered = values.filter((value): value is string => Boolean(value && value.trim()));
  return filtered.length ? filtered.join(' ') : undefined;
}

