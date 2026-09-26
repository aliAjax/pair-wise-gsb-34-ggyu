export const maintenanceOwners = [
  { id: 101, name: "张伟", vendor: "安盾消防维保" },
  { id: 102, name: "李娜", vendor: "安盾消防维保" },
  { id: 103, name: "王强", vendor: "江城消防工程" },
  { id: 104, name: "赵敏", vendor: "江城消防工程" }
] as const;

export const ownerNameById = (ownerId: number) =>
  maintenanceOwners.find((owner) => owner.id === ownerId)?.name ?? (ownerId > 0 ? `责任人 ${ownerId}` : "未派单");
