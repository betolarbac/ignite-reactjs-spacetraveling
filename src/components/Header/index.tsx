import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <Image src="/assets/logo.png" width={240} height={25} alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
