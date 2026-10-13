/** Pepita's round avatar. 128px source up to 40px; 256px for retina. */
export default function PepitaAvatar({ size = 32, className = "", decorative = false }: { size?: number; className?: string; decorative?: boolean }) {
  return (
    <img
      src="/images/pepita/avatar-128.webp"
      srcSet="/images/pepita/avatar-128.webp 1x, /images/pepita/avatar-256.webp 2x"
      alt={decorative ? "" : "Pepita"}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      decoding="async"
      className={`inline-block flex-shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      data-testid="pepita-avatar"
    />
  );
}
