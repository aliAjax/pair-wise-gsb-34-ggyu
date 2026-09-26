import { useEffect, useMemo, useState } from "react";
import { useHazardFlow } from "../hooks/useHazardFlow";
import { usePagination } from "../hooks/usePagination";
import { listStaff } from "../api/Staff";
import { HazardSeverity } from "../constants/HazardSeverity";
import { RectifyStatus, RectifyStatusText } from "../constants/RectifyStatus";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { TimelineList } from "../components/common/TimelineList";
import { EmptyState } from "../components/common/EmptyState";
import { formatRectifyStatus } from "../utils/formatters";
import type { Staff } from "../types/Staff";

const ACTION_TEXT: Record<string, string> = {
  DISPATCH: "派单",
  SUBMIT: "提交复验",
  CLOSE: "复验关闭"
};

export function HazardsPage() {
  const flow = useHazardFlow();
  const [owners, setOwners] = useState<Staff[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    listStaff("MAINTAINER").then(setOwners);
  }, []);

  const filtered = useMemo(
    () =>
      flow.rows.filter((row) => {
        if (statusFilter === "OVERDUE") return row.overdue;
        if (statusFilter !== "ALL" && row.rectify_status !== statusFilter) return false;
        return severityFilter === "ALL" || row.severity === severityFilter;
      }),
    [flow.rows, statusFilter, severityFilter]
  );
  const { page, setPage, pageSize, pageRows, total } = usePagination(filtered);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>隐患整改</h1>
        </div>
        {flow.canDispatch ? (
          <button className="primary" onClick={flow.openDispatch}>派发整改单</button>
        ) : null}
      </section>

      <section className="metrics">
        <StatCard label="未关闭整改单" value={flow.stats.open} />
        <StatCard label="逾期整改单" value={flow.stats.overdue} />
        <StatCard label="待复验" value={flow.stats.submitted} />
      </section>

      <section className="panel wide">
        <div className="filter-bar">
          <label>
            状态
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="ALL">全部</option>
              <option value="OVERDUE">仅逾期</option>
              {RectifyStatus.map((s) => (
                <option key={s} value={s}>{RectifyStatusText[s]}</option>
              ))}
            </select>
          </label>
          <label>
            严重程度
            <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}>
              <option value="ALL">全部</option>
              {HazardSeverity.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        {flow.error ? <p className="error-banner">{flow.error}</p> : null}

        {pageRows.length === 0 ? (
          <EmptyState title="暂无符合条件的整改单" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>单号</th><th>设备</th><th>异常项</th><th>严重程度</th>
                <th>责任人</th><th>截止日期</th><th>状态</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className={row.overdue ? "row-overdue" : ""}>
                  <td>#{row.id}</td>
                  <td>
                    <strong>{row.device_code}</strong>
                    <span className="cell-sub">{row.building_name} {row.floor} {row.location_desc}</span>
                  </td>
                  <td>
                    {row.item_code}
                    <span className="cell-sub">{row.result_note}</span>
                  </td>
                  <td><HazardSeverityTag value={row.severity} /></td>
                  <td>{row.owner_name}</td>
                  <td>
                    {row.deadline}
                    {row.overdue ? <span className="overdue-tag">已逾期</span> : null}
                  </td>
                  <td><StatusBadge value={row.rectify_status} label={formatRectifyStatus(row.rectify_status)} /></td>
                  <td className="actions">
                    {flow.canSubmit && row.rectify_status === "OPEN" ? (
                      <button onClick={() => flow.openSubmit(row)}>填写整改</button>
                    ) : null}
                    {flow.canClose && row.rectify_status === "SUBMITTED" ? (
                      <button onClick={() => flow.doClose(row)}>复验关闭</button>
                    ) : null}
                    <button onClick={() => flow.setTraceTarget(row)}>过程</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
          <span>{page} / {pageCount}</span>
          <button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>下一页</button>
        </div>
      </section>

      {flow.dispatchOpen ? (
        <div className="modal-mask" onClick={() => flow.setDispatchOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>派发隐患整改单</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void flow.doDispatch().catch(() => undefined);
              }}
            >
              <label>
                异常巡检项
                <select
                  required
                  value={flow.dispatchForm.result_id}
                  onChange={(e) => flow.setDispatchForm({ ...flow.dispatchForm, result_id: Number(e.target.value) })}
                >
                  <option value={0} disabled>请选择异常项</option>
                  {flow.dispatchable.map((d) => (
                    <option key={d.result_id} value={d.result_id}>
                      {d.device_code} · {d.item_code} · {d.note}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                责任人
                <select
                  required
                  value={flow.dispatchForm.owner_id}
                  onChange={(e) => flow.setDispatchForm({ ...flow.dispatchForm, owner_id: Number(e.target.value) })}
                >
                  <option value={0} disabled>请选择维保人员</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </label>
              <label>
                严重程度
                <select
                  value={flow.dispatchForm.severity}
                  onChange={(e) => flow.setDispatchForm({ ...flow.dispatchForm, severity: e.target.value })}
                >
                  {HazardSeverity.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                截止日期
                <input
                  type="date"
                  required
                  value={flow.dispatchForm.deadline}
                  onChange={(e) => flow.setDispatchForm({ ...flow.dispatchForm, deadline: e.target.value })}
                />
              </label>
              {flow.error ? <p className="error-banner">{flow.error}</p> : null}
              <div className="modal-actions">
                <button type="button" onClick={() => flow.setDispatchOpen(false)}>取消</button>
                <button type="submit" className="primary">派单</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {flow.submitTarget ? (
        <div className="modal-mask" onClick={() => flow.setSubmitTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>填写整改并提交复验</h2>
            <p className="modal-sub">
              #{flow.submitTarget.id} · {flow.submitTarget.device_code} · {flow.submitTarget.item_code}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void flow.doSubmit().catch(() => undefined);
              }}
            >
              <label>
                处理说明
                <textarea
                  required
                  rows={4}
                  placeholder="说明整改措施、更换部件与复测结果"
                  value={flow.submitForm.rectify_note}
                  onChange={(e) => flow.setSubmitForm({ rectify_note: e.target.value })}
                />
              </label>
              {flow.error ? <p className="error-banner">{flow.error}</p> : null}
              <div className="modal-actions">
                <button type="button" onClick={() => flow.setSubmitTarget(null)}>取消</button>
                <button type="submit" className="primary">提交复验</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {flow.traceTarget ? (
        <div className="modal-mask" onClick={() => flow.setTraceTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>整改过程追溯</h2>
            <p className="modal-sub">
              #{flow.traceTarget.id} · {flow.traceTarget.device_code} ·{" "}
              {formatRectifyStatus(flow.traceTarget.rectify_status)}
            </p>
            <TimelineList
              items={flow.traceTarget.history.map((h) => ({
                time: h.at,
                title: `${h.actor} · ${ACTION_TEXT[h.action] ?? h.action}`,
                detail: h.detail
              }))}
            />
            <div className="modal-actions">
              <button onClick={() => flow.setTraceTarget(null)}>关闭</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
