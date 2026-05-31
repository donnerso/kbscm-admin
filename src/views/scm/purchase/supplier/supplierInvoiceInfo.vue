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
            <el-form-item label="供应商" prop="supplier.id">
              <el-select v-model="form.supplier.id" clearable style="width:100%" placeholder="请选择供应商">
                <el-option v-for="item in suppliers" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="信用代码">
              <el-input v-model="form.uscc" :maxlength="18" placeholder="统一社会信用代码" />
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
            <el-form-item label="电话" prop="telephone">
              <el-input v-model="form.telephone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户行">
              <el-input v-model="form.bank" />
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
            <el-form-item label="税率" prop="taxRate">
              <el-input-number v-model.number="form.taxRate" :min="0" :max="100" :step="0.1" style="width: 100%" controls-position="right" />
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
      <el-table-column prop="supplierId" label="供应商">
        <template slot-scope="scope">
          {{ scope.row.supplier.name }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="uscc" label="统一社会信用代码" />
      <el-table-column prop="telephone" label="电话" />
      <el-table-column prop="taxRate" label="税率" />
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','supplierInvoiceInfo:edit','supplierInvoiceInfo:del']" label="操作" width="150px" align="center">
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
import crudSupplierInvoiceInfo from '@/api/scm/purchase/supplierInvoiceInfo'
import { getSupplier } from '@/api/scm/purchase/supplier'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, supplier: { id: null }, name: null, uscc: null, address: null, telephone: null, bank: null, account: null, taxRate: null }
export default {
  name: 'SupplierInvoiceInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['supplier_status'],
  cruds() {
    return CRUD({ title: '供应商开票资料', url: 'api/supplierInvoiceInfo', sort: 'id,desc', crudMethod: { ...crudSupplierInvoiceInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'supplierInvoiceInfo:add'],
        edit: ['admin', 'supplierInvoiceInfo:edit'],
        del: ['admin', 'supplierInvoiceInfo:del']
      },
      suppliers: [],
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '地址不能为空', trigger: 'blur' }
        ],
        telephone: [
          { required: true, message: '电话不能为空', trigger: 'blur' }
        ],
        taxRate: [
          { required: true, message: '税率不能为空', trigger: 'blur' }
        ],
        'supplier.id': [
          { required: true, message: '供应商不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.query.supplierId = this.$route.params.id
      return true
    },
    [CRUD.HOOK.afterToCU](crud, form) {
      form.supplier.id = this.$route.params.id
      this.handleSupplier()
    },
    handleSupplier() {
      this.suppliers = []
      getSupplier().then(res => {
        this.suppliers = res.content
      })
    }
  }
}
</script>

<style scoped>
</style>
