import request from '@/utils/request'

export function getGroups(query) {
  return request({
    url: 'api/materialGroup',
    method: 'get',
    params: query
  })
}

export function add(data) {
  return request({
    url: 'api/materialGroup',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/materialGroup/' + ids,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/materialGroup',
    method: 'put',
    data
  })
}

export default { add, edit, del, getGroups }
