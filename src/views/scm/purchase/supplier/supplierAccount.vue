<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="输入账户搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in dict.supplier_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
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
            <el-form-item label="账户">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="状态" prop="state">
              <el-radio-group v-model="form.state">
                <el-radio v-for="item in dict.supplier_status" :key="item.id" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model.number="form.sort" :min="0" :max="80" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remarks" :rows="3" type="textarea" />
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
      <el-table-column prop="name" label="账户" />
      <el-table-column prop="account" label="账号" />
      <el-table-column prop="supplierId" label="供应商">
        <template slot-scope="scope">
          {{ scope.row.supplier.name }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态">
        <template slot-scope="scope">
          {{ dict.label.supplier_status[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','supplierAccount:edit','supplierAccount:del']" label="操作" width="150px" align="center">
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
import crudSupplierAccount from '@/api/scm/purchase/supplierAccount'
import { getSupplier } from '@/api/scm/purchase/supplier'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, supplier: { id: null }, bank: null, name: null, account: null, remarks: null, state: 'true', sort: 1 }
export default {
  name: 'SupplierAccount',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['supplier_status'],
  cruds() {
    return CRUD({ title: '供应商银行信息', url: 'api/supplierAccount', sort: 'id,desc', crudMethod: { ...crudSupplierAccount }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'supplierAccount:add'],
        edit: ['admin', 'supplierAccount:edit'],
        del: ['admin', 'supplierAccount:del']
      },
      suppliers: [],
      rules: {
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
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
      form.state = `${form.state}`
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
