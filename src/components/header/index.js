import React, { useState } from "react";
import styles from '../../css/header.module.css';
import Logo from '/img/assets/icon.png';
import { FaBars, FaGithub } from "react-icons/fa";
import classNames from "classnames";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <header className={styles.header}>
        <section className={styles.navbar}>
          {/* Button Mobile */}
          <button className={styles.navbar__mobileButton}
           onClick={()=>setIsOpen(!isOpen)}
          >
            <FaBars/>
          </button>
            <div className={styles.logo}>
            <a href="https://platform.vee.codes/" target='_blank'>
              <img src={Logo} alt="" className={styles.logo__image}/>
            </a>
            </div>
            <ul role="nav" className={styles.navbar__menu}>
              <li><a href="/" className={styles.active}>Platform</a></li>
              <li><a href="/devportal/intro">Devportal</a></li>
              <li><a href="/admin-ui/intro">Admin-UI</a></li>
              <li><a href="/vkdr/intro">VKDR-CLI</a></li>
            </ul>
            {/* Mobile */}
            <ul role="nav" className={
              classNames({
                [styles.menuMobileShow] : isOpen,
                [styles.menuMobileHide] : !isOpen
              })
            }>
              <li><a href="/" className={styles.active}>Platform</a></li>
              <li><a href="/devportal/intro">Devportal</a></li>
              <li><a href="/admin-ui/intro">Admin-UI</a></li>
            </ul>
        </section>
        <section className={styles.githubLink}>
              <a href="https://github.com/veecode-platform/support/discussions" target='_blank'><FaGithub className={styles.githubLink__icon}/></a>
        </section>
      </header>
    );
  }

  export default Header;