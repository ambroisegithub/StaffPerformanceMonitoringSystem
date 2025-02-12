import React from 'react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface MyButtonProps {
  path?: string;
  title: string | JSX.Element;
  styles?: string;
  onClick?: () => void;
  icon?: JSX.Element;
  target?: '_blank' | '_self' | '_parent' | '_top';
  onChange?: React.ChangeEventHandler<HTMLAnchorElement>;
}

function HSButton({
  path,
  onClick,
  title,
  icon,
  styles,
  target,
  onChange,
}: MyButtonProps) {
  return (
    <Link
      target={target}
      type="submit"
      onChange={onChange}
      rel="noopener noreferrer"
      to={path!}
      onClick={onClick}
      className={`${styles} bg-primary text-white px-6 py-3 rounded-md flex justify-center items-center gap-2 text-sm active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in transition-all`}
    >
      {title} {icon}
    </Link>
  );
}

export default HSButton;
