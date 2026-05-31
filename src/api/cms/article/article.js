import request from '@/utils/request'

export function getArticleList(params) {
  return request({
    url: 'api/article',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/article',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/article/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/article',
    method: 'put',
    data
  })
}

export default { add, edit, del, getArticleList }
