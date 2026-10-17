import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export default function Icon({
  name,
  size = 24,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <use href={`/sprite.svg#${name}`} />
    </svg>
  );
}
