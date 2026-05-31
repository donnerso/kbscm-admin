import request from '@/utils/request'

export function getWarehouses(params) {
  return request({
    url: 'api/warehouse',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/warehouse',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/warehouse/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/warehouse',
    method: 'put',
    data
  })
}

export default { add, edit, del, getWarehouses }
