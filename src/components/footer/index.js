import React from 'react';
import Logo from '/img/assets/logo.png';
import styles from '../../css/footer.module.css';
import { FaDiscord, FaFacebookSquare, FaGooglePlusSquare, FaInstagram, FaLinkedin, FaTwitterSquare, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <section className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.logo}>
            <img src={Logo} alt="" />
            <div className={styles.logo__socials}>
              <a
                href="https://www.linkedin.com/showcase/veecode-platform/"
                target="_blank"
              >
                <FaLinkedin />
              </a>
              <a href="https://twitter.com/veecodeplatform" target="_blank">
                <FaXTwitter />
              </a>
              <a href="https://discord.gg/pREwxeVzAD" target="_blank">
                <FaDiscord />
              </a>
              <a
                href="https://www.youtube.com/@veecodeplatform-br"
                target="_blank"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
          <div className={styles.details}>
            {/* website */}
            <ul className={styles.details__item}>
              <li>
                <strong>WebSite</strong>
              </li>
              <li>
                <a href="https://platform.vee.codes/">VeeCode Platform</a>
              </li>
            </ul>
            {/* devportal */}
            <ul className={styles.details__item}>
              <li>
                <strong>Devportal</strong>
              </li>
              <li>
                <a href="/devportal/installation-guide">Instalation Guide</a>
              </li>
              <li>
                <a href="/devportal/concepts/catalog">Concepts</a>
              </li>
              <li>
                <a href="/devportal/plugins">Plugins</a>
              </li>
              <li>
                <a href="/devportal/troubleshooting">Troubleshooting</a>
              </li>
            </ul>
            {/* admin ui */}
            <ul className={styles.details__item}>
              <li>
                <strong>Admin UI</strong>
              </li>
              <li>
                <a href="/admin-ui/Config/ssl">Config</a>
              </li>
              <li>
                <a href="/admin-ui/Settings/general">Settings</a>
              </li>
            </ul>
            {/* more */}
            <ul className={styles.details__item}>
              <li>
                <strong>More</strong>
              </li>
              <li>
                <a
                  href="https://github.com/veecode-platform/support/discussions"
                  target="_blank"
                >
                  Join our Comunity
                </a>
              </li>
              <li>
                <a 
                  href="https://platform.vee.codes/contact-us/"  
                  target="_blank">
                    Contact Us
                </a>
              </li>
              <li>
                <a
                  href="https://blog.platform.vee.codes/"
                  target="_blank"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.copy}>
          <p>
            Copyright © {new Date().getFullYear()} VeeCode Platform, Inc. Built
            with Docusaurus.
          </p>
        </div>
      </section>
    </footer>
  );
}

export default Footer