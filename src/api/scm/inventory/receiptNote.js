import request from '@/utils/request'

export function getReceiptNoteList(params) {
  return request({
    url: 'api/receiptNote',
    method: 'get',
    params
  })
}

export function addOrEdit(data) {
  return request({
    url: 'api/receiptNote',
    method: data.id ? 'put' : 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/receiptNote/',
    method: 'delete',
    data: ids
  })
}

export default { addOrEdit, del, getReceiptNoteList }
