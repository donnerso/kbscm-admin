import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'api/outboundOrderItem',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/outboundOrderItem',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/outboundOrderItem/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/outboundOrderItem',
    method: 'put',
    data
  })
}

export default { add, edit, del, getList }
