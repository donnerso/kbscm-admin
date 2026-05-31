import request from '@/utils/request'

export function getChannels(params) {
  return request({
    url: 'api/channel',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/channel',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/channel/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/channel',
    method: 'put',
    data
  })
}

export default { add, edit, del, getChannels }
