<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="输入名称搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.telephone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户" prop="customer.id">
              <el-select v-model="form.customer.id" clearable style="width:100%" placeholder="请选择客户">
                <el-option v-for="item in customers" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="账号">
              <el-input v-model="form.account" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户行">
              <el-input v-model="form.bank" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex">
          <el-col :span="24">
            <el-form-item label="信用代码">
              <el-input v-model="form.uscc" :maxlength="18" placeholder="统一社会信用代码" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="customerId" label="客户">
        <template slot-scope="scope">
          {{ scope.row.customer.name }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="telephone" label="电话" />
      <el-table-column prop="account" label="账号" />
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','customerInvoiceInfo:edit','customerInvoiceInfo:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudCustomerInvoiceInfo from '@/api/scm/sales/customerInvoiceInfo'
import { getCustomers } from '@/api/scm/sales/customer'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, customer: { id: null }, name: null, uscc: null, address: null, telephone: null, bank: null, account: null }
export default {
  name: 'CustomerInvoiceInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['customer_status'],
  cruds() {
    return CRUD({ title: '客户开票资料', url: 'api/customerInvoiceInfo', sort: 'id,desc', crudMethod: { ...crudCustomerInvoiceInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'customerInvoiceInfo:add'],
        edit: ['admin', 'customerInvoiceInfo:edit'],
        del: ['admin', 'customerInvoiceInfo:del']
      },
      customers: [],
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '电话不能为空', trigger: 'blur' }
        ],
        'customer.id': [
          { required: true, message: '客户不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.query.customerId = this.$route.params.id
      return true
    },
    [CRUD.HOOK.afterToCU](crud, form) {
      form.customer.id = this.$route.params.id
      this.handleCustomer()
    },
    handleCustomer() {
      this.customers = []
      getCustomers().then(res => {
        this.customers = res.content
      })
    }
  }
}
</script>

<style scoped>
</style>
