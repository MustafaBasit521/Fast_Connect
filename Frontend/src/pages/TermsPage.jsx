import LegalLayout from "../components/LegalLayout"

function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>Last updated: 2026. FAST Connect is a student-built social platform for the FAST-NUCES Lahore campus community. It is an independent project, not an official university service.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>1. Who can use FAST Connect</h2>
      <p>Accounts are restricted to holders of a valid @lhr.nu.edu.pk email address. You're responsible for keeping your login credentials private and for everything posted from your account.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>2. Your content</h2>
      <p>You keep ownership of what you post (posts, comments, blogs, uploaded files). By posting, you allow FAST Connect to store and display it to other users as the app's features require (e.g. showing your post in the feed, sharing an uploaded resource with classmates who search for it).</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>3. Acceptable use</h2>
      <p>Don't post content that harasses others, is illegal, infringes someone else's rights, or impersonates another person. Don't use the platform to spam or abuse other users. Reported content is reviewed by admins, who may restrict or temporarily/permanently suspend accounts that violate these terms.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>4. The AI companion</h2>
      <p>FAST AI is an AI assistant, not a real person, and not a substitute for professional advice (academic, medical, legal, or otherwise). Conversations with it are stored the same way other account data is (see the Privacy Policy).</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>5. Account deletion</h2>
      <p>You can delete your account at any time from Profile & Settings. This removes your posts, comments, and profile; friends keep any past messages, shown against a "Deleted Account" placeholder rather than your name.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>6. No warranty</h2>
      <p>This is a student project provided as-is, without uptime guarantees. Features may change or break as it's actively developed.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>7. Contact</h2>
      <p>Questions about these terms can be sent to the developer via the app's feedback feature.</p>
    </LegalLayout>
  )
}

export default TermsPage
