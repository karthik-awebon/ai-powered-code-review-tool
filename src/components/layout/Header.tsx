import Link from "next/link";
import { AuthButtons } from "../features/AuthButtons";
import styles from "./Header.module.css";

/**
 * Header component that provides navigation and authentication controls.
 * Adheres to SRP by focusing on layout and delegating auth logic to AuthButtons.
 */
export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        AI Reviewer
      </Link>
      <AuthButtons />
    </header>
  );
}
