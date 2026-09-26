import { EmptyState } from "./EmptyState";
import { formatDate } from "../../utils/formatters";

export interface TimelineItem {
  time: string;
  title: string;
  detail?: string;
}

export function TimelineList({ items, empty = "暂无整改记录" }: { items: TimelineItem[]; empty?: string }) {
  if (!items.length) return <EmptyState title={empty} />;
  return (
    <ul className="timeline">
      {items.map((item, index) => (
        <li key={index}>
          <span className="timeline-time">{formatDate(item.time)}</span>
          <strong>{item.title}</strong>
          {item.detail ? <p>{item.detail}</p> : null}
        </li>
      ))}
    </ul>
  );
}
