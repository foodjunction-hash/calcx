import { useEffect } from "react";
import styles from "./Privacy.module.css";

interface PrivacyProps {
  onClose: () => void;
  theme: "dark" | "light";
}

export function Privacy({ onClose, theme }: PrivacyProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Privacy Policy"
    >
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Privacy Policy</h1>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClose}
          aria-label="Close privacy policy"
        >
          ✕
        </button>
      </div>

      <div className={styles.body}>
        <h2>CALCX Privacy Policy</h2>
        <p className={styles.lastUpdated}>Last updated: October 11, 2026</p>

        <div className={styles.highlight}>
          <p>
            <strong>Short version:</strong> CALCX does not collect, store, or
            share any personal data. Everything happens on your device. No
            accounts, no tracking, no ads.
          </p>
        </div>

        <h3>1. Overview</h3>
        <p>
          CALCX (&quot;the App&quot;, &quot;we&quot;, &quot;us&quot;) is a calculator application available
          as a Progressive Web App (PWA) and as a native Android app. This
          Privacy Policy explains how we handle information when you use the
          App.
        </p>
        <p>
          <strong>Summary:</strong> We do not collect any personal information.
          All calculations, history, and settings are stored locally on your
          device.
        </p>

        <hr />

        <h3>2. Information We Do Not Collect</h3>
        <p>We do <strong>not</strong> collect:</p>
        <ul>
          <li>Your name, email, or any contact information</li>
          <li>Your location or IP address</li>
          <li>Device identifiers or advertising IDs</li>
          <li>Usage analytics or behavioral data</li>
          <li>Calculation history or expressions you enter</li>
          <li>Any data from your camera, microphone, or contacts</li>
        </ul>

        <h3>3. Information Stored Locally on Your Device</h3>
        <p>
          The following data is stored <strong>only on your device</strong> and
          is never transmitted to any server:
        </p>
        <ul>
          <li><strong>Calculation history</strong> — the last 500 expressions and results you have calculated</li>
          <li><strong>Memory value</strong> — the number stored via M+ / M−</li>
          <li><strong>Settings</strong> — theme preference, angle mode, precision, sound/haptic toggles</li>
        </ul>
        <p>
          This data is stored using your browser&apos;s localStorage (for the
          web app) or Android&apos;s WebView storage (for the native app). You
          can clear all of it at any time from Settings → Clear all data.
        </p>

        <h3>4. No Server Communication</h3>
        <p>
          The App performs all calculations <strong>entirely on your device</strong>.
          No expressions, results, or personal data are sent to any server.
        </p>
        <p>
          The only network request the App makes is to <strong>load the app
          itself</strong> from our hosting provider (Vercel) when you first
          open it. After that, the App works completely offline.
        </p>

        <h3>5. No Third-Party Services</h3>
        <p>We do not use:</p>
        <ul>
          <li>Google Analytics or any analytics service</li>
          <li>Advertising networks</li>
          <li>Crash reporting services</li>
          <li>Social media integrations</li>
          <li>Any third-party tracking libraries</li>
        </ul>

        <h3>6. Children&apos;s Privacy</h3>
        <p>
          The App does not collect any data from anyone, including children
          under 13. It is safe for users of all ages.
        </p>

        <h3>7. Permissions</h3>
        <p>
          <strong>Web App (PWA):</strong> The App requests no special browser
          permissions. It may request clipboard access when you tap &quot;Copy&quot; —
          this is a user-initiated action.
        </p>
        <p>
          <strong>Android App:</strong> The App requests only the minimum
          permissions needed to function:
        </p>
        <ul>
          <li><strong>Internet</strong> — to load the app on first launch and check for updates</li>
          <li><strong>Vibrate</strong> — for optional haptic feedback (can be disabled in Settings)</li>
        </ul>
        <p>
          The App does not request access to your camera, microphone, contacts,
          files, or location.
        </p>

        <h3>8. Data Security</h3>
        <p>
          Since we do not collect or transmit any data, there is no risk of
          your information being exposed through a data breach on our end. All
          data stays on your device under your control.
        </p>

        <h3>9. Data Retention and Deletion</h3>
        <p>
          All data (history, memory, settings) stays on your device until you
          delete it. To delete all data:
        </p>
        <ul>
          <li><strong>In the App:</strong> Settings → Clear all data</li>
          <li><strong>Web:</strong> Clear your browser&apos;s storage for this site</li>
          <li><strong>Android:</strong> Uninstall the app, or use Android Settings → Apps → CALCX → Storage → Clear data</li>
        </ul>

        <h3>10. Changes to This Policy</h3>
        <p>
          If we update this Privacy Policy, we will revise the &quot;Last updated&quot;
          date at the top. Continued use of the App after changes constitutes
          acceptance of the updated policy.
        </p>

        <h3>11. Open Source</h3>
        <p>
          CALCX is open source under the MIT License. You can inspect the code
          yourself at{" "}
          <a
            href="https://github.com/foodjunction-hash/calcx"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/foodjunction-hash/calcx
          </a>
          .
        </p>

        <h3>12. Contact</h3>
        <p>
          If you have questions about this Privacy Policy, please open an issue
          on our GitHub repository:
        </p>
        <p>
          <a
            href="https://github.com/foodjunction-hash/calcx/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/foodjunction-hash/calcx/issues
          </a>
        </p>

        <hr />

        <p style={{ textAlign: "center", opacity: 0.6, fontSize: 13 }}>
          CALCX — Premium Calculator
          <br />
          Version 1.0.0 · MIT License · © 2026 CalcX
        </p>
      </div>
    </div>
  );
}
