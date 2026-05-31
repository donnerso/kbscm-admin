import request from '@/utils/request'

export function getStockPlaceList(params) {
  return request({
    url: 'api/stockPlace',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/stockPlace',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/stockPlace/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/stockPlace',
    method: 'put',
    data
  })
}

export default { add, edit, del, getStockPlaceList }
