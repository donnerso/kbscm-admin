import request from '@/utils/request'

export function getPartList(params) {
  return request({
    url: 'api/part',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/part',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/part/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/part',
    method: 'put',
    data
  })
}

export default { add, edit, del, getPartList }
