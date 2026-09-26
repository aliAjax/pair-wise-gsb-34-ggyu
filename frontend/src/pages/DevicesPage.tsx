import { useEffect, useMemo, useState } from "react";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { DeviceStatus, DeviceStatusText } from "../constants/DeviceStatus";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { EmptyState } from "../components/common/EmptyState";
import { formatDeviceStatus, formatRectifyStatus } from "../utils/formatters";
import type { FireDevice } from "../types/FireDevice";

const ACTION_TEXT: Record<string, string> = {
  DISPATCH: "派单",
  SUBMIT: "提交复验",
  CLOSE: "复验关闭"
};

export function DevicesPage() {
  const { rows, deviceTickets, load, loadDeviceTickets } = useFireDeviceStore();
  const buildings = useBuildingStore((s) => s.rows);
  const loadBuildings = useBuildingStore((s) => s.load);
  const [buildingFilter, setBuildingFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [detail, setDetail] = useState<FireDevice | null>(null);

  useEffect(() => {
    void load();
    void loadBuildings();
  }, [load, loadBuildings]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (buildingFilter !== "ALL" && String(row.building_id) !== buildingFilter) return false;
        return statusFilter === "ALL" || row.status === statusFilter;
      }),
    [rows, buildingFilter, statusFilter]
  );

  const openDetail = (device: FireDevice) => {
    setDetail(device);
    void loadDeviceTickets(device.id);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>消防设备台账</h1>
        </div>
        <StatusBadge value="LEDGER" label="台账" />
      </section>

      <section className="panel wide">
        <div className="filter-bar">
          <label>
            楼栋
            <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
              <option value="ALL">全部</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label>
            状态
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">全部</option>
              {DeviceStatus.map((s) => (
                <option key={s} value={s}>{DeviceStatusText[s]}</option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="暂无符合条件的设备" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>设备编号</th><th>类型</th><th>位置</th><th>状态</th><th>下次维保</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.device_code}</strong></td>
                  <td>{row.device_type}</td>
                  <td><DeviceLocationCell device={row} /></td>
                  <td><StatusBadge value={row.status} label={formatDeviceStatus(row.status)} /></td>
                  <td>{row.next_maintenance_at}</td>
                  <td className="actions">
                    <button onClick={() => openDetail(row)}>详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {detail ? (
        <div className="modal-mask" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{detail.device_code}</h2>
            <p className="modal-sub">
              {detail.building_name} {detail.floor} {detail.location_desc} ·{" "}
              {formatDeviceStatus(detail.status)}
            </p>
            <h3 className="section-title">隐患整改记录</h3>
            {deviceTickets.length === 0 ? (
              <EmptyState title="该设备暂无隐患整改记录" />
            ) : (
              deviceTickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-card-head">
                    <span>整改单 #{ticket.id}</span>
                    <HazardSeverityTag value={ticket.severity} />
                    <StatusBadge value={ticket.rectify_status} label={formatRectifyStatus(ticket.rectify_status)} />
                  </div>
                  <p className="cell-sub">
                    {ticket.item_code} · 责任人 {ticket.owner_name} · 截止 {ticket.deadline}
                    {ticket.overdue ? <span className="overdue-tag">已逾期</span> : null}
                  </p>
                  <TimelineList
                    items={ticket.history.map((h) => ({
                      time: h.at,
                      title: `${h.actor} · ${ACTION_TEXT[h.action] ?? h.action}`,
                      detail: h.detail
                    }))}
                  />
                </div>
              ))
            )}
            <div className="modal-actions">
              <button onClick={() => setDetail(null)}>关闭</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
