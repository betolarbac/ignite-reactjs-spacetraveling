import Link from 'next/link';

import styles from './exit-preview.module.scss';

export default function ExitPreview(): JSX.Element {
  return (
    <footer className={styles.exitPreviewContainer}>
      <Link href="/api/exit-preview">
        <button className={styles.exitPreviewButton} type="button">
          Sair do modo Preview
        </button>
      </Link>
    </footer>
  );
}
