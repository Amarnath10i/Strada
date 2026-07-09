import "./Logo.css";

/**
 * Strada wordmark, set in WindSong: an airy, wide-spread script face
 * whose capital S carries a big natural flourish, so no separate mark
 * is needed — the word itself is the logo.
 */
export default function Logo({ className = "" }) {
  return <span className={`logo ${className}`}>Strada</span>;
}
