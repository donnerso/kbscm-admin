import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/customerAccount',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/customerAccount/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/customerAccount',
    method: 'put',
    data
  })
}

export default { add, edit, del }
