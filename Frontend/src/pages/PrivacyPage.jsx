import LegalLayout from "../components/LegalLayout"

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Last updated: 2026. This explains what FAST Connect collects and why. It's a student project, not a company — the goal here is to be genuinely clear, not to bury things in legal language.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>1. What's collected</h2>
      <p>Account info you provide: name, campus email, optional bio and phone number. Content you create: posts, comments, blog entries, messages, uploaded files/resources, event RSVPs, reports you file, and your conversation history with the FAST AI companion.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>2. What's stored automatically</h2>
      <p>Timestamps on everything you create, and basic rate-limiting data (which endpoint you hit and when) used only to prevent abuse — this is stored briefly and isn't tied to your identity beyond the request itself.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>3. Where it's stored</h2>
      <p>Data lives in MongoDB Atlas (database hosting). Uploaded images and files go through Cloudinary. Messages to the FAST AI companion are sent to Google's Gemini API to generate a response. None of these providers see your password — it's hashed before it's ever stored.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>4. Who can see what</h2>
      <p>Posts and profile info are visible per your account's public/private setting. Direct messages are visible only to the two people in the conversation. Admins can see reported content (with the reason and evidence attached) to review it, and can restrict or ban accounts that violate the Terms of Service.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>5. What's never done with your data</h2>
      <p>It isn't sold, and it isn't shared with anyone outside the service providers listed above that the app technically depends on to function.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>6. Your controls</h2>
      <p>Edit your profile any time. Delete individual posts/comments any time. Delete your entire account from Profile & Settings — this removes your posts, comments, and profile info. Friends keep your past messages, shown against a "Deleted Account" label instead of your name.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>7. Local storage</h2>
      <p>Your login session is kept in your browser's local storage as a token, not a cookie. Clearing your browser data logs you out.</p>

      <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>8. Contact</h2>
      <p>Questions about your data can be sent to the developer via the app's feedback feature.</p>
    </LegalLayout>
  )
}

export default PrivacyPage
