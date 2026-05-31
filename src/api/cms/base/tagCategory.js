import request from '@/utils/request'

export function getTagCategories(params) {
  return request({
    url: 'api/tagCategory',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/tagCategory',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/tagCategory',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/tagCategory',
    method: 'put',
    data
  })
}

export default { add, edit, del, getTagCategories }
