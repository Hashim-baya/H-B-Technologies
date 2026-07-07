import styles from "./FloatingWhatsAppButton.module.css";
import { WhatsAppLink } from "./WhatsAppLink";

export function FloatingWhatsAppButton() {
  return (
    <div className={styles.floatingWrap}>
      <WhatsAppLink
        label="WhatsApp"
        ariaLabel="Chat with VIZIA Technologies on WhatsApp"
        className={styles.floatingButton}
      />
    </div>
  );
}
