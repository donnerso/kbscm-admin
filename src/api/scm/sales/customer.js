import request from '@/utils/request'

export function getCustomers(params) {
  return request({
    url: 'api/customer',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/customer',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/customer/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/customer',
    method: 'put',
    data
  })
}

export default { add, edit, del, getCustomers }
