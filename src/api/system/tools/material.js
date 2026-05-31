import request from '@/utils/request'

export function getMaterials(query) {
  return request({
    url: 'api/material',
    method: 'get',
    params: query
  })
}

export function add(data) {
  return request({
    url: 'api/material',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/material/' + ids,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/material',
    method: 'put',
    data
  })
}

export default { add, edit, del, getMaterials }
