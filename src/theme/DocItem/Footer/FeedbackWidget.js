import React, {useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Translate, {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Emits a generic, backend-agnostic analytics signal. Every sink is
 * optional-chained / feature-detected, so this is a no-op today and starts
 * reporting automatically the moment an analytics provider is plugged in.
 */
function emitFeedback(value, metadata) {
  const payload = {
    value, // 'yes' | 'no'
    doc_id: metadata?.id,
    doc_path: metadata?.permalink,
    doc_title: metadata?.title,
  };

  // Google Analytics (gtag.js) — no-op until gtag is defined.
  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'doc_feedback', payload);

    // Google Tag Manager / generic dataLayer.
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({event: 'doc_feedback', ...payload});
    }

    // Framework-agnostic DOM event any listener can subscribe to.
    document.dispatchEvent(
      new CustomEvent('veecode:doc-feedback', {detail: payload}),
    );
  }
}

export default function FeedbackWidget() {
  const {metadata} = useDoc();
  const [submitted, setSubmitted] = useState(false);

  const handleVote = (value) => {
    if (submitted) {
      return;
    }
    setSubmitted(true);
    emitFeedback(value, metadata);
  };

  return (
    <div
      className={styles.feedback}
      role="group"
      aria-label={translate({
        id: 'theme.docItem.feedback.groupLabel',
        message: 'Page feedback',
        description: 'Accessible label for the feedback widget group',
      })}>
      {submitted ? (
        <p className={styles.thanks} role="status">
          <Translate
            id="theme.docItem.feedback.thanks"
            description="Message shown after the user submits feedback">
            Thanks for your feedback!
          </Translate>
        </p>
      ) : (
        <>
          <p className={styles.prompt}>
            <Translate
              id="theme.docItem.feedback.prompt"
              description="Prompt asking whether the page was helpful">
              Was this helpful?
            </Translate>
          </p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.button}
              onClick={() => handleVote('yes')}
              aria-label={translate({
                id: 'theme.docItem.feedback.yesLabel',
                message: 'Yes, this page was helpful',
                description: 'Accessible label for the positive feedback button',
              })}>
              <span aria-hidden="true">👍</span>
              <Translate
                id="theme.docItem.feedback.yes"
                description="Positive feedback button text">
                Yes
              </Translate>
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => handleVote('no')}
              aria-label={translate({
                id: 'theme.docItem.feedback.noLabel',
                message: 'No, this page was not helpful',
                description: 'Accessible label for the negative feedback button',
              })}>
              <span aria-hidden="true">👎</span>
              <Translate
                id="theme.docItem.feedback.no"
                description="Negative feedback button text">
                No
              </Translate>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
