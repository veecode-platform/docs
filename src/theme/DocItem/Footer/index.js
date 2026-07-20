import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import FeedbackWidget from './FeedbackWidget';

/**
 * Swizzle "wrap" of the theme-classic DocItem/Footer.
 * Renders the original footer (tags row, edit link, last-updated) untouched,
 * then appends the "Was this helpful?" feedback widget below it.
 */
export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <FeedbackWidget />
    </>
  );
}
