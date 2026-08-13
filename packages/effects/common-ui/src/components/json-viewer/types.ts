export interface JsonViewerProps {
  /** Data to display */
  value: any;
  /** Expand depth */
  expandDepth?: number;
  /** Whether copy is enabled */
  copyable?: boolean;
  /** Whether keys are sorted */
  sort?: boolean;
  /** Show border */
  boxed?: boolean;
  /** Theme */
  theme?: string;
  /** Whether expanded by default */
  expanded?: boolean;
  /** Time format function */
  timeformat?: (time: Date | number | string) => string;
  /** Preview mode */
  previewMode?: boolean;
  /** Show array indices */
  showArrayIndex?: boolean;
  /** Show double quotes on strings */
  showDoubleQuotes?: boolean;
}

export interface JsonViewerAction {
  action: string;
  text: string;
  trigger: HTMLElement;
}

export interface JsonViewerValue {
  value: any;
  path: string;
  depth: number;
  el: HTMLElement;
}

export interface JsonViewerToggle {
  /** Mouse event */
  event: MouseEvent;
  /** Current expanded state */
  open: boolean;
}
