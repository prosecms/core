import { cache } from "react";
import twemoji from "twemoji";

type Props = {
  emoji: string;
  className?: string;
};

export default function Twemoji({ emoji, className }: Props) {
  const parseEmoji = cache((name: string) =>
    twemoji.parse(name, {
      folder: "svg",
      ext: ".svg",
    })
  );

  return (
    <span
      className={`w-5 h-5 ${className}`}
      dangerouslySetInnerHTML={{
        __html: parseEmoji(emoji),
      }}
    />
  );
}
