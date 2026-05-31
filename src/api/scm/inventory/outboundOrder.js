import request from '@/utils/request'

export function getOutboundOrderList(params) {
  return request({
    url: 'api/outboundOrder',
    method: 'get',
    params
  })
}

export function addOrEdit(data) {
  return request({
    url: 'api/outboundOrder',
    method: data.id ? 'put' : 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/outboundOrder/',
    method: 'delete',
    data: ids
  })
}

export default { addOrEdit, del, getOutboundOrderList }
