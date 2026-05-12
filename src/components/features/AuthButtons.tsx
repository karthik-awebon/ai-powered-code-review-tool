import { signIn, signOut, auth } from "../../auth";
import styles from "./AuthButtons.module.css";

/**
 * Server Component that renders sign-in or sign-out buttons based on session state.
 * Adheres to SRP by strictly handling authentication UI and actions.
 */
export async function AuthButtons() {
  const session = await auth();

  if (!session) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button type="submit" className={styles.signInButton}>
          Sign in with GitHub
        </button>
      </form>
    );
  }

  return (
    <div className={styles.userMenu}>
      {session.user?.image && (
        <img
          src={session.user.image}
          alt={session.user.name ?? "User"}
          className={styles.avatar}
        />
      )}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit" className={styles.signOutButton}>
          Sign out
        </button>
      </form>
    </div>
  );
}
