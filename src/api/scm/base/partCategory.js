import request from '@/utils/request'

export function getPartCategories(params) {
  return request({
    url: 'api/partCategory',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/partCategory',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/partCategory/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/partCategory',
    method: 'put',
    data
  })
}

export default { add, edit, del, getPartCategories }
