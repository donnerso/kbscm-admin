import request from '@/utils/request'

export function getSites(params) {
  return request({
    url: 'api/site',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/site',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/site/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/site',
    method: 'put',
    data
  })
}

export default { add, edit, del, getSites }
