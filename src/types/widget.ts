export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  icon: string;
  enabled: boolean;
  gridSpan?: {
    cols: number; // 1, 2, or 3
    rows?: number;
  };
}

export interface WidgetProps {
  isKiosk?: boolean;
  className?: string;
}

