<template>
  <div class="app-container">
    <div style="margin-bottom: 20px;">
      <el-button :loading="saveLoad" type="primary" @click="handleNoteSave">确认</el-button>
      <el-button type="primary" @click="handleAdd">增行</el-button>
    </div>
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-row type="flex" :gutter="15">
        <el-col :span="8">
          <el-form-item label="单据编号" prop="billNo">
            <el-input v-model="form.billNo" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单据日期" prop="billDate">
            <el-date-picker v-model="form.billDate" type="datetime" placeholder="选择日期时间" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="仓库" prop="warehouse.id">
            <el-select v-model="form.warehouse.id" clearable style="width: 100%" placeholder="请选择仓库">
              <el-option v-for="item in warehouses" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="15">
        <el-col :span="8">
          <el-form-item label="状态" prop="state">
            <el-select v-model="form.state" clearable style="width: 100%" placeholder="状态">
              <el-option v-for="item in dict.receipt_note_status" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="备注">
            <el-input v-model="form.remarks" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="15">
        <el-col :span="24">
          <el-form-item id="form">
            <el-table ref="table" v-loading="tableLoad" :data="form.items" size="small" style="width: 100%;" @selection-change="selection">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="partId" label="物料">
                <template slot-scope="scope">
                  <span>{{ scope.row.part.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="batchNo" label="批号" />
              <el-table-column prop="qty" label="数量" />
              <el-table-column prop="state" label="状态">
                <template slot-scope="scope">
                  <span>{{ handleFindState(scope.row.state) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="stockPlaceId" label="仓位">
                <template slot-scope="scope">
                  <span>{{ scope.row.stockPlace.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150px" align="center">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)" />
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDel(scope.row)" />
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <noteItem v-if="itemVisable" :data="itemObject" @create="handleItemCreate" @update="handleItemUpdate" @cancel="handleItemCancel" />
  </div>
</template>

<script>
import crudReceiptNote from '@/api/scm/inventory/receiptNote'
import { getWarehouses } from '@/api/scm/base/warehouse'
import noteItem from './item'
export default {
  name: 'Note',
  components: { noteItem },
  dicts: ['receipt_note_status'],
  data() {
    return {
      form: { id: null, billNo: null, billDate: null, receiptType: 2, relatedBillId: '', warehouse: { id: null }, remarks: null, state: 'true', items: [] },
      permission: {
        add: ['admin', 'receiptNote:add'],
        edit: ['admin', 'receiptNote:edit'],
        del: ['admin', 'receiptNote:del']
      }, tableLoad: false,
      warehouses: [], delLoading: false, itemVisable: false, saveLoad: false,
      itemObject: { part: { id: null }, stockPlace: { id: null }},
      stateTypeOptions: [
        { key: 0, display_name: '不合格' },
        { key: 1, display_name: '合格' },
        { key: 2, display_name: '紧急放行' },
        { key: 3, display_name: '待检' },
        { key: 4, display_name: '返工返修' },
        { key: 5, display_name: '降级使用' }
      ],
      rules: {
        billNo: [
          { required: true, message: '单据编号不能为空', trigger: 'blur' }
        ],
        billDate: [
          { required: true, message: '单据日期不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        'warehouse.id': [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
  },
  created() {
    this.$nextTick(() => {
      this.form = { id: null, billNo: null, billDate: null, receiptType: 2, relatedBillId: '', warehouse: { id: null }, remarks: null, state: 'true', items: [] }
      if (this.$route.params.data) {
        this.form = Object.assign({}, this.$route.params.data)
        this.form.state = `${this.form.state}`
      }
      this.handleWarehouse()
    })
  },
  methods: {
    handleWarehouse() {
      this.warehouse = []
      getWarehouses().then(res => {
        this.warehouses = res.content
      })
    },
    handleAdd() {
      this.itemVisable = true
    },
    handleFindState(index) {
      const o = this.stateTypeOptions.find(e => e.key === index)
      return o.display_name
    },
    handleEdit(data) {
      this.itemObject = data
      this.itemVisable = true
    },
    handleDel(data) {
      this.form.items = this.form.items.filter(el => el.id !== data.id || el.billNo !== data.billNo)
    },
    selection(z) { console.log(z) },
    handleItemCreate(obj) {
      this.form.items.push(obj)
      this.itemObject = { part: { id: null }, stockPlace: { id: null }}
      this.itemVisable = false
    },
    handleItemUpdate(obj) {
      const p = this.form.items.findIndex(item => {
        return item.id === obj.id || item.batchNo === obj.batchNo
      })
      this.form.items.splice(p, 1)
      this.form.items.splice(p, 0, obj)
      this.itemObject = { part: { id: null }, stockPlace: { id: null }}
      this.itemVisable = false
    },
    handleNoteSave() {
      this.$refs['form'].validate(val => {
        if (!val) { return }
        this.saveLoad = true
        crudReceiptNote.addOrEdit(this.form)
          .then(res => {
            this.$notify('保存成功', 'success')
          }).catch(err => {
            console.error('错误', err)
          }).finally(() => {
            this.saveLoad = false
          })
      })
    },
    handleItemCancel() {
      this.itemObject = { part: { id: null }, stockPlace: { id: null }}
      this.itemVisable = false
    }
  }
}
</script>

<style lang="scss" scoped>
#form {
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
