import React from 'react';
import Link from '@docusaurus/Link';

export default function DocCard({ children, title, link, style }) {
  return (
    <Link to={link} className={style.card}>
      <div className={style.titlebar}>
        <h3 className={style.title}>{title}</h3>
      </div>
      <p className={style.desc}>{children}</p>
    </Link>
  );
}
