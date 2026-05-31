import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'api/receiptNoteItem',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/receiptNoteItem',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/receiptNoteItem/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/receiptNoteItem',
    method: 'put',
    data
  })
}

export default { add, edit, del, getList }
