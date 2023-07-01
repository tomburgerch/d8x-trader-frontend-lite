import { memo } from 'react';

import styles from './InteractiveLogo.module.scss';

export const InteractiveLogo = memo(() => {
  return (
    <svg
      width="110"
      height="21"
      viewBox="0 0 221 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.root}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.0702 7.77523C86.5066 17.2166 86.4737 32.5594 76.9966 42.0415C68.4214 50.6212 55.0549 51.4627 45.597 44.5555C56.2533 33.671 56.2934 16.2324 45.6812 5.39633C55.1688 -1.55169 68.5319 -0.767616 77.0702 7.77523Z"
        fill="#664ADF"
        className={styles.circle}
      />
      <path
        d="M119.923 47.4458H106.069V2.55418H120.536C124.891 2.55418 128.617 3.45289 131.715 5.25031C134.813 7.03312 137.188 9.59773 138.839 12.9441C140.491 16.2759 141.316 20.2653 141.316 24.9123C141.316 29.5885 140.483 33.6145 138.817 36.9901C137.152 40.3511 134.726 42.9376 131.54 44.7497C128.354 46.5471 124.482 47.4458 119.923 47.4458ZM111.505 42.6235H119.572C123.284 42.6235 126.36 41.9074 128.8 40.4753C131.241 39.0432 133.06 37.0047 134.258 34.3597C135.456 31.7147 136.056 28.5656 136.056 24.9123C136.056 21.2883 135.464 18.1683 134.28 15.5526C133.096 12.9222 131.328 10.9056 128.975 9.50274C126.623 8.08526 123.693 7.37652 120.186 7.37652H111.505V42.6235Z"
        fill="black"
        className={styles.letter}
      />
      <path
        d="M164.025 48.0596C161.015 48.0596 158.355 47.5262 156.046 46.4594C153.752 45.378 151.962 43.8948 150.676 42.0097C149.39 40.11 148.754 37.9473 148.769 35.5215C148.754 33.6218 149.127 31.8682 149.887 30.2607C150.647 28.6387 151.684 27.287 153 26.2056C154.329 25.1096 155.813 24.4155 157.449 24.1232V23.8602C155.301 23.3049 153.591 22.0993 152.32 20.2434C151.049 18.3729 150.42 16.2467 150.435 13.8648C150.42 11.5851 150.997 9.54658 152.167 7.74916C153.336 5.95174 154.943 4.53427 156.989 3.49673C159.049 2.4592 161.395 1.94043 164.025 1.94043C166.626 1.94043 168.95 2.4592 170.996 3.49673C173.041 4.53427 174.649 5.95174 175.818 7.74916C177.002 9.54658 177.601 11.5851 177.615 13.8648C177.601 16.2467 176.95 18.3729 175.665 20.2434C174.393 22.0993 172.705 23.3049 170.601 23.8602V24.1232C172.223 24.4155 173.684 25.1096 174.985 26.2056C176.286 27.287 177.323 28.6387 178.098 30.2607C178.872 31.8682 179.267 33.6218 179.281 35.5215C179.267 37.9473 178.609 40.11 177.308 42.0097C176.023 43.8948 174.232 45.378 171.938 46.4594C169.659 47.5262 167.021 48.0596 164.025 48.0596ZM164.025 43.2372C166.056 43.2372 167.81 42.9084 169.286 42.2508C170.762 41.5932 171.902 40.6653 172.705 39.467C173.509 38.2687 173.918 36.8659 173.933 35.2584C173.918 33.5633 173.48 32.0655 172.618 30.7649C171.756 29.4643 170.579 28.4414 169.089 27.6961C167.613 26.9509 165.925 26.5782 164.025 26.5782C162.111 26.5782 160.401 26.9509 158.896 27.6961C157.405 28.4414 156.229 29.4643 155.367 30.7649C154.519 32.0655 154.103 33.5633 154.117 35.2584C154.103 36.8659 154.49 38.2687 155.279 39.467C156.083 40.6653 157.23 41.5932 158.721 42.2508C160.211 42.9084 161.979 43.2372 164.025 43.2372ZM164.025 21.9312C165.633 21.9312 167.057 21.6097 168.299 20.9668C169.556 20.3238 170.543 19.4251 171.259 18.2706C171.975 17.1162 172.34 15.7645 172.355 14.2155C172.34 12.6957 171.982 11.3732 171.281 10.248C170.579 9.10818 169.607 8.23139 168.365 7.61764C167.123 6.98928 165.676 6.67509 164.025 6.67509C162.345 6.67509 160.876 6.98928 159.619 7.61764C158.363 8.23139 157.391 9.10818 156.704 10.248C156.017 11.3732 155.681 12.6957 155.696 14.2155C155.681 15.7645 156.024 17.1162 156.726 18.2706C157.442 19.4251 158.428 20.3238 159.685 20.9668C160.942 21.6097 162.388 21.9312 164.025 21.9312Z"
        fill="black"
        className={styles.letter}
      />
      <path
        d="M191.102 2.55418L202.675 21.2298H203.026L214.599 2.55418H221L206.884 25L221 47.4458H214.599L203.026 29.1209H202.675L191.102 47.4458H184.701L199.168 25L184.701 2.55418H191.102Z"
        fill="black"
        className={styles.letter}
      />
      <path
        d="M24.229 49.2838C37.6104 49.2838 48.4581 38.4361 48.4581 25.0547C48.4581 11.6734 37.6104 0.825684 24.229 0.825684C10.8477 0.825684 0 11.6734 0 25.0547C0 38.4361 10.8477 49.2838 24.229 49.2838Z"
        fill="black"
      />
    </svg>
  );
});
