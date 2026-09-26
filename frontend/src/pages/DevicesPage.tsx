import { useEffect, useMemo, useState } from "react";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { ownerNameById } from "../constants/maintenanceOwners";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicket } from "../types/HazardTicket";
import { formatDate } from "../utils/formatters";

function DeviceDetail({ deviceId, onClose }: { deviceId: number; onClose: () => void }) {
  const { detail, loadDetail, loading } = useFireDeviceStore();

  useEffect(() => {
    void loadDetail(deviceId);
  }, [deviceId, loadDetail]);

  if (loading || !detail || detail.id !== deviceId) return <section className="panel detail-drawer">加载设备详情...</section>;

  return (
    <section className="panel detail-drawer">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Device Trace</p>
          <h2>{detail.device_code}</h2>
          <p>{detail.building_name} · {detail.floor} · {detail.location_desc}</p>
        </div>
        <button onClick={onClose}>关闭详情</button>
      </div>

      <div className="detail-status-row">
        <StatusBadge value={detail.status} />
        <span>下次维保：{formatDate(detail.next_maintenance_at)}</span>
      </div>

      <h3>异常巡检项</h3>
      <div className="result-list">
        {detail.results.map((result) => (
          <article key={result.id}>
            <strong>{result.item_code}</strong>
            <p>{result.note}</p>
            <small>实测：{result.measured_value}</small>
          </article>
        ))}
      </div>

      <h3>整改过程追溯</h3>
      {detail.hazard_tickets.length ? (
        <div className="trace-list">
          {detail.hazard_tickets.map((ticket) => {
            const result = detail.results.find((row) => row.id === ticket.result_id);
            return (
              <div className="trace-card" key={ticket.id}>
                <header>
                  <strong>整改单 #{ticket.id} · {result?.item_code ?? "异常巡检项"}</strong>
                  <HazardSeverityTag value={ticket.severity} />
                  <StatusBadge value={ticket.rectify_status} />
                  <span>责任人：{ownerNameById(ticket.owner_id)}</span>
                  <span>截止：{formatDate(ticket.deadline)}</span>
                </header>
                {ticket.rectify_note && <p className="note-preview">{ticket.rectify_note}</p>}
                <TimelineList events={ticket.process_events} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">暂无整改记录</div>
      )}
    </section>
  );
}

export function DevicesPage() {
  const { rows, load } = useFireDeviceStore();
  const { rows: hazards, load: loadHazards } = useHazardTicketStore();
  const { rows: results, load: loadResults } = useInspectionResultStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    void Promise.all([load(), loadHazards(), loadResults()]);
  }, [load, loadHazards, loadResults]);

  const lastOpenTicketByDevice = useMemo(() => {
    const resultById = new Map(results.map((result) => [result.id, result]));
    const map = new Map<number, HazardTicket>();
    hazards
      .filter((ticket) => ticket.rectify_status !== "CLOSED")
      .forEach((ticket) => {
        const result = resultById.get(ticket.result_id);
        if (result) map.set(result.device_id, ticket);
      });
    return map;
  }, [hazards, results]);

  return (
    <main className="page business-page devices-layout">
      <section className="page-head">
        <div>
          <p className="eyebrow">Fire Device Ledger</p>
          <h1>消防设备台账</h1>
          <p>设备最后一张未关闭整改单复验关闭后，设备状态自动回到正常。</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <div>
            <h2>设备列表</h2>
            <p>点击“追溯整改”查看异常巡检项及对应整改过程。</p>
          </div>
        </div>
        <div className="card-table">
          <div className="table-head">
            <span>设备位置</span><span>台账状态</span><span>未关闭整改</span><span>责任人 / 截止</span><span>下次维保</span><span></span>
          </div>
          {rows.map((device: FireDevice) => {
            const openTicket = lastOpenTicketByDevice.get(device.id);
            return (
              <div className="table-row" key={device.id}>
                <DeviceLocationCell device={device} />
                <StatusBadge value={device.status} />
                <span>{openTicket ? `#${openTicket.id}` : "无"}</span>
                <span>{openTicket ? `${ownerNameById(openTicket.owner_id)} / ${formatDate(openTicket.deadline)}` : "—"}</span>
                <span>{formatDate(device.next_maintenance_at)}</span>
                <button className="secondary" onClick={() => setSelectedId(device.id)}>追溯整改</button>
              </div>
            );
          })}
        </div>
      </section>

      {selectedId !== null && <DeviceDetail deviceId={selectedId} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
