<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="输入仓位名称搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in dict.stock_place_status" :key="item.id" :label="item.label" :value="item.value" />
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
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编号" prop="stockPlaceNo">
              <el-input v-model="form.stockPlaceNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="22">
            <el-form-item label="状态" prop="state">
              <el-radio-group v-model="form.state">
                <el-radio v-for="item in dict.stock_place_status" :key="item.id" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="仓库" prop="warehouse.id">
              <el-select v-model="form.warehouse.id" clearable style="width: 100%" placeholder="请选择仓库">
                <el-option v-for="item in warehouses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model.number="form.sort" :min="0" :max="80" style="width: 100%" controls-position="right" />
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
      <el-table-column prop="stockPlaceNo" label="编号" />
      <el-table-column prop="warehouseId" label="仓库">
        <template slot-scope="scope">
          {{ scope.row.warehouse.name }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态">
        <template slot-scope="scope">
          {{ dict.label.stock_place_status[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','stockPlace:edit','stockPlace:del']" label="操作" width="150px" align="center">
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
import crudStockPlace from '@/api/scm/base/stockPlace'
import { getWarehouses } from '@/api/scm/base/warehouse'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, stockPlaceNo: null, name: null, warehouse: { id: null }, state: 'true', sort: 1 }
export default {
  name: 'StockPlace',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['stock_place_status'],
  cruds() {
    return CRUD({ title: '仓位', url: 'api/stockPlace', sort: 'id,desc', crudMethod: { ...crudStockPlace }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'stockPlace:add'],
        edit: ['admin', 'stockPlace:edit'],
        del: ['admin', 'stockPlace:del']
      },
      warehouses: [],
      rules: {
        stockPlaceNo: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
        'warehouse.id': [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.query.warehouseId = this.$route.params.id
      return true
    },
    [CRUD.HOOK.afterToCU](crud, form) {
      form.warehouse.id = this.$route.params.id
      form.state = `${form.state}`
      this.handleWarehouses()
    },
    handleWarehouses() {
      this.warehouses = []
      getWarehouses().then(res => {
        this.warehouses = res.content
      })
    }
  }
}
</script>

<style scoped>
</style>
