import { useEffect, useMemo, useState } from "react";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { HazardSeverity, HazardSeverityText } from "../constants/HazardSeverity";
import { maintenanceOwners, ownerNameById } from "../constants/maintenanceOwners";
import { useHazardFlow } from "../hooks/useHazardFlow";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicket } from "../types/HazardTicket";
import type { InspectionResult } from "../types/InspectionResult";
import { formatDate, formatDateTime } from "../utils/formatters";

function isOverdue(ticket: HazardTicket) {
  return ticket.rectify_status !== "CLOSED" && new Date(`${ticket.deadline}T23:59:59`) < new Date();
}

function HazardActions({ ticket, onChanged }: { ticket: HazardTicket; onChanged: () => Promise<void> }) {
  const dispatchTicket = useHazardTicketStore((state) => state.dispatch);
  const submitReview = useHazardTicketStore((state) => state.submitReview);
  const closeTicket = useHazardTicketStore((state) => state.close);
  const [ownerId, setOwnerId] = useState(ticket.owner_id || maintenanceOwners[0].id);
  const [severity, setSeverity] = useState<(typeof HazardSeverity)[number]>(
    HazardSeverity.includes(ticket.severity as (typeof HazardSeverity)[number])
      ? (ticket.severity as (typeof HazardSeverity)[number])
      : "MEDIUM"
  );
  const [deadline, setDeadline] = useState(ticket.deadline);
  const [rectifyNote, setRectifyNote] = useState(ticket.rectify_note);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
      await onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "操作失败");
    }
  };

  if (ticket.rectify_status === "CLOSED") {
    return <small className="muted">关闭时间：{formatDateTime(ticket.closed_at)}</small>;
  }

  if (ticket.rectify_status === "PENDING") {
    return (
      <div className="action-stack">
        <label>
          责任人
          <select value={ownerId} onChange={(event) => setOwnerId(Number(event.target.value))}>
            {maintenanceOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>{owner.name}（{owner.vendor}）</option>
            ))}
          </select>
        </label>
        <label>
          严重程度
          <select value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)}>
            {HazardSeverity.map((value) => <option key={value} value={value}>{HazardSeverityText[value]}</option>)}
          </select>
        </label>
        <label>
          截止日期
          <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </label>
        <button className="primary" disabled={!deadline} onClick={() => run(() => dispatchTicket(ticket.id, { owner_id: ownerId, severity, deadline }))}>
          {ticket.rectify_status === "PENDING" ? "主管派单" : "调整派单"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  if (ticket.rectify_status === "ASSIGNED") {
    return (
      <div className="action-stack">
        <textarea
          value={rectifyNote}
          placeholder="维保人员填写处理说明，例如更换部件、复测结果"
          onChange={(event) => setRectifyNote(event.target.value)}
        />
        <button className="primary" onClick={() => run(() => submitReview(ticket.id, { rectify_note: rectifyNote }))}>
          提交复验
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  if (ticket.rectify_status === "REVIEW_PENDING") {
    return (
      <div className="action-stack">
        <p className="note-preview">{ticket.rectify_note}</p>
        <button className="primary" onClick={() => run(() => closeTicket(ticket.id))}>主管确认并关闭</button>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="action-stack">
      <textarea
        value={rectifyNote}
        placeholder="维保人员填写处理说明，例如更换部件、复测结果"
        onChange={(event) => setRectifyNote(event.target.value)}
      />
      <button className="primary" onClick={() => run(() => submitReview(ticket.id, { rectify_note: rectifyNote }))}>
        提交复验
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export function HazardsPage() {
  const { rows, loading, load: loadTickets } = useHazardTicketStore();
  const { rows: devices, load: loadDevices } = useFireDeviceStore();
  const { rows: results, load: loadResults } = useInspectionResultStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { pageRows, sortedRows, overdueCount, openCount, total } = useHazardFlow(rows);

  useEffect(() => {
    void Promise.all([loadTickets(), loadDevices(), loadResults()]);
  }, [loadTickets, loadDevices, loadResults]);

  const deviceById = useMemo(() => new Map(devices.map((device) => [device.id, device])), [devices]);
  const resultById = useMemo(() => new Map(results.map((result) => [result.id, result])), [results]);
  const refresh = async () => {
    await Promise.all([loadTickets(), loadDevices()]);
  };

  return (
    <main className="page business-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">Hazard Rectification</p>
          <h1>隐患整改</h1>
          <p>异常巡检项派单、维保整改、复验关闭全流程闭环；同一异常项未关闭前只保留一张整改单。</p>
        </div>
      </section>

      <section className="metrics four">
        <div className="stat"><span>整改单总数</span><strong>{total}</strong></div>
        <div className="stat"><span>未关闭</span><strong>{openCount}</strong></div>
        <div className="stat"><span>逾期优先处理</span><strong className="danger-text">{overdueCount}</strong></div>
        <div className="stat"><span>列表排序</span><strong>逾期优先</strong></div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <div>
            <h2>整改单列表</h2>
            <p>责任人、严重程度和截止日期直接在列表处理；逾期单自动排在最前面。</p>
          </div>
          {loading && <StatusBadge value="READY" />}
        </div>

        <div className="card-table hazard-table">
          <div className="table-head">
            <span>设备 / 异常项</span><span>严重程度</span><span>责任人</span><span>截止日期</span><span>状态</span><span>整改操作</span>
          </div>
          {pageRows.map((ticket) => {
            const result = resultById.get(ticket.result_id) as InspectionResult | undefined;
            const device = result ? deviceById.get(result.device_id) as FireDevice | undefined : undefined;
            const expanded = expandedId === ticket.id;
            return (
              <div className="table-row-group" key={ticket.id}>
                <div className="table-row">
                  <div className="device-cell">
                    {device && <DeviceLocationCell device={device} />}
                    <small>{result?.item_code}：{result?.note}</small>
                  </div>
                  <HazardSeverityTag value={ticket.severity} />
                  <span>{ownerNameById(ticket.owner_id)}</span>
                  <span>
                    {formatDate(ticket.deadline)}
                    {isOverdue(ticket) && <em className="overdue">已逾期</em>}
                  </span>
                  <StatusBadge value={ticket.rectify_status} />
                  <HazardActions ticket={ticket} onChanged={refresh} />
                </div>
                <button className="trace-toggle" onClick={() => setExpandedId(expanded ? null : ticket.id)}>
                  {expanded ? "收起整改过程" : "查看整改过程"}
                </button>
                {expanded && <TimelineList events={ticket.process_events} />}
              </div>
            );
          })}
          {!sortedRows.length && <div className="empty">暂无异常巡检项和整改单</div>}
        </div>
      </section>
    </main>
  );
}
