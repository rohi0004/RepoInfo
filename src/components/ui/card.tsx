import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-lg ${className}`}
    >
      {children}
    </div>
  );
}
