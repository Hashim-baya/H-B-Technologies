"use client";

import { useMemo, useState } from "react";

import styles from "./ConsultationForm.module.css";
import marketing from "@/styles/marketing.module.css";
import { postConsultation } from "@/lib/api";

type FormState =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function ConsultationForm({
  source,
}: {
  source: "contact" | "book-consultation";
}) {
  const [status, setStatus] = useState<FormState>({ state: "idle" });
  const [consent, setConsent] = useState(false);

  const statusId = `${source}-form-status`;
  const privacyErrorId = `${source}-privacy-error`;
  const isSubmitting = status.state === "submitting";
  const isSuccess = status.state === "success";
  const consentError = status.state === "error" && status.message.includes("privacy statement");

  const statusText = useMemo(() => {
    if (status.state === "submitting") return "Submitting your request.";
    if (status.state === "success") return status.message;
    if (status.state === "error") return status.message;
    return "We respond within 1–2 business days.";
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!consent) {
      setStatus({
        state: "error",
        message: "Please agree to the privacy statement to proceed.",
      });
      return;
    }

    setStatus({ state: "submitting" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      service: String(formData.get("service") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      source,
    };

    try {
      const res = await postConsultation(payload);
      if (!res.ok) {
        setStatus({
          state: "error",
          message: res.error || "Submission failed. Please try again.",
        });
        return;
      }

      setStatus({
        state: "success",
        message:
          "Thanks for reaching out! We've received your inquiry and will respond within 1–2 business days.",
      });

      setConsent(false);
      try {
        form.reset();
      } catch {
        // Ignore reset errors; submission already succeeded.
      }
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please try again.",
      });
    }
  }

  return (
    <form
      className={marketing.form}
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-describedby={statusId}
    >
      <div className={marketing.field}>
        <label className={marketing.label} htmlFor={`${source}-name`}>
          Full name
        </label>
        <input
          className={marketing.input}
          id={`${source}-name`}
          name="name"
          autoComplete="name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className={marketing.field}>
        <label className={marketing.label} htmlFor={`${source}-email`}>
          Email
        </label>
        <input
          className={marketing.input}
          id={`${source}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className={marketing.field}>
        <label className={marketing.label} htmlFor={`${source}-phone`}>
          Phone (optional)
        </label>
        <input
          className={marketing.input}
          id={`${source}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          disabled={isSubmitting}
        />
      </div>

      <div className={marketing.field}>
        <label className={marketing.label} htmlFor={`${source}-company`}>
          Company / organization (optional)
        </label>
        <input
          className={marketing.input}
          id={`${source}-company`}
          name="company"
          autoComplete="organization"
          disabled={isSubmitting}
        />
      </div>

      <div className={marketing.field}>
        <label className={marketing.label} htmlFor={`${source}-service`}>
          Service area
        </label>
        <select
          className={marketing.select}
          id={`${source}-service`}
          name="service"
          required
          defaultValue=""
          disabled={isSubmitting}
          aria-describedby={`${source}-service-help`}
        >
          <option value="" disabled>
            Select one
          </option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile App Development">Mobile App Development</option>
          <option value="Cyber Security">Cyber Security</option>
          <option value="Data Science">Data Science</option>
          <option value="Network Engineering">Network Engineering</option>
          <option value="Automation Systems">Automation Systems</option>
          <option value="IoT Solutions">IoT Solutions</option>
          <option value="Smart CCTV Installation">Smart CCTV Installation</option>
          <option value="IT Consultation">IT Consultation</option>
          <option value="Artificial Intelligence (AI)">
            Artificial Intelligence (AI)
          </option>
          <option value="Machine Learning (ML)">Machine Learning (ML)</option>
          <option value="Natural Language Processing (NLP)">
            Natural Language Processing (NLP)
          </option>
        </select>
        <div className={marketing.hint} id={`${source}-service-help`}>
          We&apos;ll scope requirements, risks, and a delivery plan.
        </div>
      </div>

      <div className={marketing.field}>
        <label className={marketing.label} htmlFor={`${source}-message`}>
          Message
        </label>
        <textarea
          className={marketing.textarea}
          id={`${source}-message`}
          name="message"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.consentField}>
        <input
          type="checkbox"
          id={`${source}-consent`}
          name="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={isSubmitting}
          className={styles.consentCheckbox}
          aria-invalid={consentError}
          aria-describedby={consentError ? privacyErrorId : undefined}
        />
        <label htmlFor={`${source}-consent`} className={styles.consentLabel}>
          I agree to have my information stored for the purpose of responding to my inquiry and providing related updates.
        </label>
      </div>

      <button
        className="btn btnPrimary"
        type="submit"
        disabled={isSubmitting || isSuccess}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner} /> Submitting…
          </>
        ) : isSuccess ? (
          "✓ Submitted"
        ) : (
          "Submit"
        )}
      </button>

      <div
        id={statusId}
        className={`${styles.status} ${status.state === "error" ? styles.error : status.state === "success" ? styles.success : ""}`}
        role={status.state === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>

      {consentError ? (
        <div id={privacyErrorId} className={`${styles.status} ${styles.error}`} role="alert">
          Please agree to the privacy statement to proceed.
        </div>
      ) : null}
    </form>
  );
}
