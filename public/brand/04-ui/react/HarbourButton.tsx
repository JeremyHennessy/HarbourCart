import type { ButtonHTMLAttributes, ReactNode } from "react";
import "../css/harbourcart-components.css";
type Variant = "primary" | "secondary" | "local" | "ghost";
export function HarbourButton({variant="primary",children,...props}: ButtonHTMLAttributes<HTMLButtonElement> & {variant?:Variant;children:ReactNode}) {
  return <button className={`hc-btn hc-btn--${variant}`} {...props}>{children}</button>;
}
