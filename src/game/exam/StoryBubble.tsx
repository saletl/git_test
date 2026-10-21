import { useEffect } from 'react';
import { TalkIcon } from '../../icons/UiIcons';

export interface BubbleMessage {
  kind: 'story' | 'prompt';
  text: string;
  key: number;
}

/**
 * A short speech bubble for a grown-up to read aloud: the patient's story at the start,
 * and now and then an optional idea to talk about or take turns. Tap it to hide it; play never waits for it.
 */
export function StoryBubble({ message, onDone }: { message: BubbleMessage; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, message.kind === 'story' ? 8000 : 9000);
    return () => window.clearTimeout(t);
  }, [message, onDone]);
  return (
    <button
      type="button"
      key={message.key}
      className={`story-bubble story-bubble--${message.kind}`}
      onClick={onDone}
      aria-label={`${message.text} Tap to hide.`}
    >
      {message.kind === 'prompt' ? <TalkIcon className="story-bubble__icon" /> : null}
      <span className="story-bubble__text" aria-hidden="true">
        {message.text}
      </span>
    </button>
  );
}
