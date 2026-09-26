import type { HazardProcessEvent } from "../../types/HazardProcessEvent";

const actionText: Record<string, string> = {
  CREATE: "生成",
  DISPATCH: "派单",
  SUBMIT_REVIEW: "提交复验",
  CLOSE: "关闭"
};

export function TimelineList({ events }: { events: HazardProcessEvent[] }) {
  if (!events.length) return <div className="empty">暂无整改过程记录</div>;

  return (
    <ol className="timeline">
      {events.map((event, index) => (
        <li key={`${event.at}-${event.action}-${index}`}>
          <span className="timeline-dot" />
          <div>
            <strong>{actionText[event.action] ?? event.action}</strong>
            <small>{new Date(event.at).toLocaleString("zh-CN", { hour12: false })} · {event.actor}</small>
            {event.note && <p>{event.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
