import { InlineScript } from "./inline-script";

// Static string, no interpolation. Only the literal "dark" is trusted; any other
// stored value counts as no preference.
export const themeScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)){d.classList.add("dark")}if(window.matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("motion-ok")}}catch(e){}})()`;

export function ThemeScript() {
  return <InlineScript html={themeScript} />;
}
