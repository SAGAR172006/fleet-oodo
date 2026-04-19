import axios from "axios";

export async function listRecords(collection, businessKey) {
  const res = await axios.get(`/api/data/${collection}`, { params: { businessKey } });
  return res.data.items || [];
}

export async function createRecord(collection, payload) {
  const res = await axios.post(`/api/data/${collection}`, payload);
  return res.data.item;
}

export async function updateRecord(collection, id, payload) {
  const res = await axios.put(`/api/data/${collection}/${id}`, payload);
  return res.data.item;
}

export async function deleteRecord(collection, id) {
  const res = await axios.delete(`/api/data/${collection}/${id}`);
  return res.data;
}
